# ClarityMD - Quick Reference Card

## 🚀 Getting Started in 60 Seconds

```bash
# 1. Get API key
# Visit: https://console.groq.com (free)

# 2. Setup
cd backend
pip install -r requirements.txt
# Edit backend/.env and add: GROQ_API_KEY=gsk_YOUR_KEY_HERE

# 3. Run backend
python app.py

# 4. Run frontend
cd ../frontend
npm install
npm start
# Opens http://localhost:3000
```

## 📊 What You're Building With

| Component | Size | Purpose |
|-----------|------|---------|
| **PatientForm** | 210 lines | Patient data intake + demo button |
| **SurgeonPanel** | 170 lines | Clinical recommendations with confidence bars |
| **PatientPanel** | 210 lines | Plain language summary + print |
| **LoadingSpinner** | 50 lines | Beautiful loading indicator |
| **recommend.js** | 65 lines | Scoring algorithm (0.4+0.3+0.2+0.1) |
| **claude.js** | 75 lines | AI-powered summaries (parallel calls) |
| **App.js** | 200 lines | State management & orchestration |
| **procedures.json** | 800 lines | 25 complete Arthrex procedures |
| **Total** | **1,780 lines** | **Full working app** |

## 🎨 Colors You're Using

```
Primary:    #003087  ← Arthrex blue (headers, bars)
Accent:     #0066CC  ← Secondary buttons
Background: #F4F6F9  ← Light page BG
Card:       white    ← Panel backgrounds
Border:     #E0E6ED  ← Subtle borders
Text:       #2C3E50  ← Dark text
Muted:      #5A6B7A  ← Secondary text
```

## 📈 Scoring Formula

```
Score = (0.4×joint + 0.3×keywords + 0.2×age + 0.1×activity) × confidence_boost
Capped at 1.0, filtered for top 3 above 0.2 threshold
```

## 🤖 Claude Integration

```
Two parallel API calls:
1. Surgeon prompt  → Clinical explanation
2. Patient prompt  → Plain language explanation
```

## 📋 Demo Patient Data

```
Age: 34 | Sex: Male | Joint: Knee
Diagnosis: ACL tear with instability
Activity: High | Prior: PT, MRI confirmed ACL rupture
Expected: ACL Reconstruction (95%+ confidence)
```

## 🔧 Project Layout

```
frontend/
├── src/
│   ├── components/
│   │   ├── PatientForm.jsx       ✓
│   │   ├── SurgeonPanel.jsx      ✓
│   │   ├── PatientPanel.jsx      ✓
│   │   └── LoadingSpinner.jsx    ✓
│   ├── utils/
│   │   ├── recommend.js          ✓
│   │   └── claude.js             ✓
│   ├── data/
│   │   └── procedures.json       ✓ (25 procedures)
│   ├── App.js                    ✓
│   ├── index.js                  ✓
│   ├── index.css                 ✓
│   └── .env                      ← Add API key here
├── .env.example
├── .gitignore
├── package.json
└── public/

Documentation:
├── README.md                      ← Full guide
├── SETUP.md                       ← Quick start
├── ARCHITECTURE.md                ← Technical
└── COMPLETION_SUMMARY.md          ← This project
```

## ✨ Key Features

| Feature | Location |
|---------|----------|
| 25 procedures | `frontend/src/data/procedures.json` |
| Scoring algorithm | `frontend/src/utils/recommend.js` |
| Claude integration | `frontend/src/utils/claude.js` |
| Demo patient button | `PatientForm.jsx` |
| Confidence bars | `SurgeonPanel.jsx` |
| Contraindication badges | `SurgeonPanel.jsx` |
| Copy brief | `SurgeonPanel.jsx` |
| Copy summary | `PatientPanel.jsx` |
| Print button | `PatientPanel.jsx` |
| Recovery timeline | `PatientPanel.jsx` |
| Loading spinner | `LoadingSpinner.jsx` |
| State management | `App.js` |
| Branding colors | `index.css` + all components |

## 🔑 Environment Setup

Create `frontend/.env`:
```
REACT_APP_ANTHROPIC_KEY=sk-ant-YOUR_KEY_HERE
```

That's it! React will automatically inject this into your app.

## 🧪 Test Flow

1. **npm start** → Opens http://localhost:3000
2. **Click "Load Demo Patient"** → Form auto-fills
3. **Click "Get Recommendations"** → Shows loading spinner
4. **Wait 15-20 seconds** → Claude API responds
5. **See results:**
   - 3 procedure cards with confidence bars
   - Clinical surgeon brief
   - Patient-friendly summary
   - Recovery timeline
6. **Click "Copy Brief"** → Surgeon text to clipboard
7. **Click "Print Summary"** → Opens print dialog
8. **Click "Start Over"** → Resets everything

## 💾 Data Structure

### Patient Profile
```javascript
{
  age: "34",
  sex: "Male",
  joint: "Knee",
  diagnosis: "ACL tear...",
  activity: "High",
  prior_treatments: "PT..."
}
```

### Procedure (25 in dataset)
```javascript
{
  id: 1,
  procedure: "ACL Reconstruction",
  joint: "Knee",
  keywords: ["ligament tear", "acl tear", ...],
  product: "TightRope RT",
  product_category: "Soft Tissue Fixation",
  technique: "Cortical fixation...",
  age_range: ["15", "45"],
  activity_level: "High",
  recovery_weeks: 16,
  contraindications: ["active infection", ...],
  confidence_boost: 0.95
}
```

### Scored Result
```javascript
{
  ...procedure,
  score: 0.85,              // Calculated
  contraindication_flags: [] // Detected
}
```

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm start

# Build for production
npm run build

# Check for issues
npm run lint (if configured)
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires ES6+ and CSS Grid/Flexbox

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page | Check console (F12), ensure Node 14+ |
| Scoring no match | Try "ACL" + "Knee" + "High" activity |
| Claude text missing | Verify API key + account has credits |
| Procedures empty | Check `src/data/procedures.json` exists |
| Build fails | Run `npm install` again, delete node_modules |

## 📚 Documentation

- **README.md** - Full project overview
- **SETUP.md** - 5-minute quick start
- **ARCHITECTURE.md** - Technical deep-dive
- **COMPLETION_SUMMARY.md** - Everything that was built

## 🎯 Next Steps After Running

1. ✅ Load demo patient
2. ✅ See recommendations appear
3. ✅ Copy surgeon brief
4. ✅ Print patient summary
5. ✅ Test with your own patient data
6. ✅ Deploy to production (npm run build)

---

**Congratulations! ClarityMD is ready to use! 🎉**

Start with: `npm start` then click **"Load Demo Patient"**
