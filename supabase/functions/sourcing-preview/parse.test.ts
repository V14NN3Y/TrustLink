import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProductPage, parsePrice, validateSourceUrl, decodeEntities } from './parse.ts';

const URL_ = 'https://www.konga.com/product/galaxy-s25';

test('validateSourceUrl : accepte Konga/Jumia en https', () => {
  assert.ok(validateSourceUrl('https://www.konga.com/product/x'));
  assert.ok(validateSourceUrl('https://konga.com/product/x'));
  assert.ok(validateSourceUrl('https://www.jumia.com.ng/phone.html'));
  assert.ok(validateSourceUrl('  HTTPS://WWW.KONGA.COM/p  '));
});

test('validateSourceUrl : refuse SSRF et domaines piégés', () => {
  const bad = [
    'http://www.konga.com/p', 'https://konga.com.evil.test/p', 'https://evilkonga.com/p',
    'https://user:pw@konga.com/p', 'https://konga.com:8443/p', 'https://127.0.0.1/p',
    'https://localhost/p', 'https://169.254.169.254/latest/meta-data', 'https://konga.com./p',
    'ftp://konga.com/p', 'javascript:alert(1)', 'not a url', '', 'https://www.amazon.com/p',
  ];
  for (const b of bad) assert.equal(validateSourceUrl(b), null, b);
  assert.equal(validateSourceUrl(undefined), null);
  assert.equal(validateSourceUrl('https://konga.com/' + 'a'.repeat(3000)), null);
});

test('parsePrice : formats courants', () => {
  assert.equal(parsePrice('₦ 1,800,000'), 1800000);
  assert.equal(parsePrice('1,800,000.00'), 1800000);
  assert.equal(parsePrice('1.800.000,50'), 1800000.5);
  assert.equal(parsePrice('1800000'), 1800000);
  assert.equal(parsePrice('4,200'), 4200);
  assert.equal(parsePrice('2500.75'), 2500.75);
  assert.equal(parsePrice(15000), 15000);
  assert.equal(parsePrice('gratuit'), null);
  assert.equal(parsePrice('0'), null);
  assert.equal(parsePrice(-5), null);
});

test('decodeEntities', () => {
  assert.equal(decodeEntities('Tom &amp; Jerry &#39;x&#39; &quot;y&quot; &#x20A6;'), `Tom & Jerry 'x' "y" ₦`);
  assert.equal(decodeEntities('&inconnu;'), '&inconnu;');
});

test('JSON-LD Product (offre simple)', () => {
  const html = `<html><head><script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: 'Galaxy S25 Plus 512GB',
    image: ['https://img.test/a.jpg', 'https://img.test/b.jpg'],
    offers: { '@type': 'Offer', price: '1800000.00', priceCurrency: 'NGN' },
  })}</script></head></html>`;
  assert.deepEqual(parseProductPage(html, URL_), {
    title: 'Galaxy S25 Plus 512GB', price: 1800000, currency: 'NGN', image_url: 'https://img.test/a.jpg',
  });
});

test('JSON-LD dans @graph + AggregateOffer + image objet', () => {
  const html = `<script type="application/ld+json">${JSON.stringify({
    '@graph': [{ '@type': 'WebSite', name: 'Konga' },
      { '@type': ['Product', 'Thing'], name: 'Kettle', image: { url: '//img.test/k.jpg' },
        offers: { '@type': 'AggregateOffer', lowPrice: 4200, priceCurrency: '₦' } }],
  })}</script>`;
  const p = parseProductPage(html, URL_);
  assert.equal(p.title, 'Kettle');
  assert.equal(p.price, 4200);
  assert.equal(p.currency, 'NGN');
  assert.equal(p.image_url, 'https://img.test/k.jpg');
});

test('repli sur les balises meta Open Graph (ordre des attributs libre)', () => {
  const html = `<head><title>Ignoré | Konga</title>
    <meta content="Robe &amp; Foulard" property="og:title">
    <meta property='og:image' content='/media/robe.jpg'>
    <meta property="product:price:amount" content="12,500">
    <meta property="product:price:currency" content="ngn"></head>`;
  assert.deepEqual(parseProductPage(html, URL_), {
    title: 'Robe & Foulard', price: 12500, currency: 'NGN', image_url: 'https://www.konga.com/media/robe.jpg',
  });
});

test('dernier recours : <title>, devise NGN par défaut quand un prix existe', () => {
  const html = `<title> Mixeur   Pro </title><meta itemprop="price" content="9900">`;
  const p = parseProductPage(html, URL_);
  assert.equal(p.title, 'Mixeur Pro');
  assert.equal(p.price, 9900);
  assert.equal(p.currency, 'NGN');
  assert.equal(p.image_url, null);
});

test('JSON-LD invalide ignoré, image http forcée en https, image javascript: rejetée', () => {
  const html = `<script type="application/ld+json">{oups</script>
    <meta property="og:title" content="X"><meta property="og:image" content="http://img.test/x.jpg">`;
  assert.equal(parseProductPage(html, URL_).image_url, 'https://img.test/x.jpg');
  assert.equal(parseProductPage('<meta property="og:image" content="javascript:alert(1)">', URL_).image_url, null);
});

test('page sans produit : tout à null', () => {
  assert.deepEqual(parseProductPage('<html><body>Just a moment...</body></html>', URL_),
    { title: null, price: null, currency: null, image_url: null });
});
