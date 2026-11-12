#!/usr/bin/env python3
"""
TrustLink Marketplace Scraper & Catalog Pipeline
------------------------------------------------
Scrapes Nigerian e-commerce products (Jumia Nigeria & Konga Nigeria),
normalizes product data for TrustLink cross-border marketplace (Nigeria -> Benin),
and exports to JSON, CSV (Seller import format), SQL seed script, and direct Supabase insertion.
"""

import os
import re
import sys
import json
import time
import argparse
import shutil
import hashlib
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
from typing import List, Dict, Any, Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

# Default exchange rate NGN -> XOF (Franc CFA)
# e.g., 100,000 NGN ~ 42,000 XOF (rate = 0.42)
DEFAULT_NGN_TO_XOF = 0.42

# Chemins relatifs au dépôt (plus aucun chemin machine codé en dur)
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "output"
FRONTEND_DATA_FILES = [
    REPO_ROOT / "buyer" / "src" / "data" / "scrapedProducts.json",
    REPO_ROOT / "seller" / "src" / "data" / "scrapedProducts.json",
]

# Stock affiché quand la source ne le fournit pas (valeur estimée, signalée par stock_estimated).
DEFAULT_STOCK = 10

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1",
}

# TrustLink standardized categories (matching live Supabase categories)
TRUSTLINK_CATEGORIES = {
    "smartphones-tablettes": {
        "id": "a0000000-0000-4000-8000-000000000007",
        "name": "Smartphones & Tablettes",
        "slug": "smartphones-tablettes",
        "icon": "ri-smartphone-line",
        "sort_order": 1,
        "jumia_path": "/phones-tablets/",
        "konga_path": "/category/phones-tablets-5294",
    },
    "audio-casques": {
        "id": "a0000000-0000-4000-8000-000000000009",
        "name": "Électronique & TV",
        "slug": "audio-casques",
        "icon": "ri-tv-line",
        "sort_order": 2,
        "jumia_path": "/electronics/",
        "konga_path": "/category/electronics-5261",
    },
    "ordinateurs-bureautique": {
        "id": "a0000000-0000-4000-8000-000000000008",
        "name": "Ordinateurs & Bureautique",
        "slug": "ordinateurs-bureautique",
        "icon": "ri-laptop-line",
        "sort_order": 3,
        "jumia_path": "/computing/",
        "konga_path": "/category/computers-accessories-5227",
    },
    "mode-vetements": {
        "id": "a0000000-0000-4000-8000-000000000001",
        "name": "Mode & Vêtements",
        "slug": "mode-vetements",
        "icon": "ri-t-shirt-line",
        "sort_order": 4,
        "jumia_path": "/category-fashion-by-jumia/",
        "konga_path": "/category/konga-fashion-1256",
    },
    "cuisine-table": {
        "id": "a0000000-0000-4000-8000-00000000000d",
        "name": "Cuisine & Arts de la table",
        "slug": "cuisine-table",
        "icon": "ri-cup-line",
        "sort_order": 5,
        "jumia_path": "/home-office/",
        "konga_path": "/category/home-kitchen-602",
    },
    "beaute-soins": {
        "id": "a0000000-0000-4000-8000-000000000005",
        "name": "Beauté & Soins",
        "slug": "beaute-soins",
        "icon": "ri-sparkling-line",
        "sort_order": 6,
        "jumia_path": "/health-beauty/",
        "konga_path": "/category/beauty-health-personal-care-4",
    },
}


def clean_price(text: Optional[str]) -> float:
    """Extract float number from currency strings like '₦ 1,800,000' or '1800000'."""
    if not text:
        return 0.0
    cleaned = re.sub(r"[^\d.]", "", str(text).replace(",", ""))
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def slugify(text: str) -> str:
    """Slugify text string."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


def make_session() -> requests.Session:
    """Session HTTP avec en-têtes navigateur et relances automatiques (429/5xx)."""
    session = requests.Session()
    session.headers.update(DEFAULT_HEADERS)
    retry = Retry(total=3, backoff_factor=1.0, status_forcelist=(429, 500, 502, 503, 504),
                  allowed_methods=("GET",), respect_retry_after_header=True)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def seller_label(source: Optional[str]) -> str:
    """Nom affiché pour l'origine du produit (on ne prétend aucune certification)."""
    src = (source or "").lower()
    if "konga" in src:
        return "Konga Nigeria"
    if "jumia" in src:
        return "Jumia Nigeria"
    return source or "Marketplace nigériane"


