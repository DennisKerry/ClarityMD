"""
scrape_arthrex.py — Arthrex product/procedure data collector (SKELETON)

⚠️  DO NOT RUN until you have:
    1. Reviewed Arthrex's Terms of Service (https://www.arthrex.com/company/terms-of-use)
    2. Checked https://www.arthrex.com/robots.txt for disallowed paths
    3. Obtained permission if required for commercial/distribution use

This script is intentionally non-executable (missing __main__ guard).
Remove the comment block and add `if __name__ == "__main__": main()` when cleared.

Dependencies (install once approved):
    pip install requests beautifulsoup4 playwright
    playwright install chromium  # only needed for JS-rendered pages
"""

import json
import time
import datetime
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# CONFIG — adjust before running
# ---------------------------------------------------------------------------
OUTPUT_PATH = Path(__file__).parent.parent / "backend" / "data" / "procedures.json"
SOURCES_PATH = Path(__file__).parent.parent / "backend" / "data" / "sources.csv"

# Target Arthrex product category pages (public, non-authenticated)
# These are example paths — confirm they exist and are permitted
SEED_URLS = [
    "https://www.arthrex.com/knee",
    "https://www.arthrex.com/shoulder",
    "https://www.arthrex.com/hip",
    "https://www.arthrex.com/elbow",
    "https://www.arthrex.com/wrist",
    "https://www.arthrex.com/ankle-foot",
    "https://www.arthrex.com/spine",
]

# Polite crawl rate — do NOT reduce below 2 seconds
REQUEST_DELAY_SECONDS = 3

