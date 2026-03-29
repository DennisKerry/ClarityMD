# ClarityMD Quick Reference

## Endpoints

- `GET /health`
- `POST /recommend`

## Required Request Fields

- `age`
- `sex`
- `joint`
- `diagnosis`
- `activity`
- `prior_treatments`

Optional:

- `pain_types` (auto-inferred if omitted)

## Response Fields

- `procedures[]`
- `surgeonSummary`
- `patientSummary`
- `total_matched`
- `db_size`

## Confidence Labels

- `Strong Match`: score >= 0.75
- `Good Match`: score >= 0.45
- `Possible Match`: score < 0.45

## Procedure Catalog

- 74 procedures across Ankle, Elbow, Hip, Knee, Multiple, Neck, Shoulder, Spine, Wrist
- Source of truth: `backend/data/procedures.json`

## Core Files

- Frontend app: `frontend/src/App.js`
- Body selector: `frontend/src/components/BodySelector.jsx`
- API client: `frontend/src/utils/api.js`
- Surgeon panel: `frontend/src/components/SurgeonPanel.jsx`
- Patient panel: `frontend/src/components/PatientPanel.jsx`
- Backend API: `backend/app.py`
- Ranking engine: `backend/ml_engine.py`

## Environment Variables

- Frontend: `REACT_APP_BACKEND_URL`
- Backend: `GROQ_API_KEY`
