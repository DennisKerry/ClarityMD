# ClarityMD - Quick Start Guide

## 🚀 5-Minute Frontend Setup

### Step 1: Get Your API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Create an API key
4. Copy the key (starts with `sk-ant-`)

### Step 2: Install & Configure
```bash
cd frontend
npm install
cp .env.example .env
```

### Step 3: Add API Key
Edit `frontend/.env`:
```
REACT_APP_ANTHROPIC_KEY=sk-ant-YOUR_API_KEY_HERE
```

### Step 4: Run
```bash
npm start
```

App opens at http://localhost:3000

## 🧪 Test with Demo Patient

1. Click **"Load Demo Patient"** button
2. Click **"Get Recommendations"**
3. Wait for analysis (~30 seconds)
4. See:
   - ✅ Top 3 procedures with confidence bars
   - ✅ Clinical surgeon brief
   - ✅ Patient-friendly summary
   - ✅ Recovery timeline

## 📁 What Was Built

### Frontend Components
- `PatientForm.jsx` - Intake form with demo button
- `SurgeonPanel.jsx` - Clinical recommendations with bars/badges
- `PatientPanel.jsx` - Plain language summary with print
- `LoadingSpinner.jsx` - Centered loading indicator
- `App.js` - State management & orchestration

### Utilities
- `recommend.js` - Scoring algorithm (0.4 joint + 0.3 keywords + 0.2 age + 0.1 activity)
- `claude.js` - Dual Claude API calls (parallel Promise.all)

### Data
- `procedures.json` - 25 complete Arthrex orthopedic procedures

### Styling
- `index.css` - Arthrex branding colors (#003087, #0066CC, #F4F6F9)
- Inline component styles with responsive grid layouts

## 🎯 Key Features

✅ **Patient Intake** - 6 fields + demo data
✅ **Smart Scoring** - Joint/keyword/age/activity matching
✅ **AI Summaries** - Two Claude endpoints in parallel
✅ **Surgeon Dashboard** - Confidence bars, contraindication flags
✅ **Patient Summary** - <200 words, plain language, recovery timeline
✅ **Print & Copy** - Full export capabilities
✅ **Branding** - Arthrex colors throughout

## 🔧 Scoring Algorithm

For each procedure:
1. Joint match → +0.4
2. Keyword matches in diagnosis → +0.3
3. Age in range → +0.2
4. Activity match → +0.1
5. Multiply by confidence_boost (0.65-0.95)
6. Cap at 1.0
7. Filter for score ≥ 0.2, take top 3

## ⚙️ Claude API

**Calls 2 prompts in parallel:**

1️⃣ **Surgeon Prompt** (clinical tone)
   - Procedure rationale
   - Technique notes
   - Contraindication flags
   - ~200-300 words

2️⃣ **Patient Prompt** (plain language)
   - What & why
   - How it helps
   - Recovery process
   - <200 words

## 📊 25 Procedures Included

**Knee (7):** ACL Reconstruction, Meniscus Repair, Microfracture, Lateral Collateral Ligament Reconstruction, PCL Reconstruction, Patellofemoral Arthroplasty, Posterolateral Capsular Release

**Shoulder (6):** Rotator Cuff Repair, Total Shoulder Arthroplasty, Bankart Repair, SLAP Repair, Reverse Shoulder Arthroplasty, Biceps Tenodesis, Subacromial Decompression

**Ankle (4):** Anterior Tibialis Transfer, Anterior Ankle Impingement Arthroscopy, Syndesmosis Repair, Hallux Limitus Arthroscopy

**Hip (2):** Labral Repair (Hip)

**Wrist (2):** Distal Radius ORIF, Carpal Tunnel Release

**Elbow (2):** UCL Reconstruction, [Other procedures cover elbow]

**Other (2):** PRP Injection (Multiple), Loose Body Removal, Arthroscopic Chondral Fragment Fixation

## 🎨 Branding

| Color | Hex | Use |
|-------|-----|-----|
| Primary | #003087 | Headers, hero buttons |
| Accent | #0066CC | Secondary buttons |
| Background | #F4F6F9 | Page BG |
| Card | white | Panel cards |
| Border | #E0E6ED | Cards, inputs |

## ❓ Troubleshooting

**Q: "REACT_APP_ANTHROPIC_KEY environment variable not set"**
A: Create `.env` file and add your API key

**Q: Blank homepage**
A: Check browser console (F12) for errors; ensure Node 14+

**Q: Claude summaries not appearing**
A: Verify API key is correct and account has credits

**Q: Procedures library empty**
A: Check `src/data/procedures.json` exists

## 🚢 Production Build

```bash
npm run build
```

Creates optimized `frontend/build/` directory ready for deployment.

## 📞 Support

Check the main [README.md](README.md) for full documentation.

---

**Ready? Run `npm start` and click "Load Demo Patient"! 🎉**
