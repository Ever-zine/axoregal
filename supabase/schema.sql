-- ============================================================
-- Axoregal — schéma initial
-- ============================================================

-- Profils utilisateurs (miroir de auth.users, peuplé par trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       TEXT NOT NULL,
  avatar_url TEXT,
  email      TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profils visibles par tous les connectés"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Chaque utilisateur gère son propre profil"
  ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);

-- Trigger : création/mise à jour du profil à chaque connexion SSO
CREATE OR REPLACE FUNCTION public.sync_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email, 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    name       = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    email      = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_upsert
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile();

-- Swipes journaliers
CREATE TABLE IF NOT EXISTS public.swipes (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT    NOT NULL,
  direction   TEXT    CHECK (direction IN ('left', 'right')) NOT NULL,
  swiped_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_date DATE   DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE (user_id, category_id, session_date)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Swipes visibles par tous les connectés"
  ON public.swipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Chaque utilisateur gère ses swipes"
  ON public.swipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Chaque utilisateur modifie ses swipes"
  ON public.swipes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Activer Realtime sur swipes (pour les avatars en temps réel)
ALTER PUBLICATION supabase_realtime ADD TABLE public.swipes;
