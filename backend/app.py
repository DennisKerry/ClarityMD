import os
import json
from pathlib import Path

from groq import Groq
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import or_

from ml_engine import score_procedures
from models import Procedure, db


load_dotenv(dotenv_path=Path(__file__).parent / ".env")

DATA_PATH = Path(__file__).parent / "data" / "procedures.json"

app = Flask(__name__)
CORS(app, origins=["https://clarity-md.vercel.app", "http://localhost:3000"])
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///claritymd.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


def _as_csv(value):
    if isinstance(value, list):
        return ",".join([str(v).strip() for v in value if str(v).strip()])
    if value is None:
        return ""
    return str(value)


def _infer_pain_types(diagnosis_text=""):
    text = str(diagnosis_text).lower()
    inferred = []

    if any(k in text for k in ["acute", "sudden", "trauma", "rupture", "tear"]):
        inferred.append("acute")
    if any(k in text for k in ["chronic", "months", "years", "persistent"]):
        inferred.append("chronic")
    if any(k in text for k in ["lock", "click", "catch", "mechanical"]):
        inferred.append("mechanical")
    if any(k in text for k in ["instability", "giving way", "sublux", "disloc"]):
        inferred.append("instability")
    if any(k in text for k in ["arthritis", "degenerative", "wear"]):
        inferred.append("degenerative")
    if any(k in text for k in ["weakness", "atrophy", "strength"]):
        inferred.append("weakness")
    if any(k in text for k in ["impingement", "pinch"]):
        inferred.append("impingement")
    if any(k in text for k in ["sport", "athlet", "overhead", "running"]):
        inferred.append("activity-related")

    return inferred if inferred else ["mechanical"]


def _build_full_text(record):
    parts = [
        record.get("procedure", ""),
        record.get("joint", ""),
        record.get("body_area", ""),
        record.get("keywords", ""),
        record.get("pain_types", ""),
        record.get("product", ""),
        record.get("product_category", ""),
        record.get("technique", ""),
        record.get("contraindications", ""),
    ]
    return " ".join([p for p in parts if p]).strip()


def _seed_database_if_empty():
    if Procedure.query.count() > 0:
        return
    if not DATA_PATH.exists():
        return

    with DATA_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    for idx, item in enumerate(data):
        age_range = item.get("age_range") or [14, 80]
        try:
            age_min = int(age_range[0])
            age_max = int(age_range[1])
        except (ValueError, TypeError, IndexError):
            age_min, age_max = 14, 80

        record = {
            "id": int(item.get("id", idx + 1)),
            "procedure": item.get("procedure", "Unknown Procedure"),
            "joint": item.get("joint", "Unknown"),
            "body_area": item.get("joint", "Unknown"),
            "keywords": _as_csv(item.get("keywords", [])),
            "pain_types": _as_csv(item.get("pain_types", [])),
            "product": item.get("product", "Arthrex Product"),
            "product_category": item.get("product_category", "Orthopedic"),
            "technique": item.get("technique", "Technique details unavailable."),
            "age_min": age_min,
            "age_max": age_max,
            "activity_level": item.get("activity_level", "Medium"),
            "recovery_weeks": int(item.get("recovery_weeks", 12)),
            "contraindications": _as_csv(item.get("contraindications", [])),
            "arthrex_url": item.get("product_url", "https://www.arthrex.com"),
        }
        record["full_text"] = _build_full_text(record)
        db.session.add(Procedure(**record))

    db.session.commit()


@app.route("/health", methods=["GET"])
def health():
    _seed_database_if_empty()
    count = Procedure.query.count()
    return jsonify({"status": "ok", "procedures_in_db": count})


@app.route("/recommend", methods=["POST"])
def recommend():
    _seed_database_if_empty()
    profile = request.json or {}

    # Validate required fields
    required = ["age", "sex", "joint", "diagnosis", "activity", "prior_treatments"]
    missing = [field for field in required if profile.get(field) in (None, "", [])]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    if profile.get("pain_types") in (None, "", []):
        profile["pain_types"] = _infer_pain_types(profile.get("diagnosis", ""))

    # Step 1: Get relevant procedures from DB, then widen if sparse.
    procedures = Procedure.query.filter(
        or_(
            Procedure.joint.ilike(f"%{profile['joint']}%"),
            Procedure.body_area.ilike(f"%{profile['joint']}%"),
        )
    ).all()

    if len(procedures) < 5:
        procedures = Procedure.query.all()

    # Step 2: ML scoring
    ranked = score_procedures(profile, procedures)

    if not ranked:
        return jsonify(
            {
                "procedures": [],
                "surgeonSummary": "No procedures matched this profile.",
                "patientSummary": "Please consult your surgeon directly.",
                "total_matched": 0,
                "db_size": Procedure.query.count(),
            }
        )

    # Step 3: Groq generates summaries from top results.
    top3 = ranked[:3]
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return jsonify(
            {
                "procedures": ranked,
                "surgeonSummary": "GROQ_API_KEY not configured on backend. ML ranking shown without AI summary.",
                "patientSummary": "AI patient summary is unavailable right now, but ranked procedure options are shown.",
                "total_matched": len(ranked),
                "db_size": Procedure.query.count(),
            }
        )

    client = Groq(api_key=api_key)

    surgeon_prompt = f"""You are a clinical decision support assistant for orthopedic surgeons.
A patient presents with the following profile:
- Age: {profile['age']}yo {profile['sex']}
- Affected area: {profile['joint']}
- Pain types: {', '.join(profile['pain_types'])}
- Diagnosis: {profile['diagnosis']}
- Activity level: {profile['activity']}
- Prior treatments: {profile['prior_treatments']}

ML-ranked top Arthrex procedures:
{top3}

Write a concise clinical brief:
1. Primary Recommendation & Rationale
2. Arthrex Product & Technique Notes
3. Implant Sizing Considerations
4. Contraindication Flags
Tone: clinical, precise. Under 300 words."""

    patient_prompt = f"""Explain this recommendation to a patient with no medical background.
Procedure: {top3[0]['procedure']}
Product: {top3[0]['product']}
Recovery: {top3[0]['recovery_weeks']} weeks

Write warmly covering:
1. What is this procedure?
2. Why is it right for you?
3. What happens during the procedure?
4. What does recovery look like?
Friendly tone, 6th grade reading level, under 200 words."""

    try:
        surgeon_msg = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1000,
            messages=[{"role": "user", "content": surgeon_prompt}],
        )

        patient_msg = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=800,
            messages=[{"role": "user", "content": patient_prompt}],
        )

        surgeon_summary = surgeon_msg.choices[0].message.content
        patient_summary = patient_msg.choices[0].message.content
    except Exception as exc:
        # Keep API useful even when Groq service is unavailable.
        surgeon_summary = (
            "AI summary unavailable due to a temporary Groq error. "
            "Using ML-ranked recommendations only."
        )
        patient_summary = "AI explanation is temporarily unavailable. Showing ranked procedure options instead."

    return jsonify(
        {
            "procedures": ranked,
            "surgeonSummary": surgeon_summary,
            "patientSummary": patient_summary,
            "total_matched": len(ranked),
            "db_size": Procedure.query.count(),
        }
    )


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        _seed_database_if_empty()
    app.run(debug=True, port=5000)