def make_product_id(p: Dict[str, Any]) -> str:
    """Identifiant stable : ne dépend pas de l'ordre de scraping."""
    sku = str(p.get("sku") or "").strip()
    if sku:
        return f"tl-{slugify(sku)}"
    basis = p.get("source_url") or p.get("name") or ""
    return "tl-" + hashlib.sha1(basis.encode("utf-8")).hexdigest()[:10]


def fix_mojibake(text: Any) -> Any:
    """Répare « CrÃ¨me » -> « Crème » (UTF-8 lu comme latin-1).
    Un « â » isolé entre espaces est un tiret cadratin dont les octets ont été perdus : remplacé par « – »."""
    if isinstance(text, str):
        text = re.sub(r"(?<=\s)â(?=\s)", "–", text)
    if not isinstance(text, str) or not re.search(r"[ÃÂâ][\x80-\xbf€™œžŸ‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜š›]", text):
        return text
    try:
        return text.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        try:
            return text.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return text


def neutral_description(name: str) -> str:
    return f"{name} - Importé du Nigeria, livrable à Cotonou et partout au Bénin sous protection TrustLink Escrow."


# Anciens textes marketing qui affirmaient une certification non vérifiée
_LEGACY_CLAIMS = re.compile(
    r"\s*-\s*Produit certifié(?: authentique)? importé du Nigeria.*?(?:TrustLink Escrow\.?)\s*$", re.S)


def load_supabase_env() -> Dict[str, Optional[str]]:
    """URL / clé anon depuis l'environnement, sinon buyer/.env (relatif au dépôt)."""
    url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY")
    env_file = REPO_ROOT / "buyer" / ".env"
    if (not url or not key) and env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("VITE_SUPABASE_URL=") and not url:
                url = line.split("=", 1)[1].strip()
            elif line.startswith("VITE_SUPABASE_ANON_KEY=") and not key:
                key = line.split("=", 1)[1].strip()
    return {"url": url, "key": key}


def fetch_live_rate(url: Optional[str], key: Optional[str], session: Optional[requests.Session] = None) -> Optional[float]:
    """Lit le taux NGN->XOF dans la table exchange_rates (lecture publique)."""
    if not url or not key:
        return None
    try:
        resp = (session or requests).get(
            f"{url.rstrip('/')}/rest/v1/exchange_rates",
            params={"from_currency": "eq.NGN", "to_currency": "eq.XOF", "select": "rate"},
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
            timeout=8,
        )
        resp.raise_for_status()
        rows = resp.json()
        rate = float(rows[0]["rate"]) if rows else 0.0
        return rate if rate > 0 else None
    except Exception as e:  # réseau, JSON, clé absente...
        print(f"[Rate] Taux live indisponible ({e})")
        return None


def resolve_xof_rate(value: str) -> float:
    """'auto' -> taux Supabase, repli sur la valeur par défaut ; sinon nombre explicite."""
    if str(value).lower() != "auto":
        try:
            rate = float(value)
        except ValueError:
            raise SystemExit(f"--xof-rate invalide : {value!r} (nombre ou 'auto')")
        if rate <= 0:
            raise SystemExit("--xof-rate doit être > 0")
        return rate
    env = load_supabase_env()
    live = fetch_live_rate(env["url"], env["key"])
    if live:
        print(f"[Rate] Taux live NGN->XOF : {live}")
        return live
    print(f"[Rate] Repli sur le taux par défaut : {DEFAULT_NGN_TO_XOF}")
    return DEFAULT_NGN_TO_XOF


