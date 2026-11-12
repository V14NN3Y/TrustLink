# Product import

`scripts/import-products.mjs` puts sourced products online from a JSON file, attributed to the internal supplier *TrustLink Sourcing*.

## Prerequisites

1. `scripts/create-internal-supplier.mjs` has been run once on the project.
2. Migration `20261112200000_products_sourcing_and_delivery_steps.sql` is applied.
3. `cd scripts && npm install`

## Input format

A JSON array, one object per product — the format produced by the scraper (`scraper/output/scraped_products.json` on the `temp` branch). Full example: `scripts/examples/products.example.json`.

| Key | Required | Notes |
|---|---|---|
| `name` | yes | ≥ 3 characters |
| `source_url` | yes | Product page URL — the de-duplication key (tracking parameters and `#…` are stripped) |
| `price_ngn` | yes* | Nigerian price in Naira. *Or `price` already in XOF |
| `images` / `image_url` | yes | http(s) URLs, first = main image, max 8 |
| `category_slug`, `category_name` | no | Category created if unknown |
| `description`, `sku`, `stock_quantity`, `delivery_min_days`, `delivery_max_days`, `weight_kg`, `old_price_ngn` | no | Defaults: stock 10, delivery 3–7 days |
| `source_site` | no | Derived from the URL: `konga`, `jumia`, `slot`, `jiji`, `shopify:<store>` |

## Usage

```bash
# 1. Check the file — nothing is written, no key needed
node import-products.mjs --file data/products.json --dry-run --rate 0.41

# 2. Import (first 30 valid products, to be reviewed in the admin before going live)
SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx \
  node import-products.mjs --file data/products.json --limit 30 --status pending_review --rehost-images
```

| Option | Effect |
|---|---|
| `--dry-run` | Validate and print the table, write nothing |
| `--limit n` | Only the first n valid products |
| `--status` | `approved` (default, online immediately), `pending_review`, `draft` |
| `--default-stock n` | Stock when the file has none |
| `--rate x` | NGN→XOF rate to use instead of `exchange_rates` |
| `--rehost-images` | Copy images into the `product-images` bucket (recommended: Nigerian CDNs may block hotlinking) |

## Behaviour

- Price in XOF = `round(price_ngn × rate)`; the Naira price and the rate are stored on the product so it can be recomputed.
- Re-importing the same file updates price, stock and images **without** duplicates, and **keeps the status** of products already in the catalogue (a product rejected by an admin does not come back online).
- A JSON report is written to `scripts/output/import-report-<date>.json` (rejected items with reasons, image errors).

## Tests

```bash
cd scripts && node --test
```
