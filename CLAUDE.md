# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Axoregal** — PWA "Tinder pour trouver un restaurant" à usage interne entreprise. Les utilisateurs se connectent via SSO, swipent des catégories de cuisine, matchent avec des collègues et coordonnent le choix d'un restaurant via un chat de groupe.

Voir `doc/overview.md` pour le concept complet et les questions ouvertes, `doc/stories.md` pour les stories, `doc/architecture.md` pour les décisions techniques.

## Commandes

```bash
npm run dev        # Serveur de développement Vite (HMR)
npm run build      # Build de production (génère dist/ + PWA assets)
npm run preview    # Prévisualise le build de production localement
npm run lint       # ESLint
npm run test       # Vitest (mode watch)
npm run test:run   # Vitest (run once, CI)
```

## Stack & Architecture

- **React 18 + Vite** — pas de Next.js, pas de SSR. Application SPA pure.
- **vite-plugin-pwa** — génère le service worker Workbox et le manifest. Config dans `vite.config.ts`.
- **React Router v6** — routing côté client. Les routes sont déclarées dans `src/main.tsx`.
- **TanStack Query** — toutes les requêtes API passent par des hooks `useQuery`/`useMutation`, jamais de `fetch` direct dans les composants.
- **Framer Motion** — animations de swipe, transitions de page, écran "It's a match". Ne pas mélanger avec des animations CSS ad hoc sur les mêmes éléments.
- **CSS Modules** — un fichier `.module.css` par composant. Les tokens de design (couleurs, typo, border-radius CupHead) sont centralisés dans `src/design/tokens.css` et consommés via variables CSS.

## Auth SSO

Le flow est OpenID Connect. Après redirect et callback, le token JWT est stocké dans `sessionStorage` (jamais `localStorage` — risque XSS). Toutes les requêtes API partent avec `Authorization: Bearer <token>`. Le hook `useAuth` (`src/hooks/useAuth.ts`) expose `user`, `isAuthenticated` et `logout`.

## Logique de matching

Le matching fonctionne sur une **fenêtre temporelle configurable** (variable d'env `VITE_MATCH_WINDOW_START` / `VITE_MATCH_WINDOW_END`). Pendant cette fenêtre, le client poll `/api/match/status` toutes les 10 secondes via TanStack Query. Un match est déclenché côté serveur quand ≥2 utilisateurs ont swipé à droite la même catégorie. En dehors de la fenêtre, le swipe est possible mais aucun match n'est déclenché.

## Personnages animés

Les sprites des catégories (burger, sushi, pizza…) sont des **spritesheets CSS** dans `src/assets/characters/`. L'animation frame-by-frame est pilotée par `@keyframes` avec `steps()`. Les animations de transition (chargement, match) utilisent des fichiers **Lottie JSON** lus via `lottie-react`.

## Variables d'environnement

```
VITE_API_BASE_URL          URL de l'API backend
VITE_SSO_CLIENT_ID         Client ID OpenID Connect
VITE_SSO_AUTHORITY         URL de l'IdP (ex: https://login.entreprise.com)
VITE_MATCH_WINDOW_START    Heure début matching (ex: "11:00")
VITE_MATCH_WINDOW_END      Heure fin matching  (ex: "11:45")
```

Copier `.env.example` en `.env.local` pour le développement local.

## Contraintes de design

Le style est **CupHead** : couleurs saturées, contours noirs épais (2–3px), typographie rétro, animations saccadées (pas de courbes ease fluides). Tout écart doit être délibéré. Les tokens visuels sont dans `src/design/tokens.css` — ne pas hardcoder de couleurs dans les composants.

## PWA

Le manifest (`name`, `short_name`, `theme_color`, icônes) est configuré dans `vite.config.ts` via `VitePWA`. Ne pas éditer `public/manifest.json` directement — il est généré au build. Les icônes sources sont dans `public/icons/`.
