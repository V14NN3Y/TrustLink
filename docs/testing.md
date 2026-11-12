# Testing

## Database test bench — `supabase/tests/`

Replays the schema and every migration on a **throwaway local** PostgreSQL, then runs:

- `features.sql` — pricing helpers, tracking history, Lagos inspection visibility, reminders, dispute window, auto-confirm;
- `security_setup.sql` + `security_attacks.sql` — each audited attack replayed as a real API user (`authenticator` role, like PostgREST). Every line must say `BLOCKED`, none `FAIL`.

`supabase_stub.sql` emulates the parts of Supabase the migrations need (`auth.users`, `auth.uid()`, `storage.objects`, `anon` / `authenticated` / `service_role` roles).

```bash
# Postgres 15+ running locally, superuser "postgres"
PGHOST=/tmp PGPORT=5432 PGUSER=postgres ./supabase/tests/run.sh
```

Never point it at the Supabase production database: it drops and recreates its test database.

## Product import — `scripts/test/`

```bash
cd scripts && node --test
```

Mapping and validation (NGN→XOF conversion, URL normalisation, site detection, image filtering, de-duplication).

## Payment logic — `supabase/functions/verify-payment/logic.test.ts`

```bash
deno test supabase/functions/verify-payment/logic.test.ts
# or
node --experimental-strip-types --test supabase/functions/verify-payment/logic.test.ts
```

## Apps

```bash
cd buyer && npm run lint && npm run build
cd admin && npm run lint && npm run build
```
