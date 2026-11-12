import json
import sys
from pathlib import Path

import pytest
import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import jumia_scraper as js  # noqa: E402


# ---------- helpers ----------
def test_clean_price():
    assert js.clean_price("₦ 1,800,000") == 1800000.0
    assert js.clean_price("") == 0.0
    assert js.clean_price(None) == 0.0


def test_product_id_is_stable_and_order_independent():
    a = {"sku": "6670679", "name": "A"}
    b = {"source_url": "https://x.test/p/1", "name": "B"}
    assert js.make_product_id(a) == "tl-6670679"
    assert js.make_product_id(b) == js.make_product_id(dict(b))
    assert js.make_product_id(b).startswith("tl-") and len(js.make_product_id(b)) == 13


def test_fix_mojibake():
    assert js.fix_mojibake("CrÃ¨me Soft Shower Gel") == "Crème Soft Shower Gel"
    assert js.fix_mojibake("HP 240R G10 Notebook PC â Intel Core 5") == "HP 240R G10 Notebook PC – Intel Core 5"
    assert js.fix_mojibake("Crème déjà correcte") == "Crème déjà correcte"
    assert js.fix_mojibake(None) is None


def test_decode_js_string_keeps_utf8():
    assert js.KongaScraper._decode_js_string('Cr\\u00e8me \\"x\\"') == 'Crème "x"'
    assert js.KongaScraper._decode_js_string("Crème") == "Crème"


# ---------- scrapers : aucune donnée inventée ----------
def konga_raw(**over):
    p = {"name": "Kettle", "price": 4200, "sku": 99, "url_key": "kettle", "image_thumbnail": "/k/e.jpg"}
    p.update(over)
    return p


def test_konga_without_rating_or_stock_has_none():
    [item] = js.KongaScraper(session=requests.Session())._normalize_products([konga_raw()], "cuisine-table")
    assert item["rating"] is None
    assert item["rating_count"] == 0
    assert item["stock_quantity"] is None


def test_konga_keeps_real_values():
    raw = konga_raw(rating=3.9, review_count=17, stock_status={"quantity": 3})
    [item] = js.KongaScraper(session=requests.Session())._normalize_products([raw], "cuisine-table")
    assert (item["rating"], item["rating_count"], item["stock_quantity"]) == (3.9, 17, 3)  # 3, pas max(3, 10)


JUMIA_HTML = """
<article class="prd _fb col c-prd"><a class="core" href="/phone-1.html">
<h3 class="name">Phone One</h3><div class="prc">₦ 100,000</div><div class="old">₦ 120,000</div>
<img data-src="https://img.test/1.jpg"><div class="rev"><div class="stars _s"><div class="in" style="width:90%"></div></div> (12)</div>
</a></article>
<article class="prd _fb col c-prd"><a class="core" href="/phone-2.html">
<h3 class="name">Phone Two</h3><div class="prc">₦ 50,000</div></a></article>
"""


def test_jumia_parsing_rating_only_when_present():
    one, two = js.JumiaScraper(session=requests.Session()).scrape_html(JUMIA_HTML, "smartphones-tablettes")
    assert (one["rating"], one["rating_count"]) == (4.5, 12)
    assert one["old_price_ngn"] == 120000.0
    assert two["rating"] is None and two["rating_count"] == 0
    assert two["stock_quantity"] is None
    assert "certifié" not in two["description"].lower()


# ---------- enrichissement ----------
def raw(name, ngn, **kw):
    d = {"source": "Nigerian Marketplace (Konga)", "name": name, "price_ngn": ngn, "old_price_ngn": None,
         "category_slug": "x", "image_url": "https://img.test/a.jpg", "rating": None, "rating_count": 0,
         "stock_quantity": None, "sku": ""}
    d.update(kw)
    return d


def test_enrich_no_fake_stats_and_estimated_stock():
    mgr = js.CatalogManager(xof_rate=0.5, default_stock=7)
    out = mgr.enrich_products([raw("A", 10000), raw("B", 20000, stock_quantity=2, old_price_ngn=40000)])
    a, b = out
    assert a["price"] == 5000 and a["seller"] == "Konga Nigeria"
    assert a["seller_rating"] is None and a["sales"] is None and a["rating"] is None
    assert (a["stock_quantity"], a["stock_estimated"]) == (7, True)
    assert (b["stock_quantity"], b["stock_estimated"]) == (2, False)
    assert b["discount"] == 50 and b["xof_rate"] == 0.5 and b["scraped_at"]


