📋 TRUSTLINK — GUIDE DE SYNCHRONISATION (v1.0)
Architecture temporaire via localStorage (avant Supabase)
🔑 Règles globales

Taux de change unifié :1 XOF = 2.46 NGN → donc 1 NGN = 0.4065 XOF
(L’Admin est la source de vérité — il écrit ce taux, les autres le lisent)

Format ID commandes unifié :TL-[ANNÉE]-[5CHIFFRES]
Exemple : TL-2026-00491, TL-2026-00488

Commission TrustLink :2.8%(valeur Admin = référence)
🗄️ Structure localStorage partagée

Chaque projet doit lire/écrire dans ces clés exactes :

// Taux de change (écrit par l'Admin, lu par tous)
localStorage.setItem("tl_exchange_rate", "0.4065") // 1 NGN → XOF
localStorage.setItem("tl_exchange_rate_display", "1 XOF = 2.46 NGN")
localStorage.setItem("tl_exchange_updated_at", "2026-04-21")
// Produits (écrits par le Seller Hub, lus par Marketplace + Admin)
localStorage.setItem("tl_products", JSON.stringify([
  {
    id: "TL-PROD-001",           // ID unifié
    seller_id: "seller-001",
    seller_name: "Adebayo Fashions",
    name: "iPhone 15 Pro Max 256GB",
    category: "High-Tech",
    price_ngn: 1850000,
    price_xof: 752025,           // price_ngn * 0.4065
    image: "...",
    status: "active",            // active | pending_review | rejected
    stock_total: 8,
    created_at: "2026-04-21"
  }
  // ... autres produits
]))
// Commandes (écrites par la Marketplace, lues par Seller Hub + Admin)
localStorage.setItem("tl_orders", JSON.stringify([
  {
    id: "TL-2026-00491",         // Format unifié
    product_id: "TL-PROD-001",
    product_name: "iPhone 15 Pro Max 256GB",
    seller_id: "seller-001",
    buyer_name: "Kofi Mensah",
    buyer_city: "Cotonou",
    quantity: 1,
    amount_xof: 752025,
    amount_ngn: 1850000,
    status: "new",               // new | ready | hub_received | in_transit | delivered | completed
    hub: "Lagos Hub",
    created_at: "2026-04-21T09:15:00",
    updated_at: "2026-04-21T09:15:00"
  }
]))
// Session utilisateur (auth simulée)
localStorage.setItem("tl_auth_role", "seller")   // "seller" | "admin" | "buyer"
localStorage.setItem("tl_auth_user_id", "seller-001")
localStorage.setItem("tl_auth", "true")

🛒 CE QUI DOIT CHANGER — MARKETPLACE (projet 1)

Fichiers concernés : mocks/products.ts (ou équivalent)


1. PRODUITS — Remplacer les produits mock par ceux du localStorage
   → Au chargement : lire localStorage.getItem("tl_products")
   → Si vide : afficher les produits mock existants (fallback)
   → Afficher uniquement les produits avec status = "active"
   → Convertir price_ngn → price_xof avec le taux lu depuis localStorage
2. COMMANDES — Quand un buyer passe commande
   → Lire tl_orders depuis localStorage
   → Ajouter la nouvelle commande avec le format TL-2026-XXXXX
   → Réécrire tl_orders dans localStorage
3. TAUX DE CHANGE
   → Lire localStorage.getItem("tl_exchange_rate") au lieu d'une valeur hardcodée
   → Fallback : 0.4065 si clé absente
4. IDs COMMANDES
   → Remplacer tous les anciens formats par TL-2026-XXXXX

🏪 CE QUI DOIT CHANGER — SELLER HUB (ce projet)


1. TAUX DE CHANGE
   → Remplacer EXCHANGE_RATE = 0.522 par 0.4065
   → Lire depuis localStorage.getItem("tl_exchange_rate")
   → Fallback : 0.4065
2. PRODUITS — Au save/update d'un produit
   → Écrire dans localStorage.setItem("tl_products", ...)
   → Inclure seller_id, price_xof calculé, status
3. COMMANDES — Au chargement de /orders
   → Lire tl_orders depuis localStorage
   → Filtrer par seller_id = "seller-001"
   → Fallback : afficher mockOrders si localStorage vide
4. IDs COMMANDES
   → Remplacer TL-004xxx par TL-2026-XXXXX dans tous les mocks
5. COMMISSION
   → Remplacer 8% par 2.8% (valeur Admin)

🔧 CE QUI DOIT CHANGER — ADMIN (projet 2)


1. TAUX DE CHANGE — L'Admin est la source de vérité
   → Bouton/formulaire pour modifier le taux
   → Au save : localStorage.setItem("tl_exchange_rate", nouvelleValeur)
   → Afficher la dernière mise à jour
2. PRODUITS — Section Modération
   → Lire tl_products depuis localStorage
   → Permettre de passer status de "pending_review" → "active" ou "rejected"
   → Réécrire tl_products dans localStorage
3. COMMANDES — Vue globale
   → Lire tl_orders depuis localStorage
   → Voir toutes les commandes (tous vendeurs)
   → Permettre de changer les statuts
4. VENDEURS ACTIFS — KPI "148 vendeurs actifs"
   → Lire tl_sellers depuis localStorage (liste des vendeurs inscrits)
5. COMMISSION — 2.8% est la valeur de référence
   → Seller Hub doit adopter cette valeur (pas 8%)

🔄 Flux de données résumé

SELLER HUB           ADMIN              MARKETPLACE
    │                  │                    │
    │──[tl_products]──▶│◀──[tl_products]───│  (lit les produits actifs)
    │                  │                    │
    │                  │──[tl_exchange]────▶│  (lit le taux)
    │◀─────────────────│──[tl_exchange]──── │
    │                  │                    │
    │◀──[tl_orders]────│◀───[tl_orders]────│  (la marketplace crée les commandes)
    │   (filtre par    │   (voit tout)      │
    │    seller_id)    │                    │

✅ Priorité d’implémentation suggérée

    D’abord : Uniformiser les taux de change dans les 3 projets → 0.4065

    Ensuite : Uniformiser le format des IDs commandes → TL-2026-XXXXX

    Puis : Brancher le localStorage pour les produits (Seller Hub écrit → Marketplace lit)

    Enfin : Brancher le localStorage pour les commandes (Marketplace crée → Seller Hub lit)