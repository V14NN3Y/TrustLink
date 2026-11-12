// Run with: node --test   (from the scripts/ folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapProduct, mapAll, normalizeSourceUrl, detectSourceSite, slugify, collectImages } from '../lib/product-mapping.mjs';

const ctx = { rate: 0.41, supplierId: 'sup-1', status: 'approved', defaultStock: 10, now: new Date('2026-11-12T00:00:00Z') };
const base = {
  name: 'Samsung Galaxy A15 128GB',
  source_url: 'https://www.konga.com/product/galaxy-a15?utm_source=ig#reviews',
  price_ngn: 200000,
  images: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/a.jpg', 'notaurl', 'https://cdn.example.com/b.jpg'],
  category_slug: 'smartphones-tablettes',
  category_name: 'Smartphones & Tablettes',
};

test('converts Naira to FCFA with the given rate and keeps the source price', () => {
  const r = mapProduct(base, ctx);
  assert.equal(r.ok, true);
  assert.equal(r.product.price, 82000);
  assert.equal(r.product.source_price_ngn, 200000);
  assert.equal(r.product.exchange_rate_used, 0.41);
  assert.equal(r.product.currency, 'XOF');
  assert.equal(r.product.seller_id, 'sup-1');
  assert.equal(r.product.status, 'approved');
});

test('normalizes the source URL (upsert key)', () => {
  assert.equal(normalizeSourceUrl(base.source_url), 'https://www.konga.com/product/galaxy-a15');
  assert.equal(normalizeSourceUrl('https://Shop.myshopify.com/products/x/?variant=2'), 'https://shop.myshopify.com/products/x/?variant=2');
});

test('detects the source site', () => {
  assert.equal(detectSourceSite('https://www.konga.com/p'), 'konga');
  assert.equal(detectSourceSite('https://www.jumia.com.ng/p'), 'jumia');
  assert.equal(detectSourceSite('https://slot.ng/p'), 'slot');
  assert.equal(detectSourceSite('https://naija-gadgets.myshopify.com/p'), 'shopify:naija-gadgets');
  assert.equal(detectSourceSite('https://foo.ng/p', 'Shopify:Foo'), 'shopify:foo');
});

test('dedupes and filters images, first one is the main image', () => {
  assert.deepEqual(collectImages(base), ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg']);
  assert.deepEqual(collectImages({ image_url: 'https://x.y/z.png' }), ['https://x.y/z.png']);
});

test('accepts a price already in XOF when price_ngn is missing', () => {
  const { price_ngn, ...rest } = base;
  const r = mapProduct({ ...rest, price: '15 000' }, ctx);
  assert.equal(r.ok, true);
  assert.equal(r.product.price, 15000);
  assert.equal(r.product.source_price_ngn, null);
  assert.equal(r.product.exchange_rate_used, null);
});

test('accepts Naira prices written as text', () => {
  const r = mapProduct({ ...base, price_ngn: '₦1,250,000' }, ctx);
  assert.equal(r.product.source_price_ngn, 1250000);
});

test('rejects invalid items with readable reasons', () => {
  const r = mapProduct({ name: 'x', source_url: 'ftp://a', price_ngn: 0, images: [] }, ctx);
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 4);
  const noRate = mapProduct(base, { ...ctx, rate: null });
  assert.deepEqual(noRate.errors, ['no NGN→XOF exchange rate available']);
});

test('applies defaults and keeps delivery days consistent', () => {
  const r = mapProduct({ ...base, delivery_min_days: 9, delivery_max_days: 4 }, ctx);
  assert.equal(r.product.stock_quantity, 10);
  assert.equal(r.product.delivery_min_days, 9);
  assert.equal(r.product.delivery_max_days, 9);
  assert.match(r.product.description, /TrustLink Escrow/);
  assert.deepEqual(r.category, { slug: 'smartphones-tablettes', name: 'Smartphones & Tablettes' });
});

test('slugify handles accents and symbols', () => {
  assert.equal(slugify('Électronique & TV'), 'electronique-tv');
});

test('mapAll drops duplicates (last wins), reports rejects, applies the limit', () => {
  const items = [
    base,
    { ...base, source_url: 'https://www.konga.com/product/galaxy-a15', price_ngn: 210000 },
    { ...base, source_url: 'https://www.konga.com/product/other' },
    { name: '' },
  ];
  const r = mapAll(items, ctx);
  assert.equal(r.accepted.length, 2);
  assert.equal(r.duplicates, 1);
  assert.equal(r.rejected.length, 1);
  assert.equal(r.accepted.find(a => a.product.source_url.endsWith('galaxy-a15')).product.source_price_ngn, 210000);
  assert.equal(mapAll(items, ctx, { limit: 1 }).accepted.length, 1);
  assert.throws(() => mapAll({}, ctx));
});
