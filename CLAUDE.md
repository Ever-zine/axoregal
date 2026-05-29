# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Axoregal** — PWA "Tinder pour trouver un restaurant" à usage interne entreprise. Les utilisateurs se connectent via SSO, swipent des catégories de cuisine, matchent avec des collègues et coordonnent le choix d'un restaurant via un chat de groupe.

Voir `doc/overview.md` pour le concept complet et les questions ouvertes, `doc/stories.md` pour les stories, `doc/architecture.md` pour les décisions techniques.

## Commandes

```bash
pnpm dev        # Serveur de développement Vite (HMR)
pnpm build      # Build de production (génère dist/ + PWA assets)
pnpm preview    # Prévisualise le build de production localement
pnpm lint       # ESLint
pnpm test       # Vitest (mode watch)
pnpm test:run   # Vitest (run once, CI)
```

## Stack & Architecture

- **React 18 + Vite** — SPA pure, pas de SSR.
- **Supabase** (`src/lib/supabase.ts`) — client singleton utilisé partout. Couvre l'auth, la base de données (PostgreSQL), le Realtime (WebSocket managé pour le chat et les matchs) et le storage.
- **vite-plugin-pwa** — génère le service worker Workbox et le manifest. Config dans `vite.config.ts`.
- **React Router v6** — routes déclarées dans `src/App.tsx`.
- **TanStack Query** — requêtes ponctuelles (restaurants, profils). Le Realtime Supabase remplace le polling pour les matchs et le chat — ne pas utiliser TanStack Query pour ces deux features.
- **Framer Motion** — animations de swipe, transitions de page, écran "It's a match". Ne pas mélanger avec des animations CSS ad hoc sur les mêmes éléments.
- **CSS Modules** — un `.module.css` par composant. Tokens de design CupHead centralisés dans `src/design/tokens.css`, consommés via variables CSS. Ne jamais hardcoder de couleurs dans les composants.

## Auth Supabase SSO

Flow : `supabase.auth.signInWithSSO({ domain })` → redirect IdP → callback `/auth/callback` → `supabase.auth.exchangeCodeForSession()`.

Supabase gère le token et son refresh automatiquement. L'état de session est exposé via `AuthProvider` (`src/providers/AuthProvider.tsx`) qui écoute `supabase.auth.onAuthStateChange`. Le hook `useAuth()` expose `user`, `isAuthenticated`, `isLoading`, `login`, `logout`.

Le profil utilisateur (nom, avatar) vient de `user.user_metadata` — les clés varient selon le provider SSO (`full_name`, `name`, `avatar_url`, `picture`). La normalisation est dans `toAuthUser()` dans `AuthProvider.tsx`.

Supabase SAML SSO requiert le plan **Team ou Enterprise**. Pour les tests en dev, utiliser un provider OAuth (Google, GitHub) configuré dans le dashboard Supabase.

## Schéma Supabase

Le schéma est dans `supabase/schema.sql`. Tables principales :
- `profiles` — miroir de `auth.users`, peuplé automatiquement par le trigger `sync_profile` à chaque connexion SSO.
- `swipes` — swipes journaliers par utilisateur et catégorie. Contrainte `UNIQUE (user_id, category_id, session_date)` pour éviter les doublons.

Le Realtime est activé sur `swipes` pour mettre à jour les avatars en temps réel sur les cartes.

## Logique de matching

Fenêtre temporelle configurable (`VITE_MATCH_WINDOW_START` / `VITE_MATCH_WINDOW_END`). La détection de match se fait via **Supabase Realtime** sur la table `matches` — pas de polling. Un match est créé côté backend (Edge Function ou trigger PostgreSQL) quand ≥2 utilisateurs ont swipé la même catégorie dans la fenêtre.

## Chat

Implémenté via **Supabase Realtime channels** (`supabase.channel('chat:group_id')`), pas de WebSocket custom ni Socket.io.

## Personnages animés

Spritesheets CSS dans `src/assets/characters/` — animation frame-by-frame via `@keyframes` + `steps()` (style CupHead authentique). Lottie (`lottie-react`) uniquement pour les animations de transition (chargement, match).

## Variables d'environnement

```
VITE_SUPABASE_URL          URL du projet Supabase
VITE_SUPABASE_ANON_KEY     Clé publique anon Supabase
VITE_SSO_DOMAIN            Domaine entreprise pour SAML SSO (ex: entreprise.com)
VITE_MATCH_WINDOW_START    Heure début matching (ex: "11:00")
VITE_MATCH_WINDOW_END      Heure fin matching  (ex: "11:45")
```

Copier `.env.example` en `.env.local` pour le développement local.

## PWA

Le manifest (`name`, `short_name`, `theme_color`, icônes) est configuré dans `vite.config.ts` via `VitePWA`. Ne pas éditer `public/manifest.json` directement — il est généré au build. Les icônes sources sont dans `public/icons/`.
