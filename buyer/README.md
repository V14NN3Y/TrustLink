# TrustLink Buyer

Application e-commerce pour les acheteurs de la marketplace transfrontalière TrustLink (Bénin-Nigeria).

## Description

TrustLink Buyer est l'interface d'achat de la plateforme TrustLink. Elle permet aux acheteurs de découvrir des produits, de les ajouter au panier, de gérer leurs favoris et de passer des commandes avec paiement sécurisé via système Escrow.

### Fonctionnalités principales

- **Authentification** : Email/Password + OAuth (Google, Facebook)
- **Catalogue** : Parcourir les produits (10% visibles pour les visiteurs, 100% connectés)
- **Recherche et filtres** : Par catégorie, prix, nom
- **Panier** : Gestion du panier avec persistance (localStorage)
- **Favoris (Wishlist)** : Sauvegardés dans Supabase
- **Profil utilisateur** : Édition des informations personnelles
- **Support** : FAQ, centre d'aide, messagerie
- **Commandes** : Suivi des commandes (à venir)

## Stack Technique

| Technologie | Usage |
|-------------|-------|
| React 18 | Framework UI |
| Vite | Build tool (port 5175) |
| React Router DOM v6 | Routing & protection des routes |
| TailwindCSS | Styling |
| Radix UI / shadcn/ui | Composants UI |
| Supabase | Backend (Auth, Database, Storage) |
| TanStack React Query | Data fetching |
| Lucide React | Icônes |
| Framer Motion | Animations |
| React Hook Form + Zod | Formulaires & validation |
| Stripe | Paiements (à venir) |

## Prérequis

- Node.js 18+
- npm 9+
- Compte Supabase avec projet configuré

## Installation

```bash
# Cloner le projet
git clone https://github.com/V14NN3Y/TrustLink
cd TrustLink/buyer

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
```

Éditer le fichier `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

## Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

L'application sera accessible sur `http://localhost:5175`

## Structure du Projet

```
buyer/
├── src/
│   ├── components/        # Composants UI (Header, Footer, etc.)
│   │   ├── ui/           # Composants shadcn/ui (45+ composants)
│   │   └── feature/      # Composants spécifiques (ProductCard, etc.)
│   ├── contexts/          # React contexts (AuthContext)
│   ├── hooks/            # Custom hooks (useCart, useWishlist, etc.)
│   ├── lib/              # Utilitaires, Supabase client, Auth
│   ├── pages/            # Pages de l'application
│   │   ├── home/         # Page d'accueil (catalogue, bannières)
│   │   ├── account/      # Profil utilisateur et commandes
│   │   ├── auth/         # Login, Register, Callback OAuth
│   │   ├── product/      # Fiche produit détaillée
│   │   ├── cart/         # Panier
│   │   ├── checkout/      # Paiement
│   │   ├── wishlist/     # Favoris
│   │   ├── faq/          # FAQ
│   │   ├── help/         # Centre d'aide
│   │   ├── support/      # Support
│   │   └── legal/        # Mentions légales
│   ├── router/           # Configuration React Router
│   ├── App.jsx           # Composant racine
│   └── main.jsx          # Point d'entrée
├── public/               # Assets statiques (logos, images)
├── .env                  # Variables d'environnement
├── package.json
├── vite.config.js        # Configuration Vite (port 5175)
└── README.md
```

## Pages et Routes

| Route | Page | Description | Auth requise |
|-------|------|-------------|-------------|
| `/` | Home | Page d'accueil avec catalogue | Non |
| `/product/:id` | ProductPage | Fiche produit détaillée | Non |
| `/cart` | Cart | Panier d'achat | Oui |
| `/checkout` | Checkout | Page de paiement | Oui |
| `/account` | Account | Profil et commandes | Oui |
| `/wishlist` | Wishlist | Liste des favoris | Oui |
| `/login` | Login | Connexion | Non |
| `/register` | Register | Inscription | Non |
| `/auth/callback` | AuthCallback | Callback OAuth | Non |
| `/faq` | FAQ | Foire aux questions | Non |
| `/help` | Help | Centre d'aide | Non |
| `/support` | Support | Page de support | Non |
| `/legal` | Legal | Mentions légales | Non |
| `/policy/returns` | Returns | Politique de retours | Non |

