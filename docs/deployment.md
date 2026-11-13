# Deployment

## 1. Supabase project

### New project

In the SQL editor, in this order:

1. `schema_new_updated.sql` (already contains the October 2026 migrations at the end — do not re-apply them)
2. `supabase/setup/00_buckets.sql`
3. Every file of `supabase/migrations/` dated **after 2026-10-22**, in file-name order
4. Enable **pg_cron** (Database → Extensions), then `supabase/setup/01_cron_delivery_reminders.sql`

### Existing project (v3 + October migrations)

Apply, in order:

1. `20261110120000_order_inspections.sql` (+ `setup/00_buckets.sql` if `inspection-photos` does not exist)
2. `20261112200000_products_sourcing_and_delivery_steps.sql`
3. `20261112200100_inspection_photo_to_buyer.sql`
4. `20261112200200_delivery_48h_reminders.sql`
5. `20261112220000_security_fixes.sql`
6. pg_cron + `setup/01_cron_delivery_reminders.sql`

All these migrations are idempotent. **Apply them before deploying the apps that depend on them** — the buyer checkout calls `create_checkout_order`.

### First admin

Admins register with an invitation code. If there is no admin yet:

```sql
insert into invitation_codes (code, created_by, expires_at)
values ('PICK-A-CODE', '<id of any existing profile>', now() + interval '7 days');
-- or promote an existing account directly:
update profiles set role = 'admin' where email = 'someone@example.com';
```

### Internal supplier

```bash
cd scripts && npm install
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node create-internal-supplier.mjs
```

## 2. Payment verification (Edge Function)

```bash
supabase functions deploy verify-payment
supabase secrets set KKIAPAY_PUBLIC_KEY=... KKIAPAY_PRIVATE_KEY=... KKIAPAY_SECRET_KEY=... KKIAPAY_SANDBOX=true
```

Set `KKIAPAY_SANDBOX=false` in production. Until the function is deployed, payments are validated manually by an admin from the stored transaction reference.

## 3. Apps (Vercel)

One Vercel project per app, root directory `buyer/` or `admin/`, framework preset Vite (`npm run build`, output `dist`). `vercel.json` rewrites every path to `index.html` for client-side routing.

| Variable | buyer | admin |
|---|---|---|
| `VITE_SUPABASE_URL` | ✔ | ✔ |
| `VITE_SUPABASE_ANON_KEY` | ✔ | ✔ |
| `VITE_KKIAPAY_PUBLIC_KEY` | ✔ | |
| `VITE_KKIAPAY_SANDBOX` | ✔ (`false` in production) | |

Never set the service-role key or the KkiaPay private / secret keys in a `VITE_` variable: they would be shipped in the JavaScript bundle.

## 4. Supabase Auth settings

- Site URL / redirect URLs: the buyer domain (`/auth/callback`, `/auth/reset-password`) and the admin domain.
- Google provider for buyer OAuth.
