// Imports sourced products (Konga, Jumia, Slot.ng, Shopify stores...) into the
// TrustLink catalogue, attributed to the internal supplier "TrustLink Sourcing".
//
// Safe to re-run: products are upserted on `source_url`, so importing the same
// file twice updates prices/stock/images instead of creating duplicates.
//
// Usage (from the scripts/ folder, after `npm install`):
//   node import-products.mjs --file ./data/products.json --dry-run      # check only, no Supabase write
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node import-products.mjs --file ./data/products.json [--limit 30] [--status pending_review] [--rehost-images]
//
// Options
//   --file <path>        JSON array of products (format: see lib/product-mapping.mjs)
//   --dry-run            validate + show what would be imported, write nothing
//   --limit <n>          import only the first n valid products
//   --status <s>         approved (default, visible immediately) | pending_review (validate in the admin first)
//   --default-stock <n>  stock when the file gives none (default 10)
//   --rate <x>           NGN→XOF rate to use instead of the one stored in exchange_rates
//   --rehost-images      download images and re-upload them to the `product-images` bucket
//                        (recommended: Nigerian CDNs can block or expire hotlinked images)
//
// Prerequisites: scripts/create-internal-supplier.mjs has been run, and the
// migration 20261112200000_products_sourcing_and_delivery_steps.sql is applied.
// The service-role key bypasses RLS: never commit it, never put it in an app .env.

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { mapAll, DEFAULTS } from './lib/product-mapping.mjs';

const SUPPLIER_SLUG = 'trustlink-sourcing';
const BATCH = 50;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // product-images bucket limit
const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

const { values: args } = parseArgs({
  options: {
    file: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    limit: { type: 'string' },
    status: { type: 'string', default: DEFAULTS.status },
    'default-stock': { type: 'string' },
    rate: { type: 'string' },
    'rehost-images': { type: 'boolean', default: false },
  },
});

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

async function readInput(file) {
  if (!file) fail('Missing --file <path to JSON>');
  let raw;
  try {
    raw = await fs.readFile(file, 'utf8');
  } catch (e) {
    fail(`Cannot read ${file}: ${e.message}`);
  }
  try {
    return JSON.parse(raw.replace(/^﻿/, ''));
  } catch (e) {
    fail(`${file} is not valid JSON: ${e.message}`);
  }
}

function printSummary({ accepted, rejected, duplicates }, rate) {
  console.log(`\nTaux NGN→XOF utilisé : ${rate ?? '—'}`);
  console.log(`✔ ${accepted.length} produit(s) valides · ✖ ${rejected.length} rejeté(s) · ${duplicates} doublon(s) ignoré(s)\n`);
  if (accepted.length) {
    console.table(accepted.map(({ product, images, category }) => ({
      nom: product.name.slice(0, 45),
      site: product.source_site,
      'prix NGN': product.source_price_ngn ?? '',
      'prix XOF': product.price,
      stock: product.stock_quantity,
      images: images.length,
      categorie: category?.slug ?? '',
    })));
  }
  for (const r of rejected) {
    console.log(`  ✖ #${r.index} ${r.name ?? '(sans nom)'} → ${r.errors.join(', ')}`);
  }
}

async function getRate(supabase) {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('from_currency', 'NGN')
    .eq('to_currency', 'XOF')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail(`exchange_rates lookup failed: ${error.message}`);
  return data ? Number(data.rate) : null;
}

async function ensureCategories(supabase, accepted) {
  const wanted = new Map();
  for (const { category } of accepted) if (category) wanted.set(category.slug, category.name);
  if (wanted.size === 0) return new Map();

  const { data: existing, error } = await supabase.from('categories').select('id, slug').in('slug', [...wanted.keys()]);
  if (error) fail(`categories lookup failed: ${error.message}`);
  const ids = new Map(existing.map(c => [c.slug, c.id]));

  const missing = [...wanted].filter(([slug]) => !ids.has(slug)).map(([slug, name]) => ({ slug, name, is_active: true }));
  if (missing.length) {
    const { data: created, error: insErr } = await supabase.from('categories').insert(missing).select('id, slug');
    if (insErr) fail(`categories insert failed: ${insErr.message}`);
    created.forEach(c => ids.set(c.slug, c.id));
    console.log(`+ ${created.length} catégorie(s) créée(s) : ${created.map(c => c.slug).join(', ')}`);
  }
  return ids;
}