def test_enrich_ids_unique_even_for_duplicates():
    out = js.CatalogManager().enrich_products([raw("Same", 1000, sku="1"), raw("Same", 1000, sku="1")])
    assert len({p["id"] for p in out}) == 2


def test_clean_existing_drops_uniform_defaults_only():
    mgr = js.CatalogManager()
    uniform = [raw(f"P{i}", 1000, rating=4.6, rating_count=8, stock_quantity=25,
                   description="P - Produit certifié authentique importé du Nigeria avec garantie TrustLink Escrow.")
               for i in range(6)]
    cleaned = mgr.clean_existing(uniform)
    assert all(p["rating"] is None and p["stock_quantity"] is None for p in cleaned)
    assert all("certifié" not in p["description"].lower() for p in cleaned)

    varied = [raw(f"P{i}", 1000, rating=3 + i / 10, rating_count=i + 1, stock_quantity=i + 1) for i in range(6)]
    kept = mgr.clean_existing(varied)
    assert [p["rating"] for p in kept] == [3.0, 3.1, 3.2, 3.3, 3.4, 3.5]
    assert [p["stock_quantity"] for p in kept] == [1, 2, 3, 4, 5, 6]


# ---------- taux de change ----------
def test_resolve_rate_explicit_and_invalid():
    assert js.resolve_xof_rate("0.45") == 0.45
    with pytest.raises(SystemExit):
        js.resolve_xof_rate("abc")
    with pytest.raises(SystemExit):
        js.resolve_xof_rate("-1")


def test_resolve_rate_auto_falls_back(monkeypatch):
    monkeypatch.setattr(js, "load_supabase_env", lambda: {"url": None, "key": None})
    assert js.resolve_xof_rate("auto") == js.DEFAULT_NGN_TO_XOF


def test_fetch_live_rate_parses_response():
    class Resp:
        def raise_for_status(self): pass
        def json(self): return [{"rate": "0.4123"}]

    class Sess:
        def get(self, url, **kw):
            assert "exchange_rates" in url and kw["params"]["from_currency"] == "eq.NGN"
            return Resp()

    assert js.fetch_live_rate("https://x.supabase.co", "k", session=Sess()) == pytest.approx(0.4123)
    assert js.fetch_live_rate(None, "k") is None


# ---------- CLI de bout en bout ----------
def test_main_from_json_writes_exports_and_syncs(tmp_path, monkeypatch):
    src = tmp_path / "in.json"
    items = [raw(f"Produit {i}", 10000 * (i + 1), sku=str(i), rating=4.6, rating_count=8, stock_quantity=25,
                 category_name="Cat", category_slug="smartphones-tablettes") for i in range(6)]
    src.write_text(json.dumps(items), encoding="utf-8")
    targets = [tmp_path / "buyer" / "d.json", tmp_path / "seller" / "d.json"]
    monkeypatch.setattr(js, "FRONTEND_DATA_FILES", targets)
    monkeypatch.setattr(js, "REPO_ROOT", tmp_path)
    out = tmp_path / "out"
    monkeypatch.setattr(sys, "argv", ["x", "--from-json", str(src), "--xof-rate", "0.4",
                                      "--output-dir", str(out), "--sync-frontends"])
    js.main()
    data = json.loads((out / "scraped_products.json").read_text(encoding="utf-8"))
    assert len(data) == 6 and data[0]["price"] == 4000 and data[0]["rating"] is None
    assert (out / "scraped_products_seller.csv").exists() and (out / "seed_catalog.sql").exists()
    assert all(json.loads(t.read_text(encoding="utf-8")) == data for t in targets)


def test_main_does_not_overwrite_when_nothing_collected(tmp_path, monkeypatch):
    out = tmp_path / "out"
    out.mkdir()
    (out / "scraped_products.json").write_text("[1]")
    src = tmp_path / "empty.json"
    src.write_text("[]")
    monkeypatch.setattr(sys, "argv", ["x", "--from-json", str(src), "--xof-rate", "0.4", "--output-dir", str(out)])
    with pytest.raises(SystemExit):
        js.main()
    assert (out / "scraped_products.json").read_text() == "[1]"


def test_main_rejects_unknown_category(monkeypatch):
    monkeypatch.setattr(sys, "argv", ["x", "--categories", "nope", "--xof-rate", "0.4"])
    with pytest.raises(SystemExit):
        js.main()
