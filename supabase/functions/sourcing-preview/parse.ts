// Analyse d'une fiche produit (Konga / Jumia) pour pré-remplir le formulaire « Sourcing par lien ».
// Code pur (sans API Deno) : testable avec Node (`node --test`) et utilisé par index.ts.

export const ALLOWED_HOSTS = ['konga.com', 'jumia.com.ng'];

export type ProductPreview = {
  title: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
};

/** Accepte uniquement https://[www.]konga.com / jumia.com.ng (et sous-domaines), sans identifiants ni port. */
export function validateSourceUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string' || raw.length > 2048) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== '443') return null;
  const host = u.hostname.toLowerCase();
  const ok = ALLOWED_HOSTS.some((a) => host === a || host.endsWith('.' + a));
  return ok ? u : null;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, g: string) => {
    if (g[0] === '#') {
      const code = g[1].toLowerCase() === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[g.toLowerCase()] ?? m;
  });
}

const clean = (s: unknown, max = 200): string | null => {
  if (typeof s !== 'string') return null;
  const t = decodeEntities(s).replace(/\s+/g, ' ').trim();
  return t ? t.slice(0, max) : null;
};

/** "1,800,000.00", "1.800.000,00", "₦ 1800000" -> nombre ; null si invalide. */
export function parsePrice(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : null;
  if (typeof v !== 'string') return null;
  let s = v.replace(/[^\d.,]/g, '');
  if (!s) return null;
  const dot = s.lastIndexOf('.');
  const comma = s.lastIndexOf(',');
  if (dot !== -1 && comma !== -1) {
    const dec = dot > comma ? '.' : ',';
    const thou = dec === '.' ? ',' : '.';
    s = s.split(thou).join('').replace(dec, '.');
  } else if (comma !== -1) {
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  } else if (dot !== -1) {
    s = /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '') : s;
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normCurrency(c: unknown): string | null {
  if (typeof c !== 'string') return null;
  const t = c.trim().toUpperCase();
  if (t === '₦' || t === 'NAIRA') return 'NGN';
  return /^[A-Z]{3}$/.test(t) ? t : null;
}

function absImage(src: unknown, base: string): string | null {
  if (typeof src !== 'string' || !src.trim()) return null;
  try {
    const u = new URL(decodeEntities(src.trim()), base);
    if (u.protocol === 'http:') u.protocol = 'https:';
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

// ---------- JSON-LD ----------
function jsonLdNodes(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  const walk = (n: any) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      out.push(n);
      if (n['@graph']) walk(n['@graph']);
    }
  };
  while ((m = re.exec(html))) {
    try {
      walk(JSON.parse(m[1].trim()));
    } catch { /* JSON-LD invalide : ignoré */ }
  }
  return out;
}

const isProduct = (n: any) => {
  const t = n?.['@type'];
  return t === 'Product' || (Array.isArray(t) && t.includes('Product'));
};

function fromJsonLd(html: string, base: string): Partial<ProductPreview> {
  const node = jsonLdNodes(html).find(isProduct);
  if (!node) return {};
  const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
  const img = Array.isArray(node.image) ? node.image[0] : node.image;
  return {
    title: clean(node.name),
    price: parsePrice(offers?.price ?? offers?.lowPrice),
    currency: normCurrency(offers?.priceCurrency),
    image_url: absImage(typeof img === 'object' ? img?.url : img, base),
  };
}

// ---------- <meta> ----------
function metas(html: string): Array<Record<string, string>> {
  const list: Array<Record<string, string>> = [];
  const tagRe = /<meta\s+[^>]*>/gi;
  const attrRe = /([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let t: RegExpExecArray | null;
  while ((t = tagRe.exec(html))) {
    const attrs: Record<string, string> = {};
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(t[0]))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? '';
    list.push(attrs);
  }
  return list;
}

function metaContent(all: Array<Record<string, string>>, names: string[]): string | null {
  for (const n of names) {
    const hit = all.find((m) => (m.property ?? m.name ?? m.itemprop ?? '').toLowerCase() === n && m.content);
    if (hit) return hit.content;
  }
  return null;
}

/** Extrait titre, prix, devise et image d'une page produit (JSON-LD, puis balises meta, puis <title>). */
export function parseProductPage(html: string, pageUrl: string): ProductPreview {
  const ld = fromJsonLd(html, pageUrl);
  const m = metas(html);
  const titleTag = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];

  const title = ld.title ?? clean(metaContent(m, ['og:title', 'twitter:title'])) ?? clean(titleTag);
  const price = ld.price ?? parsePrice(metaContent(m, ['product:price:amount', 'og:price:amount', 'price']));
  const currency = ld.currency ?? normCurrency(metaContent(m, ['product:price:currency', 'og:price:currency', 'pricecurrency']));
  const image_url = ld.image_url ?? absImage(metaContent(m, ['og:image', 'og:image:secure_url', 'twitter:image']), pageUrl);

  return { title, price, currency: price ? currency ?? 'NGN' : currency, image_url };
}