async function rehostImage(supabase, url, productId, index) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 TrustLinkImporter' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get('content-type') || '').split(';')[0].trim();
  if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'no content-type'})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES) throw new Error('image > 10 MB');
  const objectPath = `sourced/${productId}/${index}.${EXT_BY_TYPE[type] || 'jpg'}`;
  const { error } = await supabase.storage.from('product-images').upload(objectPath, buf, { contentType: type, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from('product-images').getPublicUrl(objectPath).data.publicUrl;
}

async function main() {
  const items = await readInput(args.file);
  const limit = args.limit ? Number(args.limit) : undefined;
  if (!['approved', 'pending_review', 'draft'].includes(args.status)) fail('--status must be approved, pending_review or draft');
  const defaultStock = args['default-stock'] !== undefined ? Number(args['default-stock']) : DEFAULTS.stock;
  const forcedRate = args.rate !== undefined ? Number(args.rate) : null;
  if (forcedRate !== null && !(forcedRate > 0)) fail('--rate must be a positive number');

  // ---- Dry run: no Supabase at all ------------------------------------------------
  if (args['dry-run']) {
    const rate = forcedRate ?? (Number(items?.[0]?.xof_rate) || null);
    const result = mapAll(items, { rate, supplierId: '(fournisseur interne)', status: args.status, defaultStock }, { limit });
    printSummary(result, rate);
    if (!forcedRate) console.log('\nℹ Dry-run : taux pris dans le fichier (xof_rate) — l\'import réel utilisera celui de la table exchange_rates, sauf --rate.');
    console.log('\nDry-run : rien n\'a été écrit.');
    return;
  }

  // ---- Real import ------------------------------------------------------------------
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or use --dry-run)');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: supplier, error: supErr } = await supabase.from('profiles').select('id').eq('business_slug', SUPPLIER_SLUG).maybeSingle();
  if (supErr) fail(`supplier lookup failed: ${supErr.message}`);
  if (!supplier) fail(`No profile with business_slug='${SUPPLIER_SLUG}'. Run create-internal-supplier.mjs first.`);

  const rate = forcedRate ?? await getRate(supabase);
  const result = mapAll(items, { rate, supplierId: supplier.id, status: args.status, defaultStock }, { limit });
  printSummary(result, rate);
  if (!result.accepted.length) fail('Nothing to import.');

  const categoryIds = await ensureCategories(supabase, result.accepted);
  const report = { started_at: new Date().toISOString(), file: path.resolve(args.file), rate, imported: [], image_errors: [], rejected: result.rejected };

  for (let i = 0; i < result.accepted.length; i += BATCH) {
    const chunk = result.accepted.slice(i, i + BATCH);
    // Products already in the catalogue keep their status: a product the admin
    // rejected or unpublished must not come back online on the next import.
    const { data: existing, error: exErr } = await supabase
      .from('products').select('source_url').in('source_url', chunk.map(c => c.product.source_url));
    if (exErr) fail(`existing products lookup failed: ${exErr.message}`);
    const known = new Set(existing.map(p => p.source_url));

    const toRow = ({ product, category }) => ({ ...product, category_id: category ? categoryIds.get(category.slug) ?? null : null });
    // Two separate calls: in a bulk request PostgREST sets keys missing from a
    // row to NULL, so "with status" and "without status" rows must not be mixed.
    const newRows = chunk.filter(c => !known.has(c.product.source_url)).map(toRow);
    const updRows = chunk.filter(c => known.has(c.product.source_url)).map(toRow).map(({ status, ...rest }) => rest);

    const saved = [];
    for (const rows of [newRows, updRows]) {
      if (!rows.length) continue;
      const { data, error } = await supabase
        .from('products')
        .upsert(rows, { onConflict: 'source_url' })
        .select('id, source_url, name, price');
      if (error) fail(`products upsert failed (batch ${i / BATCH + 1}): ${error.message}`);
      saved.push(...data);
    }
    if (updRows.length) console.log(`  (${updRows.length} déjà en catalogue : prix/stock/images mis à jour, statut conservé)`);

    const idByUrl = new Map(saved.map(p => [p.source_url, p.id]));
    const productIds = [...idByUrl.values()];

    // Images: replace the previous set for these products.
    const { error: delErr } = await supabase.from('product_images').delete().in('product_id', productIds);
    if (delErr) fail(`product_images cleanup failed: ${delErr.message}`);

    const imageRows = [];
    for (const { product, images } of chunk) {
      const productId = idByUrl.get(product.source_url);
      for (let n = 0; n < images.length; n++) {
        let url = images[n];
        if (args['rehost-images']) {
          try {
            url = await rehostImage(supabase, images[n], productId, n);
          } catch (e) {
            report.image_errors.push({ product: product.name, url: images[n], error: e.message });
          }
        }
        imageRows.push({ product_id: productId, url, is_primary: n === 0, sort_order: n });
      }
    }
    const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
    if (imgErr) fail(`product_images insert failed: ${imgErr.message}`);

    report.imported.push(...saved.map(p => ({ id: p.id, name: p.name, price_xof: Number(p.price), source_url: p.source_url })));
    console.log(`→ lot ${i / BATCH + 1} : ${saved.length} produit(s), ${imageRows.length} image(s)`);
  }

  const outDir = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'output');
  await fs.mkdir(outDir, { recursive: true });
  const reportFile = path.join(outDir, `import-report-${report.started_at.replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

  console.log(`\n✔ ${report.imported.length} produit(s) en ligne (statut : ${args.status}).`);
  if (report.image_errors.length) console.log(`⚠ ${report.image_errors.length} image(s) non ré-hébergée(s) (URL d'origine conservée) — voir le rapport.`);
  console.log(`Rapport : ${reportFile}`);
}

main().catch((err) => fail(err.stack || err.message));
