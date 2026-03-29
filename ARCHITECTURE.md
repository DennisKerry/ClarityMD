# ClarityMD Architecture

## Flow

1. Surgeon selects an affected joint on the interactive SVG body diagram (`BodySelector`)
2. Frontend collects the full patient profile in `PatientForm`
3. Frontend sends profile to backend `POST /recommend`
4. Backend ensures procedure catalog is seeded into SQLite
5. Backend ML engine ranks procedures via TF-IDF cosine similarity (`ml_engine.py`)
6. Backend calls Groq for two summaries:
   - Surgeon clinical brief
   - Patient plain-language summary
7. Frontend renders:
   - `SurgeonPanel` for ranked procedures, confidence scores, and risk flags
   - `PatientPanel` for education summary, recovery timeline, and AI disclaimer

## Single Source of Truth

- Procedure catalog: `backend/data/procedures.json`
- Recommendation logic: `backend/ml_engine.py`

## Data Contracts

### Request

```json
{
  "age": "34",
  "sex": "Male",
  "joint": "Knee",
  "diagnosis": "ACL tear with instability",
  "activity": "High",
  "prior_treatments": "PT and NSAIDs",
  "pain_types": ["acute", "instability"]
}
```

### Response

```json
{
  "procedures": [
    {
      "rank": 1,
      "procedure": "ACL Reconstruction",
      "product": "TightRope",
      "relevance_score": 0.88,
      "confidence_label": "Strong Match",
      "contraindication_flags": ["active infection"]
    }
  ],
  "surgeonSummary": "...",
  "patientSummary": "..."
}
```

## Notes

- `frontend/src/utils/api.js` is the backend API client (formerly `claude.js`).
- If Groq is unavailable, the backend still returns ranked procedures without AI summaries.
