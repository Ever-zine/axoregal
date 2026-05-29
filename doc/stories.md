# Stories — Axoregal

Organisées par Epic. Chaque story suit le format : **En tant que [rôle], je peux [action] afin de [valeur].**

---

## Epic 1 — Authentification & Onboarding

| ID | Story | Priorité |
|---|---|---|
| AUTH-01 | En tant qu'utilisateur, je peux me connecter via le SSO de l'entreprise afin d'accéder à l'application sans créer de compte. | Must |
| AUTH-02 | En tant qu'utilisateur, mon avatar et mon nom récupérés via le SSO s'affichent dans les groupes afin que mes collègues me reconnaissent. | Must |
| AUTH-03 | En tant qu'utilisateur, je suis redirigé vers la page de connexion SSO si ma session est expirée. | Must |
| AUTH-04 | En tant qu'utilisateur, je vois un écran de chargement avec un personnage dansant pendant 2 secondes après connexion afin d'avoir une transition fluide. | Must |

---

## Epic 2 — Swipe

| ID | Story | Priorité |
|---|---|---|
| SWIPE-01 | En tant qu'utilisateur, je vois des cartes de catégories de cuisine (burger, sushi, pizza…) à swiper afin d'exprimer mes préférences. | Must |
| SWIPE-02 | En tant qu'utilisateur, chaque carte affiche un personnage animé représentant la cuisine (burger qui danse, sushi kawaii…) afin de rendre l'expérience ludique. | Must |
| SWIPE-03 | En tant qu'utilisateur, je peux swiper à droite pour accepter une catégorie. | Must |
| SWIPE-04 | En tant qu'utilisateur, je peux swiper à gauche pour refuser une catégorie. | Must |
| SWIPE-05 | En tant qu'utilisateur, je vois sur chaque carte les avatars des collègues ayant déjà swipé à droite cette catégorie afin de savoir qui partage mes envies. | Must |
| SWIPE-06 | En tant qu'utilisateur, je peux également taper des boutons ✗ / ✓ en plus du geste de swipe afin d'utiliser l'app sur desktop. | Should |
| SWIPE-07 | En tant qu'utilisateur, je vois une animation de rejet (carte part à gauche) ou d'acceptation (carte part à droite) afin d'avoir un feedback visuel clair. | Must |
| SWIPE-08 | En tant qu'utilisateur, je suis notifié quand toutes les catégories ont été swipées (fin de deck) afin de savoir que j'ai terminé. | Should |

---

## Epic 3 — Matching

| ID | Story | Priorité |
|---|---|---|
| MATCH-01 | En tant qu'utilisateur, je vois la page "It's a match !" quand un match est détecté avec un ou plusieurs collègues sur la même catégorie. | Must |
| MATCH-02 | En tant qu'utilisateur, la page "It's a match !" affiche les avatars des membres du groupe afin de savoir avec qui je vais déjeuner. | Must |
| MATCH-03 | En tant qu'utilisateur, je peux cliquer sur "Surprends-moi" afin d'être instantanément intégré à un groupe existant sans swiper. | Must |
| MATCH-04 | En tant que product owner, je peux configurer la fenêtre temporelle de matching (ex : 11h00–11h45) afin d'adapter l'app aux horaires de l'entreprise. | Should |
| MATCH-05 | En tant qu'utilisateur, je reçois une notification push quand un match est trouvé afin d'être alerté même si l'app est en arrière-plan. | Should |

---

## Epic 4 — Chat de groupe

| ID | Story | Priorité |
|---|---|---|
| CHAT-01 | En tant qu'utilisateur, le bouton Chat est grisé tant que je n'appartiens pas à un groupe afin d'éviter la confusion. | Must |
| CHAT-02 | En tant qu'utilisateur, le chat s'active automatiquement dès que je rejoins un groupe afin de pouvoir me coordonner. | Must |
| CHAT-03 | En tant qu'utilisateur, je peux envoyer des messages texte dans le chat de mon groupe. | Must |
| CHAT-04 | En tant qu'utilisateur, je vois les messages en temps réel (WebSocket ou polling) afin de ne pas manquer les échanges. | Must |
| CHAT-05 | En tant qu'utilisateur, les messages affichent l'avatar SSO et le prénom de l'expéditeur. | Must |
| CHAT-06 | En tant qu'utilisateur, l'historique du chat est conservé pour la journée en cours. | Should |

---

## Epic 5 — Recherche de restaurant

| ID | Story | Priorité |
|---|---|---|
| REST-01 | En tant qu'utilisateur, je peux accéder à "Je cherche un restaurant" depuis la barre de navigation. | Must |
| REST-02 | En tant qu'utilisateur, je réponds à une série de questions (budget, distance, régime alimentaire) afin d'affiner les suggestions. | Must |
| REST-03 | En tant qu'utilisateur, je vois une liste de restaurants correspondant à mes critères avec nom, photo, distance et note. | Must |
| REST-04 | En tant qu'utilisateur, les suggestions sont filtrées automatiquement sur la catégorie matchée si je viens d'un groupe afin de garder la cohérence. | Should |
| REST-05 | En tant qu'utilisateur, je peux partager un restaurant directement dans le chat du groupe depuis la liste de résultats. | Should |
| REST-06 | En tant qu'utilisateur, je peux voir les détails d'un restaurant (horaires, adresse, lien Maps). | Should |

---

## Epic 6 — PWA & Configuration

| ID | Story | Priorité |
|---|---|---|
| PWA-01 | En tant qu'utilisateur, je peux installer l'application sur mon écran d'accueil mobile (PWA manifest). | Must |
| PWA-02 | En tant qu'utilisateur, l'app affiche l'icône et le nom définis dans le manifest lors de l'installation. | Must |
| PWA-03 | En tant qu'utilisateur, les assets statiques sont mis en cache afin que l'app se charge rapidement même avec une connexion lente. | Should |
| PWA-04 | En tant que développeur, le projet utilise Vite avec le plugin vite-plugin-pwa afin de générer le service worker et le manifest automatiquement. | Must |

---

## Epic 7 — Design & Animations

| ID | Story | Priorité |
|---|---|---|
| DESIGN-01 | En tant qu'utilisateur, l'application utilise un style CupHead : couleurs saturées, contours noirs épais, animations frame-by-frame. | Must |
| DESIGN-02 | En tant que designer, une palette de couleurs, une typographie et un set d'icônes CupHead sont documentés et appliqués globalement. | Must |
| DESIGN-03 | En tant qu'utilisateur, chaque catégorie de cuisine possède un personnage animé unique (minimum 6 catégories au lancement). | Must |
| DESIGN-04 | En tant qu'utilisateur, les transitions entre pages sont animées (framer-motion ou CSS keyframes) afin de renforcer le côté vivant de l'app. | Should |

---

## Backlog — Non priorisé / Hors scope V1

| ID | Idée |
|---|---|
| BACK-01 | Historique des déjeuners passés |
| BACK-02 | Système de favoris par utilisateur |
| BACK-03 | Intégration Google Maps / API restaurants (Yelp, TripAdvisor) |
| BACK-04 | Vote en groupe sur un restaurant précis (à la majorité) |
| BACK-05 | Statistiques "ta cuisine préférée ce mois-ci" |
| BACK-06 | Mode "solo" pour trouver un restaurant pour soi |
| BACK-07 | Rappel journalier configurable (push 11h00 "Et le déjeuner ?") |
