import os

import anthropic
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import or_

from ml_engine import score_procedures
from models import Procedure, db


load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://clarity-md.vercel.app", "http://localhost:3000"])
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///claritymd.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


@app.route("/health", methods=["GET"])
def health():
    count = Procedure.query.count()
    return jsonify({"status": "ok", "procedures_in_db": count})


@app.route("/recommend", methods=["POST"])
def recommend():
    profile = request.json or {}

    # Validate required fields
    required = ["age", "sex", "joint", "diagnosis", "activity", "pain_types", "prior_treatments"]
    missing = [field for field in required if profile.get(field) in (None, "", [])]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

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

    # Step 3: Claude generates summaries from top results.
    top3 = ranked[:3]
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        return jsonify(
            {
                "procedures": ranked,
                "surgeonSummary": "ANTHROPIC_API_KEY not configured on backend. ML ranking shown without AI summary.",
                "patientSummary": "AI patient summary is unavailable right now, but ranked procedure options are shown.",
                "total_matched": len(ranked),
                "db_size": Procedure.query.count(),
            }
        )

    client = anthropic.Anthropic(api_key=api_key)

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
        surgeon_msg = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": surgeon_prompt}],
        )

        patient_msg = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            messages=[{"role": "user", "content": patient_prompt}],
        )

        surgeon_summary = surgeon_msg.content[0].text
        patient_summary = patient_msg.content[0].text
    except Exception as exc:
        # Keep API useful even when Claude billing/service is unavailable.
        surgeon_summary = (
            "AI summary unavailable due to Anthropic error. "
            f"Using ML-ranked recommendations only. ({str(exc)})"
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
    app.run(debug=True, port=5000)
