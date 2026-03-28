# ClarityMD 🔬

> Helping surgeons make better decisions — and helping patients understand them.

ClarityMD is an AI-powered dual-view clinical support tool built for surgeons.
Input a patient profile and diagnosis, and ClarityMD's ML recommendation engine
maps it to the most relevant surgical procedures and Arthrex products — then generates
two tailored outputs: a clinical brief for the surgeon, and a plain-language
explanation the surgeon can use to educate their patient.

Built at EagleHacks 2025 @ FGCU for the Arthrex company challenge.

---

## The Problem

Surgeons manage thousands of available procedures and products. Choosing the
right one takes time. Explaining it to a patient takes even more. ClarityMD
compresses both into seconds.

---

## How It Works

```
Patient Profile + Diagnosis
        ↓
ML Recommendation Engine (scikit-learn TF-IDF)
        ↓
┌────────────────┬─────────────────────┐
│  Surgeon View  │    Patient View     │
│                │                     │
│ • Best matched │ • Plain-language    │
│   procedures   │   explanation       │
│ • Product info │ • What to expect    │
│ • Technique    │ • Recovery outlook  │
│   notes        │                     │
│ • Risk flags   │ • 🔊 Read Aloud     │
└────────────────┴─────────────────────┘
```

---

## Features

- **Smart Procedure Matching** — ML classifier (TF-IDF + cosine similarity) maps
  patient profiles to relevant surgical procedures and Arthrex product categories
- **Dual-View Dashboard** — separate outputs optimized for surgeon and patient
- **AI-Generated Summaries** — Claude API generates clinical and plain-language
  explanations from the same ML recommendation
- **Risk Flagging** — contraindications and risk factors surfaced automatically
- **Implant Sizing Guidance** — product-specific sizing notes per recommendation
- **Voice Readout** *(stretch)* — ElevenLabs TTS reads the patient summary aloud

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python / Flask |
| ML | scikit-learn (TF-IDF + cosine similarity) |
| AI Summaries | Anthropic Claude API |
| Voice (stretch) | ElevenLabs API |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Anthropic API key (optional — fallback summaries are provided)
- ElevenLabs API key *(optional — for voice readout stretch goal)*

### Installation

```bash
# Clone the repo
git clone https://github.com/DennisKerry/claritymd.git
cd ClarityMD

# Backend setup
cd backend
pip install -r requirements.txt

# Add your API keys
cp .env.example .env
# Edit .env and fill in ANTHROPIC_API_KEY and ELEVENLABS_API_KEY

# Frontend setup
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 — Start backend (from /backend)
cd backend
python app.py

# Terminal 2 — Start frontend (from /frontend)
cd frontend
npm run dev
```

App runs at `http://localhost:5173` (frontend), `http://localhost:5000` (backend API)

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/recommend` | Get procedure recommendations + AI summaries |
| POST | `/elevenlabs/tts` | Text-to-speech for patient summary (stretch) |

### POST `/recommend` — Request Body

```json
{
  "age": 28,
  "sex": "Male",
  "joint": "Knee",
  "diagnosis": "ACL tear",
  "symptoms": "instability, giving way",
  "activity_level": "High",
  "prior_treatments": "Physical therapy x 3 months"
}
```

---

## Project Structure

```
ClarityMD/
├── backend/
│   ├── app.py              # Flask API
│   ├── recommender.py      # ML recommendation engine (TF-IDF)
│   ├── claude_client.py    # Claude API integration
│   ├── data/
│   │   └── procedures.csv  # Curated Arthrex procedure dataset (25 entries)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProfileForm.jsx   # Patient profile input form (FR1)
│   │   │   ├── SurgeonView.jsx   # Clinical surgeon brief (FR3)
│   │   │   └── PatientView.jsx   # Patient education summary (FR4)
│   │   ├── App.jsx               # Main app + dashboard layout
│   │   └── index.css             # Medical-grade styling
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Team

Built by Team ClarityMD at EagleHacks 2025 — FGCU

---

## License

MIT
