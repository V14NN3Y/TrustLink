# TrustLink — Seller app (not deployed)

Since October 2026 TrustLink no longer onboards external sellers: the team sources and publishes products itself, attributed to the internal supplier *TrustLink Sourcing*. Seller sign-up is closed and this app is **not deployed**.

The code is kept as a reference (catalogue wizard, variants editor, CSV import, seller dashboard) for a possible future "restricted admin" role.

```bash
cd seller
npm install
# create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

See [docs/architecture.md](../docs/architecture.md) for the current model.
