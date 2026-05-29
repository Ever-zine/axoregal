# Axoregal — Vue d'ensemble du projet

## Concept

Application mobile-first (PWA) de type "Tinder pour trouver un restaurant". Elle permet à des collègues d'une même entreprise de s'accorder sur un type de cuisine pour déjeuner ensemble, via une interface de swipe ludique et un design CupHead.

---

## Flux utilisateur principal

```
Connexion SSO
     ↓
Écran de chargement (2s, personnage dansant)
     ↓
Vue Swipe — cartes restaurant à swiper
     ↓ (match détecté)
Page "It's a match !"
     ↓
Chat de groupe activé
     ↓
Recherche de restaurant concret
```

---

## Fonctionnalités

### 1. Authentification SSO
- Login via le SSO de l'entreprise
- Récupération du profil (avatar, nom) pour l'affichage dans les groupes

### 2. Écran de chargement
- Animation de 2 secondes avec un personnage qui danse
- Style CupHead (voir Design System)

### 3. Swipe (écran principal)
- Carte par catégorie de cuisine : nom + personnage animé (burger, sushi, pizza…)
- Swipe gauche = refusé, swipe droit = intéressé
- Avatars des membres du groupe actuellement intéressés affichés sur la carte
- Déclenchement d'un "match" si conditions réunies (voir section Matching)

### 4. "It's a match !"
- Page interstitielle animée affichée lors d'un match
- Affiche les membres du groupe
- CTA vers le chat de groupe

### 5. Barre de navigation (bas d'écran)
| Bouton | Comportement |
|---|---|
| Swipe | Vue swipe principale |
| Surprends-moi | Match immédiat avec un groupe aléatoire |
| Chat | Désactivé sans groupe ; activé dès que l'utilisateur a rejoint un groupe |
| Je cherche un restaurant | Formulaire + liste de restaurants filtrée |

### 6. Chat de groupe
- Activé uniquement une fois dans un groupe
- Discussion pour se coordonner sur le restaurant précis
- Lié à la session du jour (⚠ voir Questions ouvertes)

### 7. Je cherche un restaurant
- Série de questions (budget, distance, régime alimentaire…)
- Propose une liste de restaurants filtrée
- Peut être utilisé en complément du chat

---

## Stack technique

| Composant | Choix |
|---|---|
| Framework | React + Vite |
| Type d'app | PWA (installable, offline partiel) |
| Style | CupHead — Pop Dynamique |
| Auth | SSO entreprise (OpenID Connect / SAML — à confirmer) |
| Icône & nom | À définir (voir Stories) |

---

## Questions ouvertes & Points à challenger

### Logique de matching — flou critique
> **Comment un "match" est-il déclenché exactement ?**

Deux hypothèses possibles :
- **A. Matching en temps réel** — dès que 2+ personnes swipent à droite la même catégorie en même temps, match déclenché.
- **B. Vote par session** — à heure fixe (ex : 11h30), on comptabilise les swipes et le groupe majoritaire gagne.

L'hypothèse A pose un problème : si les gens ouvrent l'app à des moments différents, personne ne matche jamais. **Recommandation : partir sur B avec une fenêtre temporelle configurable.**

---

### "Surprends-moi" — risque UX
> Matcher avec un groupe **totalement aléatoire** peut frustrer l'utilisateur s'il se retrouve avec des inconnus ou des gens d'un autre service.

Options à envisager :
- Aléatoire parmi ses **contacts/équipe proche** (via SSO)
- Aléatoire parmi les groupes **déjà formés ce jour**
- Animation sympa mais résultat toujours **pertinent** (groupe avec le plus de monde)

---

### Swipe sur catégories vs restaurants
> Le swipe porte sur des **types de cuisine**, mais "Je cherche un restaurant" propose des **établissements concrets**.

Ces deux flux sont-ils liés ? Scénario attendu :
1. Match sur "Sushi"
2. Dans le chat, on utilise "Je cherche un restaurant" filtré automatiquement sur "Sushi"

Si ce n'est pas le cas, les deux features fonctionnent en silos et la cohérence se perd.

---

### Gestion des groupes
- Qui peut créer un groupe ? Est-ce automatique (tous ceux qui swipent droite sur la même catégorie) ?
- Taille min/max ?
- Que se passe-t-il si 8 personnes matchent "Pizza" mais 1 seule veut "Vegan" ? La personne vegan est-elle intégrée au groupe majoritaire ou reste-t-elle sans groupe ?

---

### Durée de vie du chat & des groupes
- Le groupe est-il **éphémère** (1 midi) ou persistent ?
- Les historiques de chat sont-ils conservés ?
- Si je suis absent le midi, mon groupe se reforme-t-il sans moi le lendemain ?

---

### PWA — limites à anticiper
- Les **push notifications** (pour notifier d'un match) sont limitées sur iOS Safari — à vérifier selon la population cible.
- Le swipe tactile doit être testé sur mobile dès le début, pas en fin de projet.
