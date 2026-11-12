# Base de données TrustLink (Supabase)

`schema_new_updated.sql` (racine du dépôt) = état v3 complet. Les blocs « MIGRATION » recopiés à la fin de ce fichier
sont déjà dedans : **ne pas** ré-appliquer les migrations d'octobre sur une base créée depuis ce fichier.

## Nouveau projet Supabase
1. `schema_new_updated.sql`
2. `supabase/setup/00_buckets.sql`
3. Toutes les migrations de `supabase/migrations/` **postérieures au 22/10/2026**, dans l'ordre du nom de fichier
4. Activer pg_cron (Database → Extensions) puis `supabase/setup/01_cron_delivery_reminders.sql`
5. Edge Function de paiement : `supabase functions deploy verify-payment` puis
   `supabase secrets set KKIAPAY_PUBLIC_KEY=... KKIAPAY_PRIVATE_KEY=... KKIAPAY_SECRET_KEY=... KKIAPAY_SANDBOX=true`

## Projet existant (déjà en v3 + migrations d'octobre)
Appliquer seulement, dans l'ordre :
- `20261110120000_order_inspections.sql` (+ `setup/00_buckets.sql` si le bucket `inspection-photos` n'existe pas)
- `20261112200000_products_sourcing_and_delivery_steps.sql`
- `20261112200100_inspection_photo_to_buyer.sql`
- `20261112200200_delivery_48h_reminders.sql`
- `20261112220000_security_fixes.sql`
- puis les étapes 4 et 5 ci-dessus.

Toutes ces migrations sont idempotentes (on peut les relancer).

## Premier code d'invitation admin
Les comptes admin ne se créent plus avec `VITE_ADMIN_INVITE_CODE` mais avec un code de la table `invitation_codes`
(usage unique). Un admin en génère un dans l'app admin : **Profil → Équipe → Inviter un membre**.
S'il n'y a encore aucun admin, dans l'éditeur SQL :
```sql
insert into invitation_codes (code, created_by, expires_at)
values ('CHOISIR-UN-CODE', '<id d''un profil existant>', now() + interval '7 days');
```
Ou promouvoir directement un compte : `update profiles set role = 'admin' where email = '...';`

## Règles à respecter dans le code des apps
- Commandes : uniquement via la RPC `create_checkout_order` (les inserts directs dans `orders` / `order_items` sont refusés).
- Paiement : le montant envoyé à KkiaPay est `total_amount` renvoyé par la RPC.
- Rôle, flags KYC et `business_slug` d'un profil : modifiables seulement par un admin ou la clé service_role.
