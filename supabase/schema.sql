-- ============================================================
-- Axoregal — schéma complet
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
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID    REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id  TEXT    NOT NULL,
  direction    TEXT    CHECK (direction IN ('left', 'right')) NOT NULL,
  swiped_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_date DATE    DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE (user_id, category_id, session_date)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Swipes visibles par tous les connectés"
  ON public.swipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Chaque utilisateur gère ses swipes"
  ON public.swipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Chaque utilisateur modifie ses swipes"
  ON public.swipes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.swipes;

-- ============================================================
-- Groupes formés par matching
-- ============================================================

CREATE TABLE IF NOT EXISTS public.groups (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groupes visibles par tous les connectés"
  ON public.groups FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.group_members (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id  UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membres visibles par tous les connectés"
  ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Système insère les membres"
  ON public.group_members FOR INSERT TO authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- ============================================================
-- Trigger de matching : crée/met à jour un groupe dès que
-- ≥2 utilisateurs ont swipé droite sur la même catégorie
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_group_id  UUID;
  v_user_ids  UUID[];
BEGIN
  IF NEW.direction != 'right' THEN
    RETURN NEW;
  END IF;

  SELECT ARRAY_AGG(user_id) INTO v_user_ids
  FROM public.swipes
  WHERE category_id   = NEW.category_id
    AND direction     = 'right'
    AND session_date  = NEW.session_date;

  IF array_length(v_user_ids, 1) < 2 THEN
    RETURN NEW;
  END IF;

  -- Réutilise le groupe du jour s'il existe déjà pour cette catégorie
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE category_id  = NEW.category_id
    AND session_date = NEW.session_date
  LIMIT 1;

  IF v_group_id IS NULL THEN
    INSERT INTO public.groups (category_id, session_date)
    VALUES (NEW.category_id, NEW.session_date)
    RETURNING id INTO v_group_id;
  END IF;

  -- Ajoute tous les swipeurs droite au groupe (idempotent)
  INSERT INTO public.group_members (group_id, user_id)
  SELECT v_group_id, u FROM UNNEST(v_user_ids) AS u
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_swipe_match
  AFTER INSERT OR UPDATE ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.check_and_create_match();

-- ============================================================
-- RPC : rejoindre un groupe aléatoire (Surprends-moi)
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_random_group(p_user_id UUID)
RETURNS TABLE(group_id UUID, category_id TEXT) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_group_id    UUID;
  v_category_id TEXT;
  v_categories  TEXT[] := ARRAY['burger','sushi','pizza','tacos','ramen','salade','poulet','steak'];
BEGIN
  -- 1. Cherche un groupe du jour auquel l'utilisateur n'appartient pas encore
  SELECT g.id, g.category_id INTO v_group_id, v_category_id
  FROM public.groups g
  WHERE g.session_date = CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id
    )
  ORDER BY RANDOM()
  LIMIT 1;

  -- 2. Si aucun groupe dispo, crée-en un avec une catégorie aléatoire
  IF v_group_id IS NULL THEN
    v_category_id := v_categories[1 + floor(random() * array_length(v_categories, 1))::int];
    INSERT INTO public.groups (category_id, session_date)
    VALUES (v_category_id, CURRENT_DATE)
    RETURNING id INTO v_group_id;
  END IF;

  -- 3. Ajoute l'utilisateur
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group_id, p_user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN QUERY SELECT v_group_id, v_category_id;
END;
$$;
