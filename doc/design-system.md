# Axoregal — Design System

Style : **CupHead** — couleurs saturées, contours noirs épais (3–4 px), ombres offset dures, animations saccadées `steps()`, typographie display bold.

---

## Palette

| Token CSS | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#1A0A00` | Fond global |
| `--color-surface` | `#2D1200` | Cards, inputs, surfaces secondaires |
| `--color-primary` | `#FF6B35` | CTA principaux, éléments actifs |
| `--color-secondary` | `#FFD700` | Titres, badges, indicateurs actifs |
| `--color-accent` | `#FF1744` | Refus, erreurs, badges NOPE |
| `--color-success` | `#00E676` | Validation, match, badge LIKE |
| `--color-text` | `#FFF5E1` | Texte courant |
| `--color-muted` | `#B08060` | Texte secondaire, placeholders |

## Typographie

| Classe | Font | Usage |
|---|---|---|
| `font-display` | Luckiest Guy | Boutons, titres de cartes |
| `font-body` | Nunito | Texte courant, labels |
| `text-cuphead` | display + uppercase + text-stroke 1.5px | Sous-titres de section |
| `text-cuphead-lg` | display + text-shadow 4px offset | Titres de page |

## Bordures & Ombres

| Classe | Valeur | Usage |
|---|---|---|
| `border-cup` | `3px solid #000` | Composants standards |
| `border-cup-xl` | `4px solid #000` | Cards principales, boutons CTA |
| `shadow-cup-card` | `4px 4px 0px #000` | Cards (ombre hard offset) |
| `shadow-cup-btn` | `3px 3px 0px #000` | Boutons |
| `btn-press` | translate(2,2) + shadow réduit au `:active` | Feedback pression |

## Animations

Toutes les animations CupHead utilisent `steps()` — pas de `ease` ou `cubic-bezier`.

| Classe Tailwind | Keyframe | Usage |
|---|---|---|
| `animate-dance` | `dance` 0.5s steps(2) | Personnage chargement |
| `animate-blink` | `blink` 1s steps(2) | Points chargement |
| `animate-char-bounce` | `charBounce` 0.6s steps(3) | Corps personnage Burger/Tacos/Salade |
| `animate-char-wiggle` | `charWiggle` 0.5s steps(4) | Corps personnage Sushi/Ramen/Steak |
| `animate-char-spin` | `charSpin` 1.2s steps(8) | Corps personnage Pizza/Poulet |
| `animate-leg-l/r` | `legL/R` 0.6s steps(2) | Jambes |
| `animate-whirl` | `whirl` 2s steps(8) | Spinner écran vide |
| `animate-sparkle` | `sparkle` 0.9s steps(6) | Étoiles burst MatchPage |
| `animate-match-title` | `matchTitle` 0.6s steps(4) | Titre "It's a match!" |
| `animate-avatar-pop` | `avatarPop` 0.5s steps(3) | Avatars MatchPage |
| `animate-message-in` | `messageIn` 0.2s steps(3) | Bulles chat |

## Personnages animés (DESIGN-03)

Chaque catégorie a un personnage **unique** défini dans `src/data/categories.ts` :

| Catégorie | Couleur | Forme corps | Accessoire | Animation |
|---|---|---|---|---|
| Burger 🍔 | `#FF6B35` | Cercle parfait | Chef hat blanc | Bounce |
| Sushi 🍣 | `#FF69B4` | Ovale vertical | Headband rouge | Wiggle |
| Pizza 🍕 | `#FFD700` | Cercle | Lunettes rondes | Spin |
| Tacos 🌮 | `#00E676` | Ovale vertical | Sombrero vert | Bounce |
| Ramen 🍜 | `#FF4081` | Ovale horizontal | Vapeur animée | Wiggle |
| Salade 🥗 | `#69F0AE` | Cercle | Nœud papillon | Bounce |
| Poulet 🍗 | `#FFAB40` | Large en haut | Crête rouge | Spin |
| Steak 🥩 | `#FF5252` | Cercle | Moustache bordeaux | Wiggle |

Les styles d'accessoires sont dans `src/styles/_characters.scss`.

## Transitions de page (DESIGN-04)

Composant `<PageTransition>` à utiliser dans chaque page principale.

```tsx
// Transition standard (fade + léger glissement vers le haut)
<PageTransition>...</PageTransition>

// Transition "pop" pour MatchPage (spring scale depuis 0.82)
<PageTransition variant="pop">...</PageTransition>
```

`AnimatePresence` est configuré dans `App.tsx` avec `mode="wait"` et la clé basée sur le premier segment de route.

## Règles CupHead

1. **Pas de `border-radius` > 24px sans `border-cup` ou `border-cup-xl`** — les formes rondes doivent toujours avoir un contour.
2. **Pas de `ease` fluide** — utiliser `steps()` dans les keyframes ou des durées < 150ms pour Framer Motion.
3. **Pas de couleur hardcodée** — tout passe par les variables CSS de `@theme`.
4. **Ombres offset uniquement** — pas de `blur` sur les ombres de composants UI.
5. **Toujours `btn-press`** sur les boutons cliquables — le feedback pressé est identitaire CupHead.
