import re
import requests
from bs4 import BeautifulSoup
from flask import Flask

from models import db, Procedure
from seed_data import get_seed_procedures


TARGET_URLS = [
    ("Shoulder", "https://www.arthrex.com/shoulder/procedures"),
    ("Knee", "https://www.arthrex.com/knee/procedures"),
    ("Hip", "https://www.arthrex.com/hip/procedures"),
    ("Ankle", "https://www.arthrex.com/foot-ankle/procedures"),
    ("Elbow", "https://www.arthrex.com/elbow/procedures"),
    ("Hand/Wrist", "https://www.arthrex.com/hand-wrist/procedures"),
    ("Spine", "https://www.arthrex.com/spine/procedures"),
    ("Trauma", "https://www.arthrex.com/trauma/procedures"),
]


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///claritymd.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    return app


def _extract_procedure_titles(soup):
    selectors = [".procedure-title", "h2", "h3"]
    seen = set()
    titles = []
    for selector in selectors:
        for el in soup.select(selector):
            text = " ".join(el.get_text(" ", strip=True).split())
            if len(text) < 6:
                continue
            if any(k in text.lower() for k in ["cookie", "privacy", "learn more", "contact"]):
                continue
            if text.lower() in seen:
                continue
            seen.add(text.lower())
            titles.append(text)
    return titles


def _extract_products_and_description(text):
    product_hits = re.findall(r"\b[A-Z][A-Za-z0-9\-]+(?:™|®)\b", text)
    product = ", ".join(sorted(set(product_hits))) if product_hits else "Arthrex product"
    description = " ".join(text.split())[:500]
    return product, description


def _build_record(joint, url, title, page_text):
    product, description = _extract_products_and_description(page_text)
    keywords = ",".join(sorted(set(re.findall(r"[A-Za-z]{5,}", (title + " " + description).lower())))[0:12])
    full_text = f"{title} {product} {description} {joint}"

    return {
        "procedure": title,
        "joint": joint,
        "body_area": joint,
        "keywords": keywords,
        "pain_types": "mechanical,chronic,activity-related",
        "product": product,
        "product_category": "Arthroscopy/Repair",
        "technique": description,
        "age_min": 14,
        "age_max": 80,
        "activity_level": "Medium",
        "recovery_weeks": 12,
        "contraindications": "active infection",
        "arthrex_url": url,
        "full_text": full_text,
    }


def _insert_records(records):
    Procedure.query.delete()
    for rec in records:
        db.session.add(Procedure(**rec))
    db.session.commit()


def scrape_and_seed():
    all_records = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }

    for joint, url in TARGET_URLS:
        try:
            response = requests.get(url, timeout=20, headers=headers)
            if response.status_code >= 400:
                raise RuntimeError(f"Blocked status {response.status_code} at {url}")

            soup = BeautifulSoup(response.text, "html.parser")
            page_text = soup.get_text(" ", strip=True)
            titles = _extract_procedure_titles(soup)

            for title in titles[:15]:
                all_records.append(_build_record(joint, url, title, page_text))

        except Exception as exc:
            print(f"Scrape blocked/failed for {url}: {exc}")

    # If scraping produced too little data, fallback to curated seed.
    if len(all_records) < 25:
        print("Using fallback curated seed_data.py")
        all_records = get_seed_procedures()

    _insert_records(all_records)


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
        scrape_and_seed()
        print(f"Seeded {Procedure.query.count()} procedures")
