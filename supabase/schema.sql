-- ============================================================
-- Axoregal — reset complet + recréation du schéma
-- ⚠️  Supprime toutes les données existantes
-- ============================================================

-- Supprime les tables dans l'ordre (clés étrangères)
DROP TABLE IF EXISTS public.contests      CASCADE;
DROP TABLE IF EXISTS public.messages      CASCADE;
DROP TABLE IF EXISTS public.swipes        CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups        CASCADE;
DROP TABLE IF EXISTS public.profiles      CASCADE;

-- Supprime les fonctions
DROP FUNCTION IF EXISTS public.sync_profile()       CASCADE;
DROP FUNCTION IF EXISTS public.check_and_create_match() CASCADE;
DROP FUNCTION IF EXISTS public.create_group(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.join_random_group(UUID)        CASCADE;
DROP FUNCTION IF EXISTS public.accept_contest(UUID)           CASCADE;
DROP FUNCTION IF EXISTS public.finish_contest(UUID, INT, INT) CASCADE;

-- Supprime les policies Storage
DROP POLICY IF EXISTS "Avatars lisibles par tous"              ON storage.objects;
DROP POLICY IF EXISTS "Utilisateur uploade son propre avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Utilisateur met à jour son propre avatar" ON storage.objects;

-- ============================================================
-- Profils utilisateurs
-- ============================================================

CREATE TABLE public.profiles (
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
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email      = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_upsert
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile();

-- ============================================================
-- Groupes
-- ============================================================

CREATE TABLE public.groups (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  category_id  TEXT NOT NULL,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groupes visibles par tous les connectés"
  ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Utilisateur crée un groupe"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Chef peut modifier son groupe"
  ON public.groups FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE TABLE public.group_members (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id  UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membres visibles par tous les connectés"
  ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Utilisateur rejoint un groupe"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilisateur quitte son groupe"
  ON public.group_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- ============================================================
-- Swipes
-- ============================================================

CREATE TABLE public.swipes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id     UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  direction    TEXT CHECK (direction IN ('left', 'right')) NOT NULL,
  swiped_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE (user_id, group_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Swipes visibles par tous les connectés"
  ON public.swipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Chaque utilisateur gère ses swipes"
  ON public.swipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Chaque utilisateur modifie ses swipes"
  ON public.swipes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- Messages
-- ============================================================

CREATE TABLE public.messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id   UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages visibles par les membres du groupe"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = messages.group_id AND gm.user_id = auth.uid()
    )
  );
CREATE POLICY "Membres peuvent envoyer des messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = messages.group_id AND gm.user_id = auth.uid()
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================
-- RPC : créer un groupe
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_group(
  p_user_id  UUID,
  p_name     TEXT,
  p_category TEXT
)
RETURNS TABLE(group_id UUID) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_group_id UUID;
BEGIN
  INSERT INTO public.groups (name, category_id, created_by, session_date)
  VALUES (p_name, p_category, p_user_id, CURRENT_DATE)
  RETURNING id INTO v_group_id;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group_id, p_user_id);

  RETURN QUERY SELECT v_group_id;
END;
$$;

-- ============================================================
-- RPC : rejoindre un groupe aléatoire
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_random_group(p_user_id UUID)
RETURNS TABLE(group_id UUID, category_id TEXT, group_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_group_id    UUID;
  v_category_id TEXT;
  v_name        TEXT;
BEGIN
  SELECT g.id, g.category_id, g.name
  INTO v_group_id, v_category_id, v_name
  FROM public.groups g
  WHERE g.session_date = CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM public.swipes s
      WHERE s.group_id = g.id AND s.user_id = p_user_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = p_user_id
    )
  ORDER BY RANDOM()
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.swipes (user_id, group_id, direction, session_date)
  VALUES (p_user_id, v_group_id, 'right', CURRENT_DATE)
  ON CONFLICT (user_id, group_id) DO NOTHING;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group_id, p_user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN QUERY SELECT v_group_id, v_category_id, v_name;
END;
$$;

-- ============================================================
-- Contests (Alpha Contest)
-- ============================================================

CREATE TABLE public.contests (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id         UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  challenger       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chef             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status           TEXT CHECK (status IN ('pending','accepted','declined','running','finished')) NOT NULL DEFAULT 'pending',
  challenger_score INT,
  chef_score       INT,
  winner           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  finished_at      TIMESTAMPTZ
);

ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contests visibles par les membres"
  ON public.contests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = contests.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Membre peut lancer un défi"
  ON public.contests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger);

CREATE POLICY "Participants peuvent mettre à jour le contest"
  ON public.contests FOR UPDATE TO authenticated
  USING (auth.uid() = challenger OR auth.uid() = chef);

ALTER PUBLICATION supabase_realtime ADD TABLE public.contests;

-- RPC : le chef accepte le défi
CREATE OR REPLACE FUNCTION public.accept_contest(p_contest_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.contests
  SET status = 'accepted'
  WHERE id = p_contest_id
    AND chef = auth.uid()
    AND status = 'pending';
END;
$$;

-- RPC : finalise le contest et transfère le titre de chef
CREATE OR REPLACE FUNCTION public.finish_contest(
  p_contest_id       UUID,
  p_challenger_score INT,
  p_chef_score       INT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contest public.contests%ROWTYPE;
  v_winner  UUID;
BEGIN
  SELECT * INTO v_contest FROM public.contests WHERE id = p_contest_id;
  IF v_contest.status NOT IN ('accepted', 'running') THEN RETURN; END IF;

  -- Égalité → challenger gagne
  IF p_challenger_score >= p_chef_score THEN
    v_winner := v_contest.challenger;
  ELSE
    v_winner := v_contest.chef;
  END IF;

  UPDATE public.contests
  SET status           = 'finished',
      challenger_score = p_challenger_score,
      chef_score       = p_chef_score,
      winner           = v_winner,
      finished_at      = NOW()
  WHERE id = p_contest_id;

  UPDATE public.groups
  SET created_by = v_winner
  WHERE id = v_contest.group_id;
END;
$$;

-- ============================================================
-- Storage : policies pour le bucket "avatars"
-- (créer le bucket manuellement : Storage > New bucket > "avatars" > Public)
-- ============================================================

CREATE POLICY "Avatars lisibles par tous"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Utilisateur uploade son propre avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Utilisateur met à jour son propre avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
