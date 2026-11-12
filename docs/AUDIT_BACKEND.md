# Audit back-end TrustLink — 12 novembre 2026

Périmètre : Supabase (schéma `schema_new_updated.sql`, `supabase/migrations/`, RLS, fonctions, storage) et l'état des branches `main`, `feat/beta-setup`, `temp`.
Les failles marquées **testé** ont été reproduites sur une base Postgres 16 chargée avec le schéma du dépôt. La base de production n'a pas été consultée : si des policies y ont été ajoutées à la main, certains points peuvent déjà être corrigés.

## 1. État des lieux

| Élément | État |
|---|---|
| Stack | Supabase (Postgres + Auth + Realtime + Storage), aucune API maison. Toute la logique métier est soit dans les apps React, soit dans des fonctions SQL `SECURITY DEFINER` |
| Schéma | 1 fichier monolithique (34 tables, 9 enums) + 3 migrations sur `main`, recopiées en bas du fichier monolithique |
| Migrations | Aucun outillage : pas de `supabase/config.toml`, pas de seed, application manuelle dans l'éditeur SQL. Deux dossiers concurrents : `supabase/migrations/` (main, beta-setup) et `migrations/` (temp) |
| Fonctions serveur | RPC acheteur propres (`confirm_order_receipt`, `open_order_dispute`, `record_payment_reference`…). Aucune Edge Function sur `main` ; `sourcing-preview` sur `temp` |
| Automatisations | 5 triggers (profil à l'inscription, `updated_at`). Aucune tâche planifiée avant cette branche |
| Notifications | Créées depuis le front admin, sauf celles ajoutées par cette branche (triggers) |
| Paiement | KkiaPay côté client seulement ; la référence est enregistrée, le passage à « payé » est manuel (admin). Pas de webhook |

### Branches

| Branche | Base | Contenu | Risque |
|---|---|---|---|
| `main` | — | Pivot « sourcing interne », correctifs du cycle de commande acheteur | — |
| `feat/beta-setup` (11/10) | `main` à jour | Inspection Lagos côté admin (`order_inspections`, bucket `inspection-photos`), litiges en écran partagé, `vercel.json` | Fusion simple |
| `temp` (Joseph, 12/11) | commit du **24 août** | Prix tout compris, sourcing par lien, suivi 4 étapes, litige 48h, scraper Konga (60 produits) | **~100 commits de retard sur `main` → conflits lourds** (`buyer/src/lib/supabase/products.js`, `account/page.jsx`…). Embarque aussi `__pycache__` et `trustlink_modifs.zip` |
| `feat/evans-backend-tasks` (ce travail) | `feat/beta-setup` | Tâches Evans (voir §3) | Rebaser `temp` dessus |

**Doublon à trancher :** la photo d'inspection existe en deux versions — `order_inspections` (beta-setup, plusieurs photos, bucket privé) et `orders.inspection_photo_url` (temp, une URL). Cette branche garde `order_inspections` et la relie au suivi acheteur. Il faut retirer `inspection_photo_url` de `temp`.

## 2. Problèmes, par priorité

| # | Gravité | Problème | Preuve | Correctif proposé |
|---|---|---|---|---|
| 1 | 🔴 Critique | **N'importe qui peut devenir admin à l'inscription** : `handle_new_user` prend le rôle dans `raw_user_meta_data`, que le client contrôle (`signUp({ options: { data: { role: 'admin' } } })`). Le code d'invitation n'est vérifié que dans le front admin | testé | Le trigger ignore `admin` (et `seller`) venant du client ; promotion via une RPC `redeem_admin_invite(code)` qui utilise la table `invitation_codes` déjà existante |
| 2 | 🔴 Critique | **Un acheteur peut se passer admin** : la policy « Users can update their own profile » n'a aucune restriction de colonnes → `update profiles set role='admin'` | testé | Trigger `before update` qui refuse le changement de `role` / `kyc_*` si l'appelant n'est pas admin |
| 3 | 🔴 Critique | **Prix modifiables par l'acheteur** : il insère lui-même `orders.total_amount` et `order_items.product_price` (commande d'une TV à 500 000 FCFA enregistrée à 1 FCFA) | testé | RPC `create_order_from_cart()` qui recalcule tout côté serveur (prix, frais, coupon), et suppression des insert directs. En attendant, l'admin doit comparer avec le montant KkiaPay avant de valider |
| 4 | 🟠 Haute | **Les notifications envoyées depuis l'admin échouent** : aucune policy `insert` sur `notifications` → les insert de `OrdersTable.jsx`, `CatalogueInspection.jsx`, page vidéos sont refusés (erreur ignorée côté front). L'acheteur n'est jamais notifié des changements de statut | testé | Notifications de changement de statut générées par trigger (comme les nouvelles de cette branche) ou policy `insert` réservée aux admins |
| 5 | 🟠 Haute | **Fuite d'emails** : `stock_notifications` est lisible par tout le monde, même sans être connecté | testé | Supprimer « Anyone can view stock notifications » |
| 6 | 🟠 Haute | Paiement non vérifié côté serveur (pas de webhook KkiaPay) | lecture | Edge Function webhook qui vérifie la transaction et passe la commande en `paid` |
| 7 | 🟡 Moyenne | Upload `delivery-videos` ouvert à tout utilisateur connecté, sans contrôle du chemin | lecture | Imposer `name like 'confirmations/' \|\| auth.uid() \|\| '/%'` |
| 8 | 🟡 Moyenne | Litige 48h de `temp` : un admin qui crée un litige après 48h (page Vidéos) prend une erreur | lecture | Corrigé dans cette branche (admin exempté) |
| 9 | 🟡 Moyenne | Scraper `temp` : les TV sont rangées dans la catégorie slug `audio-casques` (nom « Électronique & TV ») | données | Corriger le mapping des catégories du scraper |
| 10 | 🟡 Moyenne | `temp` : le catalogue acheteur lit `scrapedProducts.json` en secours, embarqué dans le bundle ; ces produits ont des ids `tl-…` absents de la base → ajout au panier / commande impossible | lecture | Importer en base avec `scripts/import-products.mjs` et retirer le JSON du front |
| 11 | ⚪ Faible | Doc incohérente : taux NGN→XOF 0,89 (doc) / 0,41 (schéma) / 0,42 (scraper) | lecture | Une seule source : `exchange_rates` |
| 12 | ⚪ Faible | Les migrations sont recopiées en bas du fichier monolithique → risque de double application | lecture | Garder le monolithe comme « état v3 », appliquer seulement les migrations datées ensuite |

