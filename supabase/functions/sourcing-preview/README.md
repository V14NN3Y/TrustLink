# sourcing-preview

Edge Function qui lit une fiche produit **Konga** ou **Jumia** (titre, prix, image) pour pré-remplir
le formulaire « Sourcing par lien » (`/sourcing`).

- Réservée aux utilisateurs connectés (le JWT est vérifié avec `auth.getUser()`).
- Domaines autorisés : `konga.com`, `jumia.com.ng` (https uniquement, redirections revérifiées).
- Lecture limitée à 1,5 Mo, délai 8 s.
- Extraction : JSON-LD `Product`, puis balises `og:`/`product:`, puis `<title>`.

## Déploiement

```bash
supabase functions deploy sourcing-preview
```

## Tests de l'analyseur

```bash
node --experimental-strip-types --test supabase/functions/sourcing-preview/parse.test.ts
```

> L'extraction n'a été testée que sur des pages d'exemple : Konga/Jumia peuvent changer leur HTML
> ou bloquer les requêtes de serveurs (Cloudflare). Dans ce cas le formulaire reste utilisable à la main.
