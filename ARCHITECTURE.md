# ClarityMD Architecture

## Flow

1. Frontend collects patient profile in `PatientForm`
2. Frontend sends profile to backend `POST /recommend`
3. Backend ensures procedure catalog is seeded into SQLite
4. Backend ML engine ranks procedures (`ml_engine.py`)
5. Backend calls Groq for two summaries:
   - Surgeon clinical brief
   - Patient plain-language summary
6. Frontend renders:
   - `SurgeonPanel` for ranked procedures and risk flags
   - `PatientPanel` for education summary and recovery timeline

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

- `frontend/src/utils/claude.js` is a legacy filename; it is a backend API client.
- If Groq is unavailable, backend still returns ranked procedures.
