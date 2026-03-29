# ClarityMD Setup

## Prerequisites

- Node.js 18+
- Python 3.10+
- Groq API key

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
GROQ_API_KEY=your_key_here
```

Run backend:

```bash
python app.py
```

Health check:

```bash
curl http://localhost:5000/health
```

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

`.env.example` uses:

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Demo Flow

1. Open http://localhost:3000
2. Select a joint on the body diagram or choose from the joint dropdown
3. Click `Load Demo` to autofill a sample profile, or complete all required fields manually
4. Click `Analyze Patient`
5. Review ranked procedures, confidence labels, contraindications, and AI summaries in the Surgeon and Patient panels

## Troubleshooting

- Empty results:
  - Verify backend is running
  - Verify request fields are complete
- AI summaries unavailable:
  - Confirm `GROQ_API_KEY` in `backend/.env`
  - Ranked procedures still return without AI summary
- CORS or network errors:
  - Confirm frontend URL is `http://localhost:3000`
  - Confirm backend URL is `http://localhost:5000`
