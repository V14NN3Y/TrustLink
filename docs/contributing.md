# Contributing

## Branches

- `main` — what is deployed.
- `feat/<topic>`, `fix/<topic>` — one branch per task, opened from an up-to-date `main`, merged through a pull request.
- Rebase long-lived branches on `main` regularly; a branch far behind `main` (like `temp`, started in August) is very costly to merge.

## Commits

[Conventional Commits](https://www.conventionalcommits.org), in English, one logical change per commit:

```
feat(buyer): show Lagos inspection photos in the order
fix(db): restrict delivery video uploads to the caller's folder
docs: deployment guide
chore(admin): translate comments to English
test(db): add checkout attack scenarios
```

Scopes: `buyer`, `admin`, `seller`, `db`, `payments`, `scripts`, `test`.

## Database changes

- Never edit `schema_new_updated.sql` for a new change: add `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql`.
- Make migrations idempotent (`if not exists`, `create or replace`, `drop … if exists`).
- Start the file with a comment explaining the why; keep user-facing strings (notifications, errors) in French.
- Add scenarios to `supabase/tests/` and run `run.sh` before opening the PR.

## Code language

Code, comments, docs and commit messages in English. UI text in French (and English in the buyer i18n file).

## Line endings (Windows)

The repository uses LF. On Windows run once:

```bash
git config core.autocrlf true
```

Otherwise git may show every file as modified when only line endings changed.

## Secrets

Never commit `.env` files, the Supabase service-role key or KkiaPay private / secret keys.
