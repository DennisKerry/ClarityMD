from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "procedures.json")

app = Flask(__name__)
CORS(app)

def load_procedures():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def score_procedure(profile, proc):
    # Simple heuristic scoring: keyword matches + joint match + activity level
    score = 0
    text = (profile.get('diagnosis','') + ' ' + profile.get('prior_treatments','')).lower()
    # keyword matches
    for kw in proc.get('diagnosis_keywords', []):
        if kw.lower() in text:
            score += 2
    # joint match
    if profile.get('joint','').lower() == proc.get('joint','').lower():
        score += 3
    # activity level approximate match
    if profile.get('activity_level','').lower() == proc.get('activity_level','').lower():
        score += 1
    # age range check
    age = profile.get('age')
    try:
        if age is not None:
            parts = proc.get('age_range','').split('-')
            if len(parts) == 2:
                low = int(parts[0])
                high = int(parts[1])
                if low <= int(age) <= high:
                    score += 1
    except Exception:
        pass
    return score

@app.route('/recommend', methods=['POST'])
def recommend():
    profile = request.json or {}
    procedures = load_procedures()
    scored = []
    for p in procedures:
        s = score_procedure(profile, p)
        scored.append((s, p))
    scored.sort(key=lambda x: x[0], reverse=True)
    # normalize confidences
    max_score = max([s for s,_ in scored]) if scored else 1
    results = []
    for s,p in scored[:5]:
        conf = round((s / max_score) * 100, 1) if max_score > 0 else 0.0
        results.append({
            'procedure': p['procedure'],
            'joint': p['joint'],
            'arthrex_product': p['arthrex_product'],
            'technique_notes': p['technique_notes'],
            'contraindications': p.get('contraindications', []),
            'confidence': conf
        })
    # take top 1-3 for surgeon view
    surgeon_view = results[:3]
    # simple patient view: plain-language summary generated locally for MVP
    patient_view = []
    for r in surgeon_view:
        text = (
            f"The recommended procedure is {r['procedure']} on the {r['joint']}. "
            f"This uses {r['arthrex_product']}. Expected recovery varies; generally follows surgeon guidance."
        )
        patient_view.append({'procedure': r['procedure'], 'summary': text, 'confidence': r['confidence']})

    return jsonify({
        'surgeon_recommendations': surgeon_view,
        'patient_summaries': patient_view
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
