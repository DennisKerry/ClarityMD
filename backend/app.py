"""
ClarityMD — Flask Backend API
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from recommender import recommend
from claude_client import generate_surgeon_summary, generate_patient_summary

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ClarityMD Backend"})


@app.route("/recommend", methods=["POST"])
def recommend_procedures():
    """
    POST /recommend

    Accepts patient profile JSON and returns:
      - ranked procedure recommendations (ML)
      - surgeon brief (Claude or fallback)
      - patient summary (Claude or fallback)

    Request body:
      {
        "age": 28,
        "sex": "Male",
        "joint": "Knee",
        "diagnosis": "ACL tear",
        "symptoms": "instability, giving way",
        "activity_level": "High",
        "prior_treatments": "Physical therapy x 3 months"
      }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # Validate required fields
    required_fields = ["age", "sex", "joint", "diagnosis", "activity_level"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
            400,
        )

    # Sanitize age
    try:
        age = int(data["age"])
        if age < 1 or age > 120:
            raise ValueError()
        data["age"] = age
    except (TypeError, ValueError):
        return jsonify({"error": "Age must be a valid number between 1 and 120."}), 400

    # Run ML recommender
    try:
        recommendations = recommend(data, top_n=3)
    except Exception as e:
        return jsonify({"error": f"Recommendation engine error: {str(e)}"}), 500

    if not recommendations:
        return jsonify({"error": "No matching procedures found."}), 404

    # Generate AI summaries
    try:
        surgeon_summary = generate_surgeon_summary(data, recommendations)
    except Exception as e:
        surgeon_summary = f"Summary generation failed: {str(e)}"

    try:
        patient_summary = generate_patient_summary(data, recommendations)
    except Exception as e:
        patient_summary = f"Summary generation failed: {str(e)}"

    return jsonify(
        {
            "recommendations": recommendations,
            "surgeon_summary": surgeon_summary,
            "patient_summary": patient_summary,
            "profile": data,
        }
    )


@app.route("/elevenlabs/tts", methods=["POST"])
def text_to_speech():
    """
    POST /elevenlabs/tts  (stretch goal)

    Proxies a TTS request to ElevenLabs and returns audio as base64.
    Requires ELEVENLABS_API_KEY in .env.
    """
    import base64
    import requests as http_requests

    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        return jsonify({"error": "ElevenLabs API key not configured."}), 503

    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    voice_id = data.get("voice_id", "21m00Tcm4TlvDq8ikWAM")  # Rachel (default)

    if not text:
        return jsonify({"error": "text field is required."}), 400

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    try:
        resp = http_requests.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        audio_b64 = base64.b64encode(resp.content).decode("utf-8")
        return jsonify({"audio_base64": audio_b64, "content_type": "audio/mpeg"})
    except http_requests.RequestException as e:
        return jsonify({"error": f"ElevenLabs request failed: {str(e)}"}), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "0") == "1")
