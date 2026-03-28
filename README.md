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
- Anthropic API key (https://console.anthropic.com)

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
   
3. **Add your Anthropic API key to `.env`**
   ```
   REACT_APP_ANTHROPIC_KEY=sk-ant-...
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
Two Claude API calls in parallel:
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

### Claude API
- **Endpoint**: https://api.anthropic.com/v1/messages
- **Model**: claude-sonnet-4-20250514
- **Headers**: x-api-key, anthropic-version (2023-06-01), anthropic-dangerous-direct-browser-access

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

**REACT_APP_ANTHROPIC_KEY not set**: Create `.env` file in frontend/ with your API key

**Blank page**: Check browser console, ensure port 3000 available

**Claude summaries as placeholders**: Verify API key is valid

**Procedures not loading**: Check `src/data/procedures.json` exists and is valid JSON

## License

Copyright © 2024 ClarityMD. All rights reserved.
