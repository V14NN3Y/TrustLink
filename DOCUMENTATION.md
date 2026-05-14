---
TrustLink — Documentation Complète du Projet
> Date : 14 mai 2026  
> Version du schéma : v3 (schema_new_updated.sql)  
> Stack : React + Vite + Supabase + Tailwind CSS + shadcn/ui
---
## Table des matières
1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture générale](#2-architecture-générale)
3. [Concept métier : l'Escrow](#3-concept-métier-lescrow)
4. [Base de données (Supabase PostgreSQL)](#4-base-de-données-supabase-postgresql)
5. [Application Buyer (Acheteur)](#5-application-buyer-acheteur)
6. [Application Seller (Vendeur)](#6-application-seller-vendeur)
7. [Application Admin (Administration)](#7-application-admin-administration)
8. [Flux transversaux](#8-flux-transversaux)
9. [Système de messagerie](#9-système-de-messagerie)
10. [Système de notifications](#10-système-de-notifications)
11. [Système KYC](#11-système-kyc)
12. [Système de change multi-devises](#12-système-de-change-multi-devises)
13. [Logistique et Dispatches](#13-logistique-et-dispatches)
14. [Système de litiges](#14-système-de-litiges)
15. [Vidéos de confirmation de livraison](#15-videos-de-confirmation-de-livraison)
16. [Sécurité — RLS (Row Level Security)](#16-sécurité--rls-row-level-security)
17. [Triggers et automatisations](#17-triggers-et-automatisations)
18. [Récapitulatif des fonctionnalités par rôle](#18-récapitulatif-des-fonctionnalités-par-rôle)
19. [Détails techniques par application](#19-détails-techniques-par-application)
20. [Stockage (Supabase Storage)](#20-stockage-supabase-storage)
---
1. Vue d'ensemble du projet
TrustLink est une marketplace cross-border (Nigeria → Bénin) avec un système de paiement Escrow (séquestre) intégré. Le projet est composé de trois applications web distinctes partageant la même base de données Supabase :
Application	Rôle	URL relative
buyer/	Acheteur	/
seller/	Vendeur	—
admin/	Administrateur	—
Le problème résolu
Les acheteurs au Bénin veulent acheter des produits au Nigeria mais ont peur de se faire arnaquer (produits non livrés, défectueux, différents de la description). Les vendeurs au Nigeria ont peur de livrer sans être payés. TrustLink agit comme tiers de confiance :
1. L'acheteur paie → les fonds sont bloqués par TrustLink (Escrow)
2. Le vendeur expédie le produit
3. TrustLink reçoit, vérifie et livre au Bénin
4. L'acheteur filme l'ouverture du colis
5. Si tout va bien → le paiement est libéré au vendeur
6. Si problème → litige ouvert, l'admin décide du remboursement
---
2. Architecture générale
Stack technique commune
- Frontend : React 18+ avec Vite comme bundler
- Routing : react-router-dom (v6)
- Backend/DB : Supabase (PostgreSQL + Auth + Realtime + Storage)
- Styling : Tailwind CSS + composants shadcn/ui
- Typographie : Poppins (titres), Inter (corps de texte)
- Icônes : Remix Icon (ri-*)
- Couleurs principales :
  - #125C8D — Bleu TrustLink (primaire)
  - #FF6A00 — Orange (accent)
  - #0E3A4F — Bleu foncé (dark)
  - #16A34A — Vert (succès)
  - #DC2626 — Rouge (erreur/litige)
Structure des dossiers
TrustLink/
├── schema_new.sql          ← Schéma PostgreSQL complet
├── flow                    ← Document de spécification fonctionnelle
├── buyer/                  ← Application acheteur
├── seller/                 ← Application vendeur
├── admin/                  ← Application administrateur
Chaque application est un projet Vite autonome avec sa propre configuration (package.json, vite.config.js, .env, etc.).
Partage de données
Les trois applications se connectent à la même instance Supabase (même URL, même clé anon). La sécurité est gérée par RLS (Row Level Security) de PostgreSQL — chaque utilisateur ne voit que les données auxquelles il a droit selon son rôle.
---
3. Concept métier : l'Escrow
Qu'est-ce que l'Escrow ?
L'Escrow (séquestre) est le mécanisme central de TrustLink. C'est un tiers de confiance financier qui sécurise les deux parties :
[Acheteur] ──── PAIE ────→ [TrustLink ESCROW] ──── LIBÈRE ────→ [Vendeur]
                                  │
                            (fonds bloqués)
                                  │
                     jusqu'à confirmation acheteur
Les 4 étapes de l'Escrow
1. Vous payez — L'acheteur paie via KkiaPay (Mobile Money ou CB). Les fonds sont bloqués par TrustLink.
2. TrustLink sécurise — L'argent est séquestré. Le vendeur voit la commande mais ne reçoit pas l'argent.
3. Vendeur livre — Le vendeur prépare et expédie. TrustLink gère la logistique transfrontalière.
4. Vous validez — L'acheteur reçoit, filme l'ouverture, et confirme. Les fonds sont libérés au vendeur.
Où est visible l'Escrow ?
- TrustBanner (page d'accueil buyer) : 4 colonnes de réassurance
- HeroBanner : mention dans les slides
- Page produit : badge "Protégé par Escrow"
- Checkout : section explicative "Comment fonctionne l'Escrow" avec les 4 étapes
- Sidebar du compte : encart "Protection Escrow"
- Footer : rappel dans les liens
Politique de remboursement
- L'acheteur dispose de 48h après livraison pour ouvrir un litige
- La vidéo d'ouverture du colis est OBLIGATOIRE pour toute réclamation
- L'admin décide du remboursement ou du paiement forcé au vendeur
- Voir page /policy/returns du buyer pour la matrice de résolution
---
4. Base de données (Supabase PostgreSQL)
Schéma global : schema_new_updated.sql
Le schéma contient 22 tables, 9 types enum, 22+ policies RLS, 5 triggers, 1 fonction helper.
Types ENUM
Type	Valeurs
user_role	buyer, seller, admin
order_status	pending, paid, processing, in_transit, delivered, confirmed, disputed, cancelled, refunded
dispute_status	open, resolved_refund, resolved_no_refund
message_status	sent, read
product_status	pending_review, approved, rejected
notification_type	order_update, new_message, product_approved, product_rejected, dispute_update, new_order, payment_received
payout_status	pending_review, approved, rejected, paid
dispatch_status	preparing, in_transit, delivered, cancelled
Tables principales
profiles — Utilisateurs unifiés
Tous les utilisateurs (buyer, seller, admin) sont dans une seule table. Le champ role détermine les permissions.
Colonnes clés :
- id (uuid) — Référence auth.users(id), clé primaire
- role (user_role) — Le rôle de l'utilisateur
- full_name, email, phone, avatar_url — Infos personnelles
- default_address_line1, default_city, default_country — Adresse par défaut
- business_name, business_description, business_address, business_logo_url — Infos business (seller uniquement)
- kyc_identity_verified, kyc_address_verified, kyc_business_verified — Flags de vérification KYC
categories — Catégories de produits
Structure arborescente avec parent_id référençant la même table (sous-catégories).
products — Produits
- seller_id → référence profiles(id)
- category_id → référence categories(id)
- price en numeric(12, 2), currency par défaut 'XOF'
- status en product_status : pending_review → approved ou rejected
- rejection_reason — Raison du rejet si l'admin refuse
product_images — Images de produits
- product_id → référence products(id)
- is_primary — Image principale
- sort_order — Ordre d'affichage
carts et cart_items — Panier
- carts : un panier par buyer
- cart_items : produits dans le panier avec quantité
- Unique constraint : (cart_id, product_id)
wishlists — Liste de souhaits
- (buyer_id, product_id) unique — un produit ne peut être ajouté qu'une fois
orders — Commandes (niveau buyer)
C'est la commande globale du buyer. Si un panier contient des produits de plusieurs vendeurs, chaque vendeur reçoit sa propre commande order mais toutes partagent le même group_id.
Colonnes clés :
- buyer_id → référence profiles(id)
- status — Statut global de la commande
- shipping_address_line1, shipping_city, etc. — Adresse snapshot au moment de la commande
- total_amount, currency — Montant total
- payment_reference, payment_method — Infos de paiement
- group_id (uuid) — Identifiant du groupe de commandes (multi-seller)
- notes — Notes du buyer
- admin_notes — Notes internes de l'admin
order_items — Sous-commandes (niveau seller)
Chaque order_item représente la portion d'une commande qui concerne un vendeur spécifique.
Colonnes clés :
- order_id → référence orders(id)
- seller_id → référence profiles(id)
- product_id → référence products(id)
- product_name, product_price — Snapshot du produit au moment de la commande
- quantity, subtotal
- status — Statut propre à ce seller (peut différer du statut global)
Exemple de scénario multi-seller :
Panier buyer :
  - Produit A (Seller 1) — 5000 XOF
  - Produit B (Seller 2) — 8000 XOF
  - Produit C (Seller 2) — 3000 XOF
Résultat dans la DB :
  orders (2 lignes) :
    - order #1 : buyer_id=X, group_id=ABC, seller_id=1, total=5000
    - order #2 : buyer_id=X, group_id=ABC, seller_id=2, total=11000
  order_items (3 lignes) :
    - Produit A → order #1
    - Produit B → order #2
    - Produit C → order #2
delivery_videos — Vidéos d'ouverture de colis
Colonne cruciale du système de confiance :
- order_id → référence orders(id)
- buyer_id → référence profiles(id)
- video_url — Chemin relatif dans le bucket privé delivery-videos
- is_defective — NULL = pas encore revu, true = défectueux, false = conforme
- reviewed_by, reviewed_at — Qui et quand l'admin a reviewé
- defective_reason — Raison si produit défectueux
disputes — Litiges
- order_id → référence orders(id)
- buyer_id → référence profiles(id)
- video_id → référence delivery_videos(id)
- reason — Raison du litige (texte)
- status — open, resolved_refund, resolved_no_refund
- resolved_by, resolution_notes, resolved_at — Décision de l'admin
dispatches — Voyages/Expéditions
Représente un voyage physique de colis entre un hub Nigeria et le Bénin.
- dispatch_code — Code unique du voyage (ex: VOY-2026-001)
- origin_hub — Hub d'origine (Lagos, Abuja)
- destination_hub — Par défaut Cotonou
- status — preparing, in_transit, etc.
- driver_name, truck_plate, customs_agent — Infos du transport
- total_value, orders_count — Stats du voyage
- departure_date, estimated_arrival, actual_arrival — Dates
IMPORTANT : Il n'existe pas de table de jonction dispatch_orders ou dispatch_packages dans le schéma actuel. Le lien entre dispatches et commandes n'est pas formalisé en base de données.
reviews — Avis produits
- (product_id, buyer_id) unique — 1 avis par buyer par produit
- rating 1-5 avec CHECK constraint
- order_id → référence optionnelle à orders(id) (pour lier à la commande)
messages — Messagerie
Système de messagerie avec threads (réponses) :
- sender_id, receiver_id → références profiles(id)
- parent_id → référence messages(id) (pour les réponses en thread)
- subject, content
- status — sent ou read
notifications — Notifications
- user_id → référence profiles(id)
- type — Type de notification (enum)
- title, body
- resource_type, resource_id — Lien vers la ressource concernée
- is_read — Lu ou non
exchange_rates — Taux de change
- from_currency, to_currency — Paires de devises
- rate — Le taux de conversion
- Insert initial : NGN → XOF = 0.89
IMPORTANT : Pas de contrainte unique sur (from_currency, to_currency).
admin_logs — Journal des actions admin
Audit trail de toutes les actions administratives :
- admin_id → référence profiles(id)
- action — Type d'action (ex: order_status_changed, product_approved)
- resource_type, resource_id — Ressource concernée
- old_value, new_value — Valeurs avant/après en JSONB
---
5. Application Buyer (Acheteur)
Stack spécifique
- React Query pour products/categories
- useState/useEffect pour le reste (cart, orders, etc.)
- Supabase Realtime pour les notifications
Structure des routes
Routes publiques (pas d'authentification requise)
Route	Page	Description
/	Home	Marketplace : recherche, catégories, grille de produits
/product/:id	ProductPage	Détail produit : galerie, variantes, avis, produits similaires
/faq	FAQ	Questions fréquentes par catégorie (Livraison, Escrow, Retours, Compte)
/help	Help	Centre d'aide avec recherche et liens rapides
/support	Support	Messagerie thread avec les admins
/legal	Legal	Documents légaux (Mentions légales, Confidentialité, CGU)
/policy/returns	Returns	Politique de retour et remboursement
/login	Login	Connexion email + Google OAuth
/register	Register	Inscription avec email
/auth/callback	AuthCallback	Callback OAuth Google
/forgot-password	ForgotPassword	Demande de reset password
/auth/reset-password	ResetPassword	Formulaire nouveau mot de passe
Routes protégées (authentification requise)
Route	Page	Description
/cart	Cart	Panier avec quantités, total, frais de livraison (2500 FCFA)
/checkout	Checkout	3 étapes : Adresse → Paiement → Confirmation
/account	Account	Dashboard : commandes, wishlist, litiges, paramètres
/wishlist	Wishlist	Produits sauvegardés
/notifications	Notifications	Liste des notifications groupées par date
Fonctionnalités détaillées
5.1 Marketplace (page d'accueil)
- HeroBanner : Carrousel automatique de 3 slides avec CTA par catégorie
- TrustBanner : 4 colonnes de réassurance Escrow
- CategoryBar : Barre de filtres par catégorie (sticky), chargée depuis la DB
- ProductGrid : Grille responsive (2/3/4 colonnes) avec tri par popularité/prix
- ProductCard : Image, badges (discount/new), bouton wishlist, étoiles, prix
- Recherche : Paramètre URL ?search= passé à fetchProducts()
5.2 Page produit
- Galerie d'images avec thumbnails cliquables
- Sélection de variantes (taille/couleur) — UI prête
- Sélecteur de quantité avec alerte stock faible
- Bouton "Ajouter au panier"
- Section avis avec statistiques (distribution 1-5 étoiles)
- Formulaire d'avis (uniquement pour les buyers ayant acheté et reçu le produit)
- Produits similaires en bas de page
5.3 Panier (Cart)
- Articles avec images, noms, prix
- Contrôle de quantité (+/-) avec limites (min 1, max stock)
- Suppression d'articles
- Récapitulatif avec sous-total + livraison (2500 FCFA fixe) + total
- Bouton "Passer la commande" → redirect vers /checkout
5.4 Checkout — Le flux de commande
Étape 1 — Adresse : Prénom, Nom, Ville (5 villes du Bénin), Quartier, Téléphone
Étape 2 — Paiement : Récapitulatif, section explicative Escrow, 4 méthodes (MTN MoMo, Moov, Wave, KkiaPay)
Étape 3 — Confirmation : Message de succès, group_id, trackingNumber (format TL-XXXXXXXX), nombre de sellers
Ce qui se passe côté DB lors du checkout :
1. Génération d'un group_id unique
2. Groupage des articles par seller_id
3. Pour chaque seller : INSERT orders + INSERT order_items
4. Vidage du panier
5. Retour du groupId au frontend
5.5 Compte (Account Dashboard)
4 onglets :
- Mes commandes : Filtres par statut, expansion pour le détail, actions (confirmer/litige)
- Ma wishlist : Grille de produits sauvegardés
- Mes litiges : Liste avec statut, raison, vidéo, décision admin
- Paramètres : Profil, mot de passe, notifications, zone danger
5.6 Confirmation de livraison avec vidéo
3 étapes :
1. Instructions (vidéo obligatoire)
2. Enregistrement (MediaRecorder → WebM → upload bucket privé)
3. Déclaration : "Produit conforme" (→ confirmed) ou "Produit défectueux" (→ ouvre litige)
IMPORTANT — Problème de sécurité : Le buyer met directement le statut à confirmed ou disputed côté client. En production, seule l'admin devrait valider après review.
5.7 Système de litiges (côté buyer)
DisputeModal — 3 étapes : raison (6 options + autre), vidéo obligatoire, confirmation. Crée le litige dans disputes, passe la commande à disputed.
5.8 Messagerie support (Buyer)
Système de threads complet : fetchThreads, fetchThreadMessages, sendNewMessage, replyToThread, markThreadAsRead.
5.9 Notifications (Buyer)
Temps réel via Supabase Realtime. NotificationBell dans le header. Page /notifications groupée par date.
---
6. Application Seller (Vendeur)
Stack spécifique
- Pas de React Query — uniquement useState/useEffect
- TanStack Query Provider configuré mais non utilisé
Structure des routes
Routes publiques
Route	Page
/login	LoginPage
/register	RegisterPage
Routes protégées
Route	Page
/	Dashboard
/orders	OrdersPage
/catalog	CatalogPage
/catalog/new	NewProductPage
/stats	StatsPage
/support	SupportPage
/settings	SettingsPage
/notifications	NotificationsPage
/reviews	ReviewsPage
/messages	MessagesPage
Fonctionnalités détaillées
6.1 Dashboard
4 KPIs : Commandes reçues, En cours de traitement, Produits approuvés, Revenus estimés (NGN)
Composants : RevenueChart (barres mensuelles NGN/FCFA), SalesQuickWidget, LogisticsAlerts, TopProducts, ExchangeRate, RecentOrders
6.2 Gestion des commandes
- Onglets de filtrage : Toutes, En cours, En transit, Livrées, Litiges, Annulées
- Recherche par ID, produit, acheteur
- Le seller NE PEUT PAS modifier le statut — c'est l'admin
- OrderDetailModal avec tracker visuel 5 étapes
- QR bordereau (visuel, pas un vrai QR)
6.3 Gestion du catalogue
- Toggle grille/liste
- Filtrage par statut (Approuvé, En attente, Rejeté)
- CRUD complet avec EditProductModal
- NewProductPage : wizard 3 étapes (info → prix/stock/images → révision)
- Produit créé en pending_review → approval admin requise
6.4 Statistiques
KPIs (commandes, produits vendus, revenu, moyenne), RevenueChart 7 mois, Conversion Rate, Top Produits
6.5 Avis clients
Stats (total, moyenne, 5 étoiles), liste des avis avec buyer, produit, étoiles, commentaire
6.6 Support et KYC
KycSection — 4 étapes : Identité, Adresse, Activité, Banque. Barre de progression, documents acceptés listés.
FAQ Seller — 7 questions sur Escrow, livraison, KYC, etc.
6.7 Messagerie Seller
Chat direct (pas de threads comme le buyer) :
- Trouve un admin automatiquement (role = 'admin' LIMIT 1)
- Messages avec subject: "Support", pas de parent_id
- Flux continu
6.8 Paramètres (Settings)
6 sections :
1. Profil — Avatar upload, nom, email, téléphone, adresse (sauvegardé)
2. Boutique & Brand — Logo, nom, slug, description, catégorie, site web, Instagram (NON sauvegardé)
3. Notifications — Matrice Email/SMS/Push
4. Sécurité — Password change, 2FA toggle (UI), sessions (mock)
5. Langue & Devise — 5 langues, 3 devises, timezone
6. Données — Placeholder
---
7. Application Admin (Administration)
Stack spécifique
- TanStack Query Provider configuré
- Tous les hooks utilisent useState/useEffect (pas useQuery)
- Supabase Realtime sur orders, messages, notifications
Structure des routes
Route	Page
/login	Login
/register	Register
/	Dashboard
/orders	Orders
/finance	Finance
/logistics	Logistique
/moderation	Modération
/users	Utilisateurs
/products	Produits
/messages	Messagerie
/admin-logs	Historique
/profile	Profil
/delivery-videos	Vidéos
Fonctionnalités détaillées
7.1 Dashboard
8 KPIs : Total commandes, Volume Escrow, Voyages actifs, Vendeurs actifs, Payouts en attente, Litiges ouverts, En attente modération, Taux succès
7.2 Gestion des commandes
OrdersTable avec recherche/filtres/pagination. Dropdown inline pour changer le statut. Chaque changement : update DB + notification buyer + log admin.
PROBLÈME : Statuts en MAJUSCULES (PENDING, FUNDED) vs enum schéma en minuscules. FUNDED n'existe pas dans l'enum.
OrderDetailModal — 3 onglets : Informations, Parcours (Journey editor), Vidéo litige
7.3 Finance
EscrowBridge : Taux de change, spread %, config
PayoutValidation : Liste des payouts depuis la table `payouts`, actions approve/reject/paid
AuditTrail : Logs catégorisés, export CSV
7.4 Logistique
Voyages actifs : Cartes avec statut, chauffeur, plaque, dates
Manifeste : Sélection de colis par hub, génération voyage — NON persisté en DB
Timeline colis : Tracking 5 étapes
7.5 Modération
CatalogueInspection : Interface swipe approve/reject, log + notification seller
DisputeCenter : Split-pane, vidéo preuve, chat messages (données mock), résolution refund/force-pay
7.6 Gestion des utilisateurs
UsersTable : liste, recherche, filtres rôle/KYC, toggles KYC flags
7.7 Gestion des produits
ProductsTable : thumbnails, recherche, filtres, approve/reject inline
7.8 Messagerie Admin
Conversations avec tous les users, realtime, auto-mark as read
7.9 Historique (Admin Logs)
200 entrées, recherche, filtres, valeurs avant/après
7.10 Vidéos de réception
Liste filtrable, review avec player, marquage conforme/défectueux, création auto de litige si défectueux
7.11 Profil et Paramètres Admin
5 onglets : ProfileInfo, SecuritySettings, NotificationSettings, TeamManagement (données mock), SystemPreferences
7.12 Inscription Admin
Code d'invitation requis (VITE_ADMIN_INVITE_CODE), création avec role: 'admin'
---
8. Flux transversaux
8.1 Flux complet d'une commande
1. BUYER : Parcours marketplace → panier → checkout
2. BUYER : createOrder() → N orders (un par seller) avec group_id commun
3. BUYER : Paiement (KkiaPay — actuellement stub)
4. ADMIN : Voit la commande → change pending → paid
   → Notification buyer + seller + log admin
5. SELLER : Voit commande "paid" → prépare et expédie (ne change pas le statut)
6. ADMIN : paid → processing → in_transit (notifications buyer)
7. ADMIN : Regroupe les commandes dans un "voyage" (Manifest Builder — non persisté)
8. ADMIN : in_transit → delivered
9. BUYER : Voit "Livrée" → filme l'ouverture → déclare l'état
   a. Conforme → confirmed
   b. Défectueux → ouvre litige → disputed
10. ADMIN : Review vidéo → résout le litige (remboursement ou paiement forcé)
11. Si confirmed : payout créé pour seller → admin paie hors ligne
8.2 Flux de création de produit
1. SELLER : /catalog/new → wizard → INSERT products (pending_review) + images
2. ADMIN : /moderation → CatalogueInspection → swipe approve/reject
   → UPDATE products SET status
   → Notification seller + log admin
3. Si approved → visible marketplace buyer
4. Si rejected → visible seller uniquement (avec raison)
8.3 Flux de litige
1. BUYER : Filme l'ouverture → détecte problème → DisputeModal
2. SYSTEM : INSERT delivery_videos + INSERT disputes (open) + UPDATE orders (disputed)
3. SELLER : Voit "disputed" → attend décision
4. ADMIN : Review vidéo dans DisputeCenter ou DeliveryVideosPage
5. ADMIN : Décide → resolved_refund (→ refunded) ou resolved_no_refund (→ confirmed)
6. Log admin_logs + notifications
8.4 Flux de logistique
1. ADMIN : /logistics → Manifeste → sélection colis par hub → "Générer le Voyage"
   → ACTUELLEMENT non persisté (pas de table dispatch_orders)
2. ADMIN : /logistics → Voyages actifs → suit le statut
3. ADMIN : Saisie Hub → scan référence → confirmation
4. ADMIN : Changement statuts commandes associées → delivered
---
9. Système de messagerie
Architecture
Rôle	Type	Implémentation
Buyer	Thread-based	Messages racines + réponses (parent_id), sujets prédéfinis
Seller	Chat direct	Flux continu, subject: "Support", pas de parent_id
Admin	Universel	Voit toutes les conversations, peut initier avec n'importe qui
RLS sur messages
- SELECT : sender_id = auth.uid() OR receiver_id = auth.uid()
- INSERT : sender_id = auth.uid()
- Pas de policy UPDATE/DELETE
---
10. Système de notifications
Types de notifications
Type	Déclencheur
order_update	Changement de statut commande
new_message	Nouveau message reçu
product_approved	Produit approuvé
product_rejected	Produit rejeté
dispute_update	Mise à jour litige
new_order	Nouvelle commande
payment_received	Paiement confirmé
Temps réel
Subscription Supabase Realtime sur la table notifications (événement INSERT) dans les 3 applications.
Création actuelle
Notifications créées manuellement dans les composants admin :
- OrdersTable.jsx → buyer sur changement de statut
- CatalogueInspection.jsx → seller sur approval/rejection
- DeliveryVideosPage.jsx → buyer sur review vidéo
Manquant :
- Notification au seller quand nouvelle commande arrive
- Notification au buyer quand commande créée
- Notifications automatiques pour changements de voyage
---
11. Système KYC
Les 4 étapes de vérification (seller)
1. Identité — CNI, Passeport
2. Adresse — Facture, certificat
3. Activité — Registre de commerce
4. Banque — RIB, relevé
Flags dans la DB
kyc_identity_verified BOOLEAN DEFAULT false
kyc_address_verified    BOOLEAN DEFAULT false
kyc_business_verified   BOOLEAN DEFAULT false
Qui vérifie ?
L'admin via /users → UsersTable → toggles KYC. Processus 100% manuel.
Impact
- Seller voit le statut dans /support → KycSection
- Barre de progression (0-100%)
- Pas de blocage fonctionnel si KYC incomplet
---
12. Système de change multi-devises
Contexte
Nigeria (NGN — Naira) ↔ Bénin (XOF — Franc CFA).
Table exchange_rates
INSERT INTO exchange_rates (from_currency, to_currency, rate)
VALUES ('NGN', 'XOF', 0.89);  -- 1 NGN = 0.89 XOF
Utilisation
Application	Utilisation
Buyer	Prix en FCFA uniquement. Taux en localStorage
Seller	Prix en NGN + FCFA. Conversion auto sur les inputs
Admin	Éditeur live dans TopHeader. Preview de conversion
Cache localStorage
Chaque app cache le taux localement. Pas de realtime sur le taux — rechargement nécessaire.
---
13. Logistique et Dispatches
Modèle actuel
Table dispatches — Voyages physiques (table dispatch_orders fait la jonction avec orders)
dispatch_orders — Table de liaison entre dispatches et orders
Créée dans le schéma v3.
---
## 14. Système de litiges
### Côté Buyer
Déclenché depuis `/account` → "Produit défectueux ?". DisputeModal 3 étapes. Vidéo obligatoire.
### Côté Admin
Deux points d'accès :
1. **DisputeCenter** (`/moderation`) — Interface chat-style avec résolution
2. **DeliveryVideosPage** (`/delivery-videos`) — Review vidéo → création auto de litige
### Résolution
- **Rembourser** → `resolved_refund` + commande → `refunded`
- **Paiement forcé** → `resolved_no_refund` + commande → `confirmed`
---
15. Vidéos de confirmation de livraison
Technique
- Format : WebM (VP9/Opus) via MediaRecorder API
- Bucket : delivery-videos (privé)
- Chemins : confirmations/{buyerId}/{orderId}/{timestamp}.webm ou disputes/...
- Accès : URL signée (expire 60 min)
Bucket privé
Les vidéos sont des preuves confidentielles. Seuls le buyer concerné et les admins peuvent les voir.
---
16. Sécurité — RLS (Row Level Security)
Policies par table
Table	Règles
profiles	User : SELECT/UPDATE own. Admin : SELECT/UPDATE all
products	Public : SELECT approved. Seller : CRUD own. Admin : ALL
orders	Buyer : SELECT/INSERT own. Admin : ALL
order_items	Buyer : SELECT own. Seller : SELECT own. Admin : ALL
delivery_videos	Buyer : ALL own. Admin : ALL
disputes	Buyer : SELECT/INSERT own. Admin : ALL
messages	User : SELECT (sent/received), INSERT (sender)
notifications	User : SELECT own, UPDATE own
PROBLÈME CRITIQUE
Problème résolu dans le schéma v3 :
- Les buyers peuvent insérer leurs order_items (policy dédiée)
- La fonction is_admin() avec security definer remplace les sous-requêtes récursives sur profiles
---
17. Triggers et automatisations
Trigger 1 : Auto-create profile (avec ON CONFLICT DO NOTHING et gestion des chaînes vides)
Trigger 2 : Auto-update updated_at
4 triggers sur : profiles, products, orders, order_items.
---
18. Récapitulatif des fonctionnalités par rôle
Buyer — PEUT faire
S'inscrire/se connecter, parcourir la marketplace, voir les détails produits, catégories, wishlist, panier, checkout, voir ses commandes, filtrer par statut, confirmer livraison avec vidéo, ouvrir un litige, voir litiges, notifications (realtime), contacter support (threads), modifier profil/mot de passe/adresse, évaluer un produit, FAQ/Help/Legal, se déconnecter.
Buyer — NE PEUT PAS faire
Modifier le statut d'une commande, voir les commandes d'autres buyers, voir les infos des sellers, gérer son propre payout.
Seller — PEUT faire
S'inscrire/se connecter, voir catalogue, ajouter/modifier/supprimer un produit, voir commandes reçues et détails, statistiques, taux de change, avis clients, notifications (realtime), contacter support (chat), voir statut KYC, modifier profil/mot de passe/adresse, voir produits vendus et nombre de commandes, se déconnecter.
Seller — NE PEUT PAS faire
Modifier le statut d'une commande, voir les commandes d'autres sellers, voir les produits d'autres sellers, gérer les paiements (hors ligne), publier directement (approval admin requise).
Admin — PEUT faire
S'inscrire (code)/se connecter, dashboard, voir/manipuler commandes, modifier statut, voir utilisateurs, gérer KYC, modérer produits (swipe), approve/reject, voir/résoudre litiges, voir vidéos livraison, gérer voyages, gérer payouts (simulé), audit trail, contacter users (messagerie), notifications (realtime), modifier taux de change, modifier profil/mot de passe, générer notifications automatiques, se déconnecter.
Admin — PARTIELLEMENT IMPLÉMENTÉ
Gérer les payouts (simulé, pas de table), gérer team admin (données mock), générer notifications automatiques (partiel), DisputeCenter messages (mock), Manifest Builder (non persisté).
---
19. Détails techniques par application
Buyer — Architecture
buyer/src/
├── App.jsx                    ← AuthProvider + QueryClientProvider + Router
├── router/index.jsx           ← Routes publiques/protégées
├── lib/
│   ├── supabaseClient.js      ← createClient(url, anonKey)
│   ├── AuthContext.jsx        ← Context: user, profile, login, register, logout
│   ├── query-client.js        ← refetchOnWindowFocus: false, retry: 1
│   ├── storage.js             ← localStorage: exchange rate
│   └── supabase/              ← Fonctions CRUD par entité (9 fichiers)
├── hooks/                     ← 11 custom hooks (React Query + useState)
├── utils/                     ← format.js, index.ts
├── components/                ← ProtectedRoute, UI, feature components
└── pages/                     ← 15 pages avec sous-composants
Seller — Architecture
seller/src/
├── App.jsx                    ← AuthProvider + QueryClientProvider + Router
├── router/config.jsx          ← Routes protégées
├── lib/
│   ├── AuthContext.jsx        ← Retry logic (3 tentatives pour le profil)
│   └── supabaseClient.js
├── hooks/                     ← 4 hooks (useState/useEffect, PAS React Query)
├── components/                ← ProtectedRoute, DashboardLayout, Sidebar, Header, UI
├── pages/                     ← 12 pages (auth, home, orders, catalog, stats, support, settings, notifications, reviews, messages)
├── mocks/                     ← profile.js (données fictives)
└── utils/
Admin — Architecture
admin/src/
├── App.jsx                    ← Routing conditionnel + AdminLayout
├── lib/
│   ├── AuthContext.jsx        ← Vérification role='admin'
│   ├── storage.js             ← localStorage manager
│   └── supabaseClient.js
├── hooks/                     ← 11 hooks (useState/useEffect, PAS useQuery)
├── constants/                 ← orderStatuses.js (JOURNEY_STEPS)
├── components/                ← ProtectedRoute, AdminLayout, Sidebar, TopHeader, UI (48 composants)
└── pages/                     ← 13 pages (auth, home, orders, finance, logistics, moderation, users, products, messages, admin-logs, profile, delivery-videos)
---
20. Stockage (Supabase Storage)
Buckets utilisés
Bucket	Type	Usage
delivery-videos	Privé	Vidéos preuve
avatars	Public	Photos de profil
product-images	Public	Images produits
IMPORTANT
Les buckets ne sont pas créés dans le schéma SQL. À créer manuellement dans le dashboard Supabase ou via script séparé.
---
Résumé du modèle de données
auth.users (Supabase Auth)
    │
    └── 1:1 ──→ profiles (role: buyer/seller/admin)
                    │
                    ├── 1:N ──→ products (seller_id)
                    │               ├── 1:N ──→ product_images
                    │               └── 1:N ──→ reviews
                    │
                    ├── 1:N ──→ carts (buyer_id) → cart_items
                    ├── 1:N ──→ wishlists (buyer_id)
                    ├── 1:N ──→ orders (buyer_id) ── group_id
                    │               └── 1:N ──→ order_items (seller_id, product_id)
                    │               ├── 1:1 ──→ delivery_videos
                    │               └── 1:N ──→ disputes
                    │
                    ├── 1:N ──→ notifications (user_id)
                    ├── 1:N ──→ messages (sender_id / receiver_id)
                    └── 1:N ──→ admin_logs (admin_id)
categories ── 1:N ──→ products
exchange_rates ── standalone
dispatches ── 1:N ──→ dispatch_orders ── 1:N ──→ orders
payouts ── liens vers sellers
escrow_config ── configuration du pont escrow
hubs ── hubs logistiques actifs
notification_preferences ── préférences de notifications par utilisateur
---
*Document créé le 05/05/2026 — Analyse complète du projet TrustLink*
