// Pure mapping/validation logic for scripts/import-products.mjs.
// No network, no Supabase: everything here is unit-tested in
// scripts/test/product-mapping.test.mjs.
//
// INPUT CONTRACT (one JSON array, one object per product). This is the format
// already produced by Joseph's scraper (scraper/output/scraped_products.json
// on the `temp` branch); Ramdon's Slot.ng / Shopify extraction should output
// the same keys. Only the first three are mandatory.
//
//   name            string   required
//   source_url      string   required  product page URL — the upsert key (no duplicates on re-import)
//   price_ngn       number   required* price on the Nigerian site, in Naira
//   price           number             *if price_ngn is missing: price already in XOF (FCFA)
//   old_price_ngn   number             crossed-out price, in Naira
//   images          string[]           image URLs (the first one is the main image)
//   image_url       string             used if `images` is missing
//   category_slug   string             e.g. "smartphones-tablettes" (created if unknown)
//   category_name   string             label used when the category has to be created
//   description     string
//   sku             string
//   stock_quantity  number             default: --default-stock (10)
//   delivery_min_days / delivery_max_days  number  default 3 / 7
//   weight_kg       number
//   source_site     string             e.g. "slot", "shopify:<shop>"; derived from the URL if missing

export const DEFAULTS = Object.freeze({
  stock: 10,
  deliveryMinDays: 3,
  deliveryMaxDays: 7,
  maxImages: 8,
  status: 'approved',
});

const KNOWN_SITES = [
  [/(^|\.)konga\.com$/i, 'konga'],
  [/(^|\.)jumia\.com\.ng$/i, 'jumia'],
  [/(^|\.)slot\.ng$/i, 'slot'],
  [/(^|\.)jiji\.ng$/i, 'jiji'],
];

export function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Canonical form used as the dedup/upsert key: no hash, no tracking params, no trailing slash.
export function normalizeSourceUrl(value) {
  const u = new URL(value.trim());
  u.hash = '';
  for (const key of [...u.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|ref$|srsltid$)/i.test(key)) u.searchParams.delete(key);
  }
  u.hostname = u.hostname.toLowerCase();
  let s = u.toString();
  if (s.endsWith('/') && u.pathname !== '/') s = s.slice(0, -1);
  return s;
}

export function detectSourceSite(url, explicit) {
  if (explicit && String(explicit).trim()) return String(explicit).trim().toLowerCase();
  const host = new URL(url).hostname.replace(/^www\./, '');
  for (const [re, name] of KNOWN_SITES) if (re.test(host)) return name;
  if (/\.myshopify\.com$/i.test(host)) return `shopify:${host.replace(/\.myshopify\.com$/i, '')}`;
  return host;
}

export function slugify(text) {
  return String(text || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toPositiveNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[\s,₦]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toNonNegativeInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

export function collectImages(item, max = DEFAULTS.maxImages) {
  const raw = Array.isArray(item.images) && item.images.length ? item.images : [item.image_url];
  const seen = new Set();
  const out = [];
  for (const img of raw) {
    if (!isHttpUrl(img)) continue;
    const clean = img.trim();
    if (seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Validates one raw item and maps it to the shape inserted in Supabase.
 * @param {object} item     raw item from the JSON file
 * @param {object} ctx      { rate: number (NGN→XOF), supplierId, status, defaultStock, now }
 * @returns {{ ok: true, product, images, category } | { ok: false, errors: string[] }}
 */
export function mapProduct(item, ctx) {
  const errors = [];
  if (!item || typeof item !== 'object') return { ok: false, errors: ['not an object'] };

  const name = typeof item.name === 'string' ? item.name.trim().replace(/\s+/g, ' ') : '';
  if (name.length < 3) errors.push('name missing or too short');

  let sourceUrl = null;
  if (!isHttpUrl(item.source_url)) errors.push('source_url missing or not an http(s) URL');
  else sourceUrl = normalizeSourceUrl(item.source_url);

  const priceNgn = toPositiveNumber(item.price_ngn);
  const priceXofGiven = toPositiveNumber(item.price);
  let priceXof = null;
  if (priceNgn !== null) {
    if (!(ctx.rate > 0)) errors.push('no NGN→XOF exchange rate available');
    else priceXof = Math.round(priceNgn * ctx.rate);
  } else if (priceXofGiven !== null) {
    priceXof = Math.round(priceXofGiven);
  } else {
    errors.push('price_ngn (or price in XOF) missing or not > 0');
  }

  const images = collectImages(item);
  if (images.length === 0) errors.push('no valid image URL');

  if (errors.length) return { ok: false, errors };

  const minDays = toNonNegativeInt(item.delivery_min_days, DEFAULTS.deliveryMinDays);
  const maxDays = Math.max(minDays, toNonNegativeInt(item.delivery_max_days, DEFAULTS.deliveryMaxDays));

  const categorySlug = item.category_slug ? slugify(item.category_slug) : (item.category_name ? slugify(item.category_name) : null);
  const category = categorySlug
    ? { slug: categorySlug, name: (item.category_name || item.category_slug || categorySlug).toString().trim() }
    : null;

  // Default description is buyer-facing copy, so it stays in French like the buyer UI.
  const description = typeof item.description === 'string' && item.description.trim()
    ? item.description.trim()
    : `${name} — importé du Nigeria, livré au Bénin sous protection TrustLink Escrow.`;

  const product = {
    seller_id: ctx.supplierId,
    name: name.slice(0, 250),
    description,
    price: priceXof,
    currency: 'XOF',
    stock_quantity: toNonNegativeInt(item.stock_quantity, ctx.defaultStock ?? DEFAULTS.stock),
    sku: item.sku ? String(item.sku).slice(0, 100) : null,
    status: ctx.status || DEFAULTS.status,
    weight_kg: toPositiveNumber(item.weight_kg),
    delivery_min_days: minDays,
    delivery_max_days: maxDays,
    source_url: sourceUrl,
    source_site: detectSourceSite(sourceUrl, item.source_site),
    source_price_ngn: priceNgn,
    source_old_price_ngn: toPositiveNumber(item.old_price_ngn),
    exchange_rate_used: priceNgn !== null ? ctx.rate : null,
    last_synced_at: (ctx.now || new Date()).toISOString(),
  };

  return { ok: true, product, images, category };
}

/**
 * Maps a whole file: validates every item, drops duplicates (same source_url,
 * last one wins), applies the optional limit.
 */
export function mapAll(items, ctx, { limit } = {}) {
  if (!Array.isArray(items)) throw new Error('Input must be a JSON array of products');
  const byUrl = new Map();
  const rejected = [];
  items.forEach((item, index) => {
    const res = mapProduct(item, ctx);
    if (!res.ok) {
      rejected.push({ index, name: item?.name ?? null, source_url: item?.source_url ?? null, errors: res.errors });
      return;
    }
    if (byUrl.has(res.product.source_url)) byUrl.delete(res.product.source_url);
    byUrl.set(res.product.source_url, res);
  });
  let accepted = [...byUrl.values()];
  const duplicates = items.length - rejected.length - accepted.length;
  if (limit && limit > 0) accepted = accepted.slice(0, limit);
  return { accepted, rejected, duplicates };
}
