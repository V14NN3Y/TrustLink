# TrustLink Catalog Web Scraper & Pipeline

Pipeline de web scraping et d'enrichissement de catalogue pour TrustLink (Marketplace transfrontalière Nigeria ➔ Bénin).

## Fonctionnalités

1. **Scraping multi-plateformes nigérianes :**
   - **Jumia Nigeria (`jumia.com.ng`)** : parseur BeautifulSoup avec gestion des catégories, extraction des titres, prix en Naira (NGN), notes étoiles, avis et images haute résolution.
   - **Konga Nigeria (`konga.com`)** : extraction directe du flux React Server Components pour récupérer des produits réels et actualisés sans blocage réseau.
   - **Bascule automatique intelligente** : si Cloudflare défie les requêtes sur Jumia (cas fréquent en environnement datacenter), le script bascule automatiquement sur les flux marchands nigérians pour garantir l'extraction des données sans échec.

2. **Conversion & Normalisation TrustLink :**
   - Conversion automatique des prix en Naira (NGN) vers le Franc CFA (XOF). Par défaut (`--xof-rate auto`), le taux est lu dans la table Supabase `exchange_rates` (le même que celui de l'app), avec repli sur `0.42 XOF / 1 NGN` hors ligne. Un nombre explicite reste possible (`--xof-rate 0.45`).
   - Mappage des catégories vers les identifiants et slugs standardisés de la base Supabase (`smartphones-tablettes`, `audio-casques`, `ordinateurs-bureautique`, `mode-vetements`, `cuisine-table`, `beaute-soins`).
   - Descriptions neutres mentionnant la protection TrustLink Escrow (aucune certification ou authenticité n'est affirmée).
   - Identifiants **stables** (`tl-<sku>`, sinon hash de l'URL) : ils ne changent plus quand l'ordre de scraping change.

3. **Formats d'export générés (`scraper/output/`) :**
   - `scraped_products.json` : Données complètes JSON avec identifiants, catégories, images, prix doubles, avis.
   - `scraped_products_seller.csv` : CSV prêt à l'import direct via le modal **"Importer CSV"** de l'espace Vendeur (`name,price,stock,description,category,image_url`).
   - `seed_catalog.sql` : Script SQL PostgreSQL complet prêt à exécuter dans l'éditeur SQL Supabase pour insérer les catégories, produits et images en une seule requête.

---

## Données : réel vs estimé

Le scraper n'invente plus de données :

| Champ | Source réelle | Si la source ne le donne pas |
|---|---|---|
| `rating`, `rating_count` | note et avis de la source | `null` et `0` → le site affiche « Pas encore d'avis » |
| `seller_rating`, `sales` | non fournis par les sources | `null` |
| `seller` | origine (`Konga Nigeria`, `Jumia Nigeria`) | — |
| `stock_quantity` | stock de la source (respecté tel quel) | `--default-stock` (défaut 10), avec `stock_estimated: true` |

`delivery_min_days` / `delivery_max_days` restent des **estimations** fixes (Konga 2–5 j, Jumia 3–6 j).

---

## Utilisation du Scraper

### 1. Lancement standard (toutes catégories)
```bash
python3 scraper/jumia_scraper.py
```

### 2. Spécifier le nombre de produits par catégorie
```bash
python3 scraper/jumia_scraper.py --limit-per-cat 12
```

### 3. Filtrer par catégories spécifiques
```bash
python3 scraper/jumia_scraper.py --categories smartphones-tablettes,audio-casques
```

### 4. Ajuster le taux de conversion NGN ➔ XOF
```bash
python3 scraper/jumia_scraper.py --xof-rate 0.45
```

### 5. Parser un fichier HTML Jumia local
Si vous avez téléchargé une page HTML Jumia manuellement :
```bash
python3 scraper/jumia_scraper.py --html-file chemin/vers/page_jumia.html
```

---

## Méthodes d'intégration dans le Catalogue

### Option A : Import direct via l'espace Vendeur (Recommandé)
1. Rendez-vous sur l'application **Seller** (`/catalog`).
2. Cliquez sur **"Importer des produits (CSV)"**.
3. Sélectionnez le fichier `scraper/output/scraped_products_seller.csv`.
4. Visualisez l'aperçu et confirmez l'importation. Les images et catégories sont automatiquement associées !

### Option B : Exécution du script SQL dans Supabase
1. Ouvrez le tableau de bord Supabase du projet.
2. Accédez à la section **SQL Editor**.
3. Copiez-collez le contenu de `scraper/output/seed_catalog.sql` et cliquez sur **Run**.
4. Les produits sont immédiatement insérés avec le statut `approved` et visibles sur le catalogue acheteur.

---

## Nettoyer / régénérer sans réseau

```bash
python3 scraper/jumia_scraper.py --from-json scraper/output/scraped_products.json --sync-frontends
```

Relit un catalogue existant, répare l'encodage (`CrÃ¨me` → `Crème`), retire les anciens textes « certifié » et supprime les notes/stocks identiques sur tout le catalogue (anciennes valeurs par défaut). `--sync-frontends` copie ensuite le JSON dans `buyer/src/data/` et `seller/src/data/` (une seule source de vérité).

> Si `seed_catalog.sql` a déjà été exécuté, un produit dont le nom a été corrigé (accents) sera inséré une seconde fois (la déduplication se fait par nom). Supprimez l'ancienne ligne dans Supabase.

## Tests

```bash
pip install -r scraper/requirements.txt
python3 -m pytest scraper/tests
```

## Lien avec « Sourcing par lien »

La page `/sourcing` du buyer pré-remplit titre, prix et image d'un lien Konga/Jumia via la fonction Supabase
`supabase/functions/sourcing-preview` (voir son README pour le déploiement). Elle est indépendante de ce script Python.