## 3. Ce que livre la branche `feat/evans-backend-tasks`

| Tâche | Livrable | Testé |
|---|---|---|
| Base de données : produits et étapes de livraison | Migration `20261112200000` : colonnes de sourcing sur `products` (`source_url` unique = clé d'import), `ngn_to_xof()`, `all_inclusive_price_xof()` (même formule que `pricing.js`), table `delivery_steps` (paiement → inspection Lagos → transit → livré), historique `order_tracking_events` rempli par trigger, `orders.delivered_at` | Oui (Postgres 16, deux passages) |
| Envoyer les produits vers l'app | `scripts/import-products.mjs` : validation, conversion NGN→FCFA au taux de la base, upsert sans doublon, statut conservé à la ré-importation, catégories créées, images ré-hébergées en option, `--dry-run`, `--limit 30` | 10 tests unitaires + dry-run sur les 60 produits Konga ; import réel non testé (pas d'accès au projet Supabase) |
| Photo d'inspection de Lagos | Migration `20261112200100` : l'acheteur voit les photos de ses commandes (RLS table + bucket), notification à l'ajout, commande `paid → processing`. Admin : case « envoyer à l'acheteur » et bouton publier/masquer. Acheteur : bloc « Inspection à Lagos » dans la commande | SQL testé ; builds admin et buyer OK |
| Rappel automatique 48h | Migration `20261112200200` + `supabase/setup/01_cron_delivery_reminders.sql` : rappel à +24h, puis « délai écoulé » à +48h (confirmation automatique si `escrow_config.auto_release`), jamais en double, une notification par groupe de commandes ; fenêtre de litige 48h appliquée en base | Oui |

### Ordre d'application (éditeur SQL Supabase)

1. `supabase/setup/00_buckets.sql` (si les buckets n'existent pas)
2. `supabase/migrations/20261110120000_order_inspections.sql`
3. `supabase/migrations/20261112200000_products_sourcing_and_delivery_steps.sql`
4. `supabase/migrations/20261112200100_inspection_photo_to_buyer.sql`
5. `supabase/migrations/20261112200200_delivery_48h_reminders.sql`
6. Activer pg_cron (Database → Extensions), puis `supabase/setup/01_cron_delivery_reminders.sql`

Toutes les migrations peuvent être relancées sans erreur.