HEADERS = {
    "User-Agent": (
        "ClarityMD-ResearchBot/1.0 "
        "(educational demo; contact: your@email.com)"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ---------------------------------------------------------------------------
# Step 1: Fetch a page (respects rate limit)
# ---------------------------------------------------------------------------
def fetch_page(url: str) -> BeautifulSoup | None:
    """GET a URL and return a parsed BeautifulSoup tree, or None on failure."""
    try:
        time.sleep(REQUEST_DELAY_SECONDS)
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException as exc:
        print(f"[WARN] Failed to fetch {url}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Step 2: Check robots.txt before crawling
# ---------------------------------------------------------------------------
def is_path_allowed(base_url: str, path: str) -> bool:
    """
    Minimal robots.txt check.
    For production use, replace with the `urllib.robotparser` standard library module.
    """
    import urllib.robotparser
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{base_url}/robots.txt")
    rp.read()
    return rp.can_fetch(HEADERS["User-Agent"], path)


# ---------------------------------------------------------------------------
# Step 3: Parse a product page into the procedures.json schema
# ---------------------------------------------------------------------------
def parse_product_page(soup: BeautifulSoup, source_url: str) -> dict | None:
    """
    Attempt to extract procedure/product fields from a parsed Arthrex product page.

    NOTE: CSS selectors below are GUESSES. Inspect the live DOM of the actual
    pages before relying on them. Arthrex may use JS rendering — if `soup` is
    empty, switch to Playwright (see `fetch_page_playwright()` below).
    """

    # --- Procedure / product name ---
    name_tag = (
        soup.find("h1")                          # most product pages lead with h1
        or soup.find(class_=re.compile(r"product[\s-_]?title", re.I))
    )
    if not name_tag:
        print(f"[SKIP] No product name found at {source_url}")
        return None

    procedure_name = name_tag.get_text(strip=True)

    # --- Joint/category (often in breadcrumb or meta tag) ---
    breadcrumb = soup.find(class_=re.compile(r"breadcrumb", re.I))
    joint = ""
    if breadcrumb:
        crumbs = [a.get_text(strip=True) for a in breadcrumb.find_all("a")]
        # Breadcrumb often looks like: Home > Knee > Soft Tissue > TightRope RT
        joint_candidates = {"Knee", "Shoulder", "Hip", "Elbow", "Wrist", "Ankle", "Spine"}
        for crumb in crumbs:
            if crumb in joint_candidates:
                joint = crumb
                break

    # --- Product category (e.g., "Suture Anchors") ---
    category_tag = soup.find(class_=re.compile(r"category|product-type", re.I))
    product_category = category_tag.get_text(strip=True) if category_tag else ""

    # --- Technique / description ---
    desc_tag = (
        soup.find(class_=re.compile(r"product[\s-_]?desc|overview|summary", re.I))
        or soup.find("meta", attrs={"name": "description"})
    )
    technique = ""
    if desc_tag:
        technique = (
            desc_tag.get("content", "").strip()    # for <meta>
            if desc_tag.name == "meta"
            else desc_tag.get_text(strip=True)[:300]  # cap at 300 chars
        )

    # --- Keywords: pull from meta keywords if present ---
    meta_kw = soup.find("meta", attrs={"name": "keywords"})
    keywords = (
        [k.strip() for k in meta_kw["content"].split(",") if k.strip()]
        if meta_kw
        else []
    )

    # Build entry matching the schema in backend/data/SCHEMA.md
    entry = {
        "id": None,           # assigned at merge time
        "procedure": procedure_name,
        "joint": joint,
        "keywords": keywords,
        "product": procedure_name,   # product = page name on Arthrex
        "product_category": product_category,
        "technique": technique,
        "age_range": ["15", "85"],   # unknown — fill manually after scrape
        "activity_level": "Variable",
        "recovery_weeks": 0,         # unknown — fill manually
        "contraindications": [],
        "confidence_boost": 0.80,    # default; tune after QA
        "_source_url": source_url,
        "_scraped_at": datetime.datetime.utcnow().isoformat() + "Z",
    }

    return entry


# ---------------------------------------------------------------------------
# Step 4 (alternative): Playwright for JS-rendered pages
# ---------------------------------------------------------------------------
def fetch_page_playwright(url: str) -> BeautifulSoup | None:
    """
    Use Playwright for pages that require JavaScript execution.
    Only import if needed — requires `pip install playwright` and `playwright install chromium`.
    """
    try:
        from playwright.sync_api import sync_playwright  # noqa: PLC0415

        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page(extra_http_headers={"User-Agent": HEADERS["User-Agent"]})
            time.sleep(REQUEST_DELAY_SECONDS)
            page.goto(url, timeout=20000)
            page.wait_for_load_state("networkidle")
            content = page.content()
            browser.close()
            return BeautifulSoup(content, "html.parser")
    except Exception as exc:  # noqa: BLE001
        print(f"[WARN] Playwright fetch failed for {url}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Step 5: Merge scraped entries into existing procedures.json
# ---------------------------------------------------------------------------
def merge_into_dataset(new_entries: list[dict]) -> None:
    """
    Load existing procedures.json, append new unique entries (deduped by procedure name),
    reassign sequential IDs, and write back.
    """
    existing: list[dict] = []
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH, encoding="utf-8") as f:
            existing = json.load(f)

    existing_names = {e["procedure"].lower() for e in existing}
    added = 0

    for entry in new_entries:
        # Remove internal metadata keys before storing
        clean = {k: v for k, v in entry.items() if not k.startswith("_")}

        if clean["procedure"].lower() not in existing_names:
            existing.append(clean)
            existing_names.add(clean["procedure"].lower())
            added += 1

    # Reassign IDs sequentially
    for idx, entry in enumerate(existing, start=1):
        entry["id"] = idx

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

    print(f"[INFO] Merged {added} new entries. Total: {len(existing)} procedures.")


# ---------------------------------------------------------------------------
# Step 6: Write sources.csv for attribution
# ---------------------------------------------------------------------------
def write_sources(entries: list[dict]) -> None:
    """Append source URLs to sources.csv for attribution/auditing."""
    write_header = not SOURCES_PATH.exists()
    with open(SOURCES_PATH, "a", encoding="utf-8") as f:
        if write_header:
            f.write("procedure,source_url,scraped_at\n")
        for entry in entries:
            name = entry.get("procedure", "").replace(",", ";")
            url = entry.get("_source_url", "")
            ts = entry.get("_scraped_at", "")
            f.write(f"{name},{url},{ts}\n")


# ---------------------------------------------------------------------------
# Main pipeline (DISABLED — remove comment block when legally cleared)
# ---------------------------------------------------------------------------
# def main():
#     scraped = []
#
#     for url in SEED_URLS:
#         from urllib.parse import urlparse
#         parsed = urlparse(url)
#         base = f"{parsed.scheme}://{parsed.netloc}"
#
#         if not is_path_allowed(base, parsed.path):
#             print(f"[SKIP] robots.txt disallows: {url}")
#             continue
#
#         soup = fetch_page(url)
#         if soup is None:
#             # Fallback to Playwright for JS-rendered pages
#             soup = fetch_page_playwright(url)
#         if soup is None:
#             continue
#
#         # Collect product links on the category page
#         product_links = []
#         for a in soup.find_all("a", href=True):
#             href = a["href"]
#             if "/products/" in href or "/procedures/" in href:
#                 full = href if href.startswith("http") else base + href
#                 if full not in product_links:
#                     product_links.append(full)
#
#         print(f"[INFO] Found {len(product_links)} product links at {url}")
#
#         for product_url in product_links[:10]:  # cap per category to avoid hammering
#             if not is_path_allowed(base, urlparse(product_url).path):
#                 continue
#             psoup = fetch_page(product_url)
#             if psoup is None:
#                 psoup = fetch_page_playwright(product_url)
#             if psoup is None:
#                 continue
#             entry = parse_product_page(psoup, product_url)
#             if entry:
#                 scraped.append(entry)
#                 print(f"  [+] {entry['procedure']} ({entry['joint']})")
#
#     if scraped:
#         write_sources(scraped)
#         merge_into_dataset(scraped)
#     else:
#         print("[WARN] No entries scraped. Check selectors and robots.txt.")
