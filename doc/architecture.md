# Architecture technique — Axoregal

## Stack retenue

| Couche | Technologie | Justification |
|---|---|---|
| Build | **Vite** | Fast HMR, config minimale, plugin PWA officiel |
| UI | **React 18** | Écosystème swipe riche (react-spring, framer-motion) |
| PWA | **vite-plugin-pwa** | Génère manifest + service worker Workbox automatiquement |
| Auth | **SSO entreprise** (OpenID Connect recommandé) | Récupération profil/avatar via token JWT |
| Animations | **Framer Motion** | API déclarative, gestes tactiles natifs, performances |
| Chat temps réel | **WebSocket** (ex: Socket.io) ou **SSE** | À confirmer selon infra backend |
| HTTP | **TanStack Query** | Cache, loading states, invalidation simple |
| Routing | **React Router v6** | Standard, support PWA |
| Style | **CSS Modules** ou **Tailwind** + variables CSS custom | Tokens de design CupHead centralisés |

---

## Structure de projet suggérée

```
src/
├── assets/
│   ├── characters/        # Sprites animés (burger, sushi…) — GIF ou Lottie
│   └── sounds/            # Effets sonores optionnels
├── components/
│   ├── SwipeCard/         # Carte swipable + personnage animé
│   ├── MatchScreen/       # Page "It's a match !"
│   ├── BottomNav/         # Barre de navigation
│   ├── Chat/              # Interface chat
│   └── RestaurantSearch/  # Recherche filtrée
├── pages/
│   ├── LoadingPage.tsx    # Écran de chargement 2s
│   ├── SwipePage.tsx
│   ├── MatchPage.tsx
│   ├── ChatPage.tsx
│   └── SearchPage.tsx
├── hooks/
│   ├── useSwipe.ts        # Logique de gesture
│   ├── useMatching.ts     # Polling/WS pour détection de match
│   └── useAuth.ts         # SSO token + profil
├── services/
│   ├── auth.ts
│   ├── matching.ts
│   ├── chat.ts
│   └── restaurants.ts
└── design/
    └── tokens.css         # Palette, typo, border-radius CupHead
```

---

## PWA — Configuration Vite

```ts
// vite.config.ts (extrait)
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Axoregal',          // ← à confirmer
    short_name: 'Axoregal',
    theme_color: '#FF6B35',    // ← couleur CupHead
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

---

## Flux d'authentification SSO

```
App → redirect vers IdP entreprise (OpenID Connect)
IdP → retourne code + id_token (profil, avatar URL)
App → stocke le token (sessionStorage, pas localStorage)
App → envoie le token dans Authorization: Bearer <token> sur chaque requête API
```

---

## Logique de matching (proposition)

```
Session de matching : fenêtre configurable (ex: 11h00 → 11h45)

Toutes les X secondes, le client poll /api/match/status
  ↓
Le backend regroupe les utilisateurs par catégorie swipée à droite
  ↓
Si un groupe atteint le seuil minimum (ex: 2 personnes) → match créé
  ↓
Réponse 200 { matched: true, group: {...} } → afficher "It's a match !"
```

**Alternative WebSocket** : plus réactif, à préférer si l'infra le supporte.

---

## Personnages animés — Format recommandé

| Option | Avantage | Inconvénient |
|---|---|---|
| **Lottie** (JSON) | Léger, vectoriel, contrôlable en code | Nécessite un outil export (After Effects, LottieFiles) |
| GIF | Simple, universel | Lourd, pas de contrôle programmatique |
| CSS Keyframes | 0 dépendance, performant | Long à coder pour des animations complexes |
| Spritesheet + CSS | Performant, CupHead-like | Requiert asset prep rigoureuse |

**Recommandation** : Spritesheet CSS pour le style CupHead authentique (animations frame-by-frame), Lottie pour les animations de transition (match, chargement).

---

## Points d'attention

- **iOS PWA** : les push notifications restent limitées (iOS 16.4+ seulement via Web Push). Prévoir un fallback in-app.
- **Accessibilité swipe** : toujours proposer des boutons alternatifs aux gestes.
- **Sécurité** : ne jamais stocker le token SSO dans localStorage (XSS). Utiliser sessionStorage ou cookie httpOnly côté BFF.
- **CORS** : si l'API backend est sur un domaine différent, configurer correctement les origines.