## Authentification

L'authentification est gérée par Supabase et supporte :

- **Email/Password** : Inscription et connexion classique
- **OAuth Google** : Connexion avec compte Google
- **OAuth Facebook** : Connexion avec compte Facebook

### Flux d'authentification

1. Utilisateur clique sur "Se connecter" ou "S'inscrire"
2. Connexion via email/password ou OAuth
3. Callback OAuth traite la réponse et redirige vers l'accueil
4. Session persistée dans localStorage
5. Routes protégées vérifient `isAuthenticated`

### Gestion du localStorage

- **Connexion** : Vide le panier et wishlist locaux (évite les données stale)
- **Déconnexion** : Vide le panier et wishlist locaux
- **OAuth callback** : Vide le panier et wishlist locaux

## Base de Données (Supabase)

### Tables utilisées par Buyer

| Table | Usage |
|-------|-------|
| `profiles` | Profils utilisateurs (buyer) |
| `products` | Produits marketplace |
| `orders` | Commandes |
| `order_items` | Articles de commande |
| `cart_items` | Éléments du panier |
| `wishlist` | Favoris |
| `conversations` | Messages support |
| `product_reviews` | Avis produits |
| `notifications` | Notifications |

### Row Level Security (RLS)

- Les acheteurs ont accès en lecture/écriture à leurs propres données
- Les produits approuvés sont visibles par tous
- Les politiques RLS sont configurées dans Supabase

## Variables d'Environnement

Créer un fichier `.env` à la racine avec :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGcxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Ces variables sont récupérées dans Supabase :
- Project Settings → API → Project URL
- Project Settings → API → anon public key

## Scripts Disponibles

```bash
npm run dev          # Démarre le serveur de développement (port 5175)
npm run build        # Build pour la production
npm run preview     # Prévisualise le build localement
npm run lint         # Lint du code avec ESLint
```

## Couleurs et Design

| Usage | Couleur | Code Hex |
|-------|--------|----------|
| Primary | Bleu foncé | `#0E3A4F` |
| Accent | Orange | `#FF6A00` |
| Success | Vert | `#16A34A` |
| Warning | Orange | `#FF6A00` |
| Danger | Rouge | `#DC2626` |
| Background | Blanc | `#FFFFFF` |

## Fonctionnalités Implémentées

- [x] Authentification complète (email + OAuth)
- [x] Pages Login et Register avec OAuth
- [x] Routes protégées (cart, checkout, account, wishlist)
- [x] Catalogue produits avec filtres
- [x] Recherche produits
- [x] Panier avec persistance localStorage
- [x] Wishlist synchronisée avec Supabase
- [x] Édition profil utilisateur
- [x] Pages FAQ, Help, Support
- [x] Pages légales (mentions, retours)
- [x] Logos TrustLink intégrés
- [x] Gestion localStorage à la connexion/déconnexion
- [ ] Intégration panier avec Supabase (tables carts + cart_items)
- [ ] Intégration commandes avec Supabase
- [ ] Checkout avec Stripe
- [ ] Confirmation réception avec vidéo
- [ ] Système d'avis produits

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit les changements (`git commit -m 'Ajout de ma feature'`)
4. Push vers la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

## Licence

Propriétaire - Tous droits réservés

## Contact

- Site web : [trustlink.com](https://trustlink.com) (pas encore)
- Email : contact@trustlink.com (pas encore)
- GitHub : [V14NN3Y/TrustLink](https://github.com/V14NN3Y/TrustLink)

---

*Dernière mise à jour : 29 Avril 2026*
