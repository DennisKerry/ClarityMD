# ClarityMD

ClarityMD is an intelligent system that recommends appropriate Arthrex orthopedic procedures based on patient profiles. It combines algorithmic scoring with AI-generated clinical and patient-friendly summaries using Claude.

**AI-powered surgical decision support that helps Arthrex surgeons identify the right procedure and communicate it clearly to their patients.**

## Project Structure

```
ClarityMD/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # UI components (PatientForm, Panels, Spinner)
│   │   ├── utils/          # Utilities (recommend.js, claude.js)
│   │   ├── data/           # Procedures dataset (25 Arthrex procedures)
│   │   ├── App.js          # Main app with state management
│   │   ├── index.js        # React root
│   │   └── index.css       # Global styling & branding
│   ├── public/
│   ├── package.json
│   ├── .env.example        # Environment variables template
│   └── .gitignore
└── backend/                # Python/Flask API
    ├── app.py              # Flask server
    ├── data/
    │   └── procedures.json # 25 procedures with new schema
    ├── requirements.txt
    └── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 14+ (for frontend)
- Python 3.8+ (for backend)
- Groq API key (https://console.groq.com) — free tier available

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
3. **Set backend URL in `.env`** (optional — defaults to localhost:5000)
   ```
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

### Backend Setup (Optional)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start Flask server**
   ```bash
   python app.py
   ```
   
   Server runs on `http://localhost:5000`

## Features

### 1. Patient Intake Form
- Age, sex, joint/area, diagnosis, activity level, prior treatments
- "Load Demo Patient" button with sample data
- Real-time validation

### 2. Intelligent Procedure Scoring
Algorithm (`src/utils/recommend.js`):
- **+0.4** for joint match
- **+0.3** for keyword matches in diagnosis
- **+0.2** for age in procedure range
- **+0.1** for activity level match
- **Multiplied** by procedure confidence boost
- **Capped** at 1.0
- Returns **top 3** procedures above 0.2 threshold

### 3. AI-Generated Summaries
Two Groq (Llama 3.3 70B) API calls:
- **Surgeon Brief**: Clinical tone, rationale, technique, contraindications
- **Patient Summary**: Plain language, what/why/how/recovery (under 200 words)

### 4. Dashboard Panels

**Surgeon View:**
- Top 3 procedure recommendations
- Confidence bars
- Contraindication badges
- Clinical brief with copy button

**Patient View:**
- Plain-language summary
- Recovery timeline
- Copy for patient & print buttons

### 5. Loading State
- Centered animated spinner
- Non-blocking overlay

## Branding

**ClarityMD Color Palette:**
- Primary Blue: #003087 (Arthrex)
- Accent Blue: #0066CC
- Background: #F4F6F9
- Cards: white with 1px solid #E0E6ED border
- Border radius: 10px

## Dataset: 25 Arthrex Procedures

Each includes: ID, procedure name, joint, keywords, product, category, technique, age range, activity level, recovery weeks, contraindications, and confidence boost.

**Joints covered:** Knee, Shoulder, Hip, Wrist, Elbow, Ankle, Hand

## API Configuration

### Groq API
- **Endpoint**: https://api.groq.com/openai/v1/chat/completions
- **Model**: llama-3.3-70b-versatile (free tier)
- **Key**: Set `GROQ_API_KEY` in `backend/.env`
- Get a free key at https://console.groq.com

## Demo Patient
Load with "Load Demo Patient" button:
```
Age: 34, Sex: Male, Joint: Knee
Diagnosis: ACL tear with instability following sports injury
Activity: High, Prior: Physical therapy 3 months
```

## Error Handling

- Missing API key → uses placeholder summaries
- Invalid input → validation alerts
- No results → helpful message
- API failures → error display

## Troubleshooting

**GROQ_API_KEY not set**: Create/edit `backend/.env` and add your Groq key

**Blank page**: Check browser console, ensure port 3000 available

**AI summaries show as placeholders**: Verify `GROQ_API_KEY` is valid in `backend/.env`

**Procedures not loading**: Check `src/data/procedures.json` exists and is valid JSON

## License

Copyright © 2024 ClarityMD. All rights reserved.