class JumiaScraper:
    """Scraper for Jumia Nigeria (jumia.com.ng)."""

    BASE_URL = "https://www.jumia.com.ng"

    def __init__(self, session: Optional[requests.Session] = None):
        self.session = session or make_session()
        self.session.headers.update(DEFAULT_HEADERS)

    def scrape_html(self, html_content: str, cat_key: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Parse raw Jumia category HTML into normalized products."""
        soup = BeautifulSoup(html_content, "html.parser")
        cat_info = TRUSTLINK_CATEGORIES.get(cat_key, {})
        articles = soup.find_all("article", class_=lambda c: c and ("prd" in c or "c-prd" in c))
        products = []

        for art in articles[:limit]:
            name_el = art.find("h3", class_="name") or art.find(class_="name")
            if not name_el:
                continue
            name = name_el.get_text(strip=True)

            price_el = art.find("div", class_="prc") or art.find(class_="prc")
            price_ngn = clean_price(price_el.get_text(strip=True) if price_el else "")

            old_price_el = art.find("div", class_="old") or art.find(class_="old")
            old_price_ngn = clean_price(old_price_el.get_text(strip=True) if old_price_el else "")

            img_el = art.find("img")
            img_url = ""
            if img_el:
                img_url = (
                    img_el.get("data-src")
                    or img_el.get("src")
                    or ""
                )

            rating = None       # None = pas d'avis sur la source (on n'invente rien)
            rating_count = 0
            rev_el = art.find("div", class_="rev")
            if rev_el:
                stars_el = rev_el.find("div", class_="in")
                if stars_el and "style" in stars_el.attrs:
                    w = re.search(r"width:\s*(\d+)%", stars_el["style"])
                    if w:
                        rating = round(float(w.group(1)) / 20.0, 1)
                cnt_match = re.search(r"\((\d+)\)", rev_el.get_text())
                if cnt_match:
                    rating_count = int(cnt_match.group(1))

            link_el = art.find("a", class_="core") or art.find("a")
            href = link_el.get("href") if link_el else ""
            source_url = urljoin(self.BASE_URL, href) if href else ""

            products.append({
                "source": "Jumia Nigeria",
                "source_url": source_url,
                "name": name,
                "category_key": cat_key,
                "category_name": cat_info.get("name", "Général"),
                "category_slug": cat_info.get("slug", cat_key),
                "price_ngn": price_ngn,
                "old_price_ngn": old_price_ngn if old_price_ngn > price_ngn else None,
                "image_url": img_url,
                "rating": rating,
                "rating_count": rating_count,
                "stock_quantity": None,  # inconnu : CatalogManager applique le stock par défaut
                "delivery_min_days": 3,
                "delivery_max_days": 6,
                "description": neutral_description(name),
            })

        return products

    def scrape_category(self, cat_key: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch and scrape category from Jumia directly."""
        cat_info = TRUSTLINK_CATEGORIES.get(cat_key)
        if not cat_info:
            return []
        url = urljoin(self.BASE_URL, cat_info["jumia_path"])
        try:
            resp = self.session.get(url, timeout=12)
            if resp.status_code == 200:
                return self.scrape_html(resp.text, cat_key, limit)
            print(f"[Jumia] HTTP {resp.status_code} on {url} (Cloudflare challenge active)")
            return []
        except Exception as e:
            print(f"[Jumia] Error fetching {url}: {e}")
            return []


class KongaScraper:
    """Scraper for Konga Nigeria (live Nigerian catalog)."""

    BASE_URL = "https://www.konga.com"

    def __init__(self, session: Optional[requests.Session] = None):
        self.session = session or make_session()
        self.session.headers.update(DEFAULT_HEADERS)

    def scrape_category(self, cat_key: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Extract products from Konga React Server Component stream."""
        cat_info = TRUSTLINK_CATEGORIES.get(cat_key)
        if not cat_info:
            return []
        url = urljoin(self.BASE_URL, cat_info["konga_path"])
        try:
            resp = self.session.get(url, timeout=15)
            if resp.status_code != 200:
                print(f"[Konga] HTTP {resp.status_code} on {url}")
                return []

            matches = re.findall(r'self\.__next_f\.push\(\[1,\"(.*?)\"\]\)', resp.text)
            for m in matches:
                if "initialData" in m:
                    decoded = self._decode_js_string(m)
                    idx = decoded.find('"initialData":')
                    if idx != -1:
                        sub = decoded[idx + len('"initialData":'):]
                        decoder = json.JSONDecoder()
                        obj, _ = decoder.raw_decode(sub)
                        raw_prods = obj.get("products", [])
                        return self._normalize_products(raw_prods[:limit], cat_key)
            return []
        except Exception as e:
            print(f"[Konga] Error scraping {url}: {e}")
            return []

    @staticmethod
    def _decode_js_string(m: str) -> str:
        """Décode un littéral JS (\\n, \\", \\uXXXX) en conservant l'UTF-8 (unicode_escape le cassait)."""
        try:
            return json.loads('"' + m + '"')
        except ValueError:
            return m.encode("utf-8", "backslashreplace").decode("unicode_escape", "ignore")

    def _normalize_products(self, raw_prods: List[Dict], cat_key: str) -> List[Dict[str, Any]]:
        cat_info = TRUSTLINK_CATEGORIES.get(cat_key, {})
        products = []
        for p in raw_prods:
            name = p.get("name", "").strip()
            if not name:
                continue

            price_ngn = float(p.get("price", 0))
            orig_price = float(p.get("original_price", 0)) if p.get("original_price") else None
            qty = (p.get("stock_status") or {}).get("quantity")
            stock = int(qty) if qty not in (None, "") else None
            raw_rating = p.get("rating")
            rating = float(raw_rating) if raw_rating else None
            review_count = int(p.get("review_count") or 0)

            img_thumb = p.get("image_thumbnail") or ""
            if img_thumb:
                if not img_thumb.startswith("http"):
                    img_url = f"https://www-konga-com-res.cloudinary.com/media/catalog/product{img_thumb}"
                else:
                    img_url = img_thumb
            else:
                img_url = "/placeholder-product.svg"

            raw_desc = p.get("description")
            if isinstance(raw_desc, dict):
                description = raw_desc.get("html") or raw_desc.get("text") or ""
            elif isinstance(raw_desc, str) and raw_desc.strip() and raw_desc.strip() != "[object Object]":
                description = raw_desc.strip()
            else:
                description = ""

            if not description or description == "[object Object]":
                description = neutral_description(name)

            # Clean HTML tags from description if any
            clean_desc = re.sub(r"<[^>]+>", " ", description)
            clean_desc = re.sub(r"\s+", " ", clean_desc).strip()

            products.append({
                "source": "Nigerian Marketplace (Konga)",
                "source_url": f"https://www.konga.com/product/{p.get('url_key', '')}",
                "sku": str(p.get("sku", "")),
                "name": name,
                "category_key": cat_key,
                "category_name": cat_info.get("name", "Général"),
                "category_slug": cat_info.get("slug", cat_key),
                "price_ngn": price_ngn,
                "old_price_ngn": orig_price if orig_price and orig_price > price_ngn else None,
                "image_url": img_url,
                "rating": rating,
                "rating_count": review_count,
                "stock_quantity": stock,
                "delivery_min_days": 2,
                "delivery_max_days": 5,
                "description": clean_desc[:400] if len(clean_desc) > 400 else clean_desc,
            })
        return products


class CatalogManager:
    """Handles conversion, export, and Supabase database population."""

    def __init__(self, xof_rate: float = DEFAULT_NGN_TO_XOF, default_stock: int = DEFAULT_STOCK):
        self.xof_rate = xof_rate
        self.default_stock = default_stock

    def clean_existing(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Nettoie un catalogue déjà généré (mode --from-json) :
        - répare l'encodage (CrÃ¨me -> Crème) ;
        - retire les textes marketing non vérifiés ;
        - si TOUS les produits partagent la même note / le même stock, ce sont d'anciennes
          valeurs par défaut du scraper : elles sont supprimées au lieu d'être présentées comme réelles."""
        cleaned = []
        for p in products:
            item = dict(p)
            for field in ("name", "description", "seller"):
                if field in item:
                    item[field] = (fix_mojibake(item[field]) or "").strip() if isinstance(item[field], str) else item[field]
            if item.get("name"):
                desc = _LEGACY_CLAIMS.sub("", item.get("description") or "").strip()
                if not desc or desc == item["name"] or "certifié" in desc.lower():
                    desc = neutral_description(item["name"])
                item["description"] = desc
            cleaned.append(item)

        if len(cleaned) >= 5:
            if len({(p.get("rating"), p.get("rating_count")) for p in cleaned}) == 1:
                print("[Clean] Note/avis identiques sur tout le catalogue : valeurs par défaut supprimées.")
                for p in cleaned:
                    p["rating"], p["rating_count"] = None, 0
            if len({p.get("stock_quantity") for p in cleaned}) == 1:
                print("[Clean] Stock identique sur tout le catalogue : valeur par défaut remplacée par « inconnu ».")
                for p in cleaned:
                    p["stock_quantity"] = None
        return cleaned

    def enrich_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add converted FCFA (XOF) prices, deterministic IDs, and computed fields."""
        enriched = []
        used_ids = set()
        scraped_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        for idx, p in enumerate(products):
            price_xof = round(p["price_ngn"] * self.xof_rate)
            # Ensure price is sensible (> 1000 XOF)
            if price_xof < 1000 and p["price_ngn"] > 0:
                price_xof = round(p["price_ngn"])

            old_xof = round(p["old_price_ngn"] * self.xof_rate) if p.get("old_price_ngn") else None
            discount = None
            if old_xof and old_xof > price_xof:
                discount = round(((old_xof - price_xof) / old_xof) * 100)

            item = dict(p)
            base_id = make_product_id(p)
            pid, n = base_id, 2
            while pid in used_ids:
                pid, n = f"{base_id}-{n}", n + 1
            used_ids.add(pid)
            item["id"] = pid
            item["seller"] = seller_label(p.get("source"))
            item["seller_rating"] = None   # aucune donnée source : pas de note vendeur inventée
            item["sales"] = None           # idem pour le nombre de ventes
            if item.get("stock_quantity") is None:
                item["stock_quantity"] = self.default_stock
                item["stock_estimated"] = True
            else:
                item["stock_estimated"] = False
            item["scraped_at"] = scraped_at
            item["xof_rate"] = self.xof_rate
            item["price_fcfa"] = price_xof
            item["price"] = price_xof  # Primary TrustLink currency
            item["currency"] = "XOF"
            item["original_price_fcfa"] = old_xof
            item["discount"] = discount
            item["images"] = [p["image_url"]] if p.get("image_url") else ["/placeholder-product.svg"]
            enriched.append(item)
        return enriched

    def export_json(self, products: List[Dict[str, Any]], filepath: str):
        """Export full catalog to JSON."""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"[Export] Saved {len(products)} products to {filepath}")

    def export_seller_csv(self, products: List[Dict[str, Any]], filepath: str):
        """Export CSV compatible with TrustLink Seller ImportCSVModal."""
        import csv
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["name", "price", "stock", "description", "category", "image_url"])
            for p in products:
                desc = p.get("description", "").replace("\n", " ").replace(",", " ")
                writer.writerow([
                    p["name"],
                    p["price_fcfa"],
                    p["stock_quantity"],
                    desc,
                    p["category_name"],
                    p["image_url"],
                ])
        print(f"[Export] Saved Seller CSV import file to {filepath}")

    def export_sql_seed(self, products: List[Dict[str, Any]], filepath: str):
        """Generate a complete PostgreSQL / Supabase seed SQL script."""
        lines = []
        lines.append("-- =====================================================")
        lines.append("-- TrustLink Catalog Seed - Generated by Web Scraper")
        lines.append(f"-- Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append(f"-- Products: {len(products)}")
        lines.append("-- =====================================================\n")

        # 1. Categories Upsert
        lines.append("-- 1. Standardized Categories")
        lines.append("INSERT INTO categories (name, slug, icon, sort_order, is_active)")
        lines.append("VALUES")
        cat_values = []
        for cat in TRUSTLINK_CATEGORIES.values():
            cat_name = cat["name"].replace("'", "''")
            cat_slug = cat["slug"].replace("'", "''")
            cat_icon = cat["icon"]
            sort_ord = cat["sort_order"]
            cat_values.append(f"  ('{cat_name}', '{cat_slug}', '{cat_icon}', {sort_ord}, true)")
        lines.append(",\n".join(cat_values))
        lines.append("ON CONFLICT (slug) DO UPDATE SET")
        lines.append("  name = EXCLUDED.name,")
        lines.append("  icon = EXCLUDED.icon,")
        lines.append("  sort_order = EXCLUDED.sort_order;\n")

        # 2. Seller Resolution Logic
        lines.append("-- 2. Ensure a valid seller profile exists")
        lines.append("""
DO $$
DECLARE
  v_seller_id uuid;
BEGIN
  SELECT id INTO v_seller_id FROM profiles WHERE role = 'seller' LIMIT 1;
  IF v_seller_id IS NULL THEN
    SELECT id INTO v_seller_id FROM profiles LIMIT 1;
  END IF;
  IF v_seller_id IS NULL THEN
    SELECT seller_id INTO v_seller_id FROM products LIMIT 1;
  END IF;
  IF v_seller_id IS NULL THEN
    SELECT id INTO v_seller_id FROM auth.users LIMIT 1;
    IF v_seller_id IS NOT NULL THEN
      INSERT INTO profiles (id, role, full_name, business_name)
      VALUES (v_seller_id, 'seller', 'TrustLink Nigeria Store', 'TrustLink Official Store')
      ON CONFLICT (id) DO UPDATE SET role = 'seller';
    END IF;
  END IF;
  IF v_seller_id IS NOT NULL THEN
    RAISE NOTICE 'Using seller profile ID: %', v_seller_id;
  ELSE
    RAISE NOTICE 'No user found in auth.users. Please create a user account first.';
  END IF;
END $$;
""")

        # 3. Insert Products and Images (Idempotent)
        lines.append("-- 3. Insert Scraped Products and Images (Idempotent)")
        lines.append("""
DO $$
DECLARE
  v_seller_id uuid;
  v_cat_id uuid;
  v_prod_id uuid;
  v_inserted integer := 0;
BEGIN
  -- Resolve seller
  SELECT id INTO v_seller_id FROM profiles WHERE role = 'seller' LIMIT 1;
  IF v_seller_id IS NULL THEN
    SELECT id INTO v_seller_id FROM profiles LIMIT 1;
  END IF;
  IF v_seller_id IS NULL THEN
    SELECT seller_id INTO v_seller_id FROM products LIMIT 1;
  END IF;
  IF v_seller_id IS NULL THEN
    SELECT id INTO v_seller_id FROM auth.users LIMIT 1;
  END IF;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Impossible d''insérer les produits : aucun compte utilisateur trouvé dans la base de données. Créez un compte sur /register d''abord.';
  END IF;
""")

        for p in products:
            p_name = p["name"].replace("'", "''")
            p_desc = p.get("description", "").replace("'", "''")
            p_price = p["price_fcfa"]
            p_stock = p["stock_quantity"]
            p_min_days = p.get("delivery_min_days", 2)
            p_max_days = p.get("delivery_max_days", 5)
            p_cat_slug = p["category_slug"]
            p_img = p.get("image_url", "").replace("'", "''")

            lines.append(f"""
  -- Produit : {p['name'][:50]}
  SELECT id INTO v_cat_id FROM categories WHERE slug = '{p_cat_slug}' LIMIT 1;
  SELECT id INTO v_prod_id FROM products WHERE seller_id = v_seller_id AND name = '{p_name}' LIMIT 1;
  
  IF v_prod_id IS NULL THEN
    INSERT INTO products (
      seller_id, category_id, name, description, price, currency,
      stock_quantity, status, delivery_min_days, delivery_max_days
    ) VALUES (
      v_seller_id, v_cat_id, '{p_name}', '{p_desc}', {p_price}, 'XOF',
      {p_stock}, 'approved', {p_min_days}, {p_max_days}
    ) RETURNING id INTO v_prod_id;

    IF v_prod_id IS NOT NULL AND '{p_img}' <> '' THEN
      INSERT INTO product_images (product_id, url, is_primary, sort_order)
      VALUES (v_prod_id, '{p_img}', true, 0);
    END IF;
    v_inserted := v_inserted + 1;
  END IF;
""")

        lines.append("""
  RAISE NOTICE 'Execution terminee : % nouveaux produits inseres avec succes !', v_inserted;
END $$;
""")

        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"[Export] Saved Supabase SQL seed to {filepath}")

    def push_to_supabase(self, products: List[Dict[str, Any]], supabase_url: str, supabase_key: str):
        """Directly insert categories, products, and images into Supabase REST API."""
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        print(f"[Supabase] Connecting to {supabase_url}...")
        
        # 1. Fetch or create categories
        cat_map = {}
        for cat in TRUSTLINK_CATEGORIES.values():
            resp = requests.post(
                f"{supabase_url}/rest/v1/categories",
                headers=dict(headers, Prefer="resolution=merge-duplicates,return=representation"),
                json={
                    "name": cat["name"],
                    "slug": cat["slug"],
                    "icon": cat["icon"],
                    "sort_order": cat["sort_order"],
                    "is_active": True,
                },
                timeout=10,
            )
            if resp.status_code in (200, 201):
                rows = resp.json()
                if rows:
                    cat_map[cat["slug"]] = rows[0]["id"]
            else:
                # Try GET
                get_resp = requests.get(
                    f"{supabase_url}/rest/v1/categories?slug=eq.{cat['slug']}&select=id",
                    headers=headers,
                    timeout=10,
                )
                if get_resp.status_code == 200 and get_resp.json():
                    cat_map[cat["slug"]] = get_resp.json()[0]["id"]

        print(f"[Supabase] Categories mapped: {len(cat_map)}")

        # 2. Get an active seller profile ID
        seller_resp = requests.get(
            f"{supabase_url}/rest/v1/profiles?role=eq.seller&select=id&limit=1",
            headers=headers,
            timeout=10,
        )
        seller_id = None
        if seller_resp.status_code == 200 and seller_resp.json():
            seller_id = seller_resp.json()[0]["id"]
        else:
            # Fallback to any profile
            any_resp = requests.get(
                f"{supabase_url}/rest/v1/profiles?select=id&limit=1",
                headers=headers,
                timeout=10,
            )
            if any_resp.status_code == 200 and any_resp.json():
                seller_id = any_resp.json()[0]["id"]

        if not seller_id:
            print("[Supabase Warning] No seller or profile found in Supabase! SQL seed can be used instead.")
            return False

        print(f"[Supabase] Using seller profile: {seller_id}")

        # 3. Insert products
        success_count = 0
        for p in products:
            cat_id = cat_map.get(p["category_slug"])
            prod_payload = {
                "seller_id": seller_id,
                "category_id": cat_id,
                "name": p["name"],
                "description": p.get("description", ""),
                "price": p["price_fcfa"],
                "currency": "XOF",
                "stock_quantity": p["stock_quantity"],
                "status": "approved",
                "delivery_min_days": p.get("delivery_min_days", 2),
                "delivery_max_days": p.get("delivery_max_days", 5),
            }
            p_resp = requests.post(
                f"{supabase_url}/rest/v1/products",
                headers=headers,
                json=prod_payload,
                timeout=10,
            )
            if p_resp.status_code in (200, 201):
                p_data = p_resp.json()
                if p_data:
                    prod_id = p_data[0]["id"]
                    # Insert primary image
                    if p.get("image_url"):
                        requests.post(
                            f"{supabase_url}/rest/v1/product_images",
                            headers=headers,
                            json={
                                "product_id": prod_id,
                                "url": p["image_url"],
                                "is_primary": True,
                                "sort_order": 0,
                            },
                            timeout=10,
                        )
                    success_count += 1
            else:
                print(f"[Supabase Error] Failed to insert '{p['name'][:30]}': {p_resp.status_code} {p_resp.text}")

        print(f"[Supabase] Successfully inserted {success_count}/{len(products)} products!")
        return True


def sync_frontends(json_path: Path) -> None:
    """Copie le JSON généré vers les apps buyer et seller (une seule source de vérité)."""
    for target in FRONTEND_DATA_FILES:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(json_path, target)
        print(f"[Sync] {target.relative_to(REPO_ROOT)}")


def main():
    parser = argparse.ArgumentParser(description="TrustLink E-Commerce Web Scraper & Catalog Tool")
    parser.add_argument("--source", choices=["jumia", "konga", "auto"], default="auto",
                        help="Scraping source: jumia, konga, or auto-fallback (default: auto)")
    parser.add_argument("--categories", type=str, default="all",
                        help="Comma-separated category keys (" + ", ".join(TRUSTLINK_CATEGORIES) + ") or 'all'")
    parser.add_argument("--limit-per-cat", type=int, default=10,
                        help="Max products per category (default: 10)")
    parser.add_argument("--output-dir", type=str, default=str(DEFAULT_OUTPUT_DIR),
                        help="Directory to save generated JSON, CSV and SQL files (default: scraper/output)")
    parser.add_argument("--html-file", type=str, default=None,
                        help="Optional path to local Jumia HTML file to parse")
    parser.add_argument("--from-json", type=str, default=None,
                        help="Regenerate exports from an existing scraped_products.json (no network): "
                             "repairs encoding and drops placeholder ratings/stock")
    parser.add_argument("--push-supabase", action="store_true",
                        help="Directly push scraped products to Supabase REST API")
    parser.add_argument("--sync-frontends", action="store_true",
                        help="Copy scraped_products.json into buyer/src/data and seller/src/data")
    parser.add_argument("--xof-rate", type=str, default="auto",
                        help="NGN->XOF rate: a number, or 'auto' (Supabase exchange_rates, "
                             f"fallback {DEFAULT_NGN_TO_XOF}) (default: auto)")
    parser.add_argument("--default-stock", type=int, default=DEFAULT_STOCK,
                        help=f"Stock shown when the source gives none, flagged stock_estimated (default: {DEFAULT_STOCK})")

    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Determine categories
    if args.categories == "all":
        target_cats = list(TRUSTLINK_CATEGORIES.keys())
    else:
        requested = [c.strip() for c in args.categories.split(",") if c.strip()]
        unknown = [c for c in requested if c not in TRUSTLINK_CATEGORIES]
        if unknown:
            parser.error(f"Unknown categories: {', '.join(unknown)}. Valid: {', '.join(TRUSTLINK_CATEGORIES)}")
        target_cats = requested

    xof_rate = resolve_xof_rate(args.xof_rate)
    mgr = CatalogManager(xof_rate=xof_rate, default_stock=args.default_stock)

    all_products = []

    if args.from_json:
        with open(args.from_json, "r", encoding="utf-8") as f:
            all_products = mgr.clean_existing(json.load(f))
        print(f"[Scraper] Loaded {len(all_products)} products from {args.from_json}")
    else:
        jumia = JumiaScraper()
        konga = KongaScraper()

        # If local HTML file is provided
        if args.html_file and os.path.exists(args.html_file):
            print(f"[Scraper] Parsing local HTML file: {args.html_file}")
            with open(args.html_file, "r", encoding="utf-8") as f:
                html = f.read()
            cat_key = target_cats[0] if target_cats else "smartphones-tablettes"
            all_products.extend(jumia.scrape_html(html, cat_key, limit=args.limit_per_cat))
        else:
            for cat_key in target_cats:
                cat_name = TRUSTLINK_CATEGORIES[cat_key]["name"]
                print(f"\n[Scraper] Scraping category: {cat_name} ({cat_key})...")
                products = []

                if args.source in ("jumia", "auto"):
                    products = jumia.scrape_category(cat_key, limit=args.limit_per_cat)
                    if products:
                        print(f"  -> Extracted {len(products)} products from Jumia Nigeria")

                if not products and args.source in ("konga", "auto"):
                    if args.source == "auto":
                        print("  -> Cloudflare challenge on Jumia; switching automatically to live Nigerian marketplace stream...")
                    products = konga.scrape_category(cat_key, limit=args.limit_per_cat)
                    if products:
                        print(f"  -> Extracted {len(products)} products from Nigerian marketplace")

                all_products.extend(products)
                time.sleep(1)

    print(f"\n[Scraper] Total products collected: {len(all_products)}")
    if not all_products:
        raise SystemExit("[Scraper] Aucun produit collecté : exports existants conservés (rien n'a été écrasé).")

    # Enrich with FCFA prices and TrustLink metadata
    enriched = mgr.enrich_products(all_products)

    # Export
    json_path = output_dir / "scraped_products.json"
    csv_path = output_dir / "scraped_products_seller.csv"
    sql_path = output_dir / "seed_catalog.sql"

    mgr.export_json(enriched, str(json_path))
    mgr.export_seller_csv(enriched, str(csv_path))
    mgr.export_sql_seed(enriched, str(sql_path))

    if args.sync_frontends:
        sync_frontends(json_path)

    # Push to Supabase if requested
    if args.push_supabase:
        env = load_supabase_env()
        if env["url"] and env["key"]:
            mgr.push_to_supabase(enriched, env["url"], env["key"])
        else:
            print("[Supabase] Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment or buyer/.env")

    print("\n✅ Scraping and catalog export completed successfully!")


if __name__ == "__main__":
    main()
