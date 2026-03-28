# ClarityMD - Architecture Overview

## System Flow

```
User Input (PatientForm)
    ↓
Form Validation & Submission
    ↓
Score & Rank (recommend.js)
    ├─ Joint matching (+0.4)
    ├─ Keyword extraction (+0.3)
    ├─ Age range check (+0.2)
    ├─ Activity level (+0.1)
    ├─ Confidence boost multiplier
    └─ Filter top 3, threshold ≥ 0.2
    ↓
Generate AI Summaries (claude.js)
    ├─ Surgeon Prompt (clinical tone)
    └─ Patient Prompt (plain language)
         ↓
         Claude API Calls (parallel Promise.all)
         ├─ surgeon_summary
         └─ patient_summary
    ↓
Display Results (SurgeonPanel + PatientPanel)
    ├─ Confidence bars
    ├─ Contraindication badges
    ├─ Copy/Print buttons
    └─ Start Over button
```

## Component Tree

```
App.js (State Container)
├── PatientForm
│   ├── Input fields (age, sex, joint, diagnosis, activity, prior_treatments)
│   ├── Demo button
│   └── Submit button
├── SurgeonPanel (Results only)
│   ├── Clinical summary box
│   ├── Procedure cards (3-column grid)
│   │   ├── Procedure name
│   │   ├── Confidence bar
│   │   ├── Contraindication badges
│   │   └── Product/recovery info
│   └── Copy Brief button
├── PatientPanel (Results only)
│   ├── Summary box
│   ├── Copy & Print buttons
│   └── Recovery timeline
└── LoadingSpinner (When loading=true)
    ├── Semi-transparent overlay
    ├── Spinning loader
    └── Status text
```

## Data Flow

### State Variables (App.js)
```javascript
profile {
  age, sex, joint, diagnosis, activity, prior_treatments
}

results [
  {
    id, procedure, joint, keywords[], product, product_category,
    technique, age_range[], activity_level, recovery_weeks,
    contraindications[], confidence_boost,
    score,                          // Calculated
    contraindication_flags[]        // Calculated
  }
]

surgeonSummary: string | null
patientSummary: string | null
loading: boolean
error: string | null
```

### Scoring Algorithm (recommend.js)

```
scoreAndRankProcedures(profile, procedures)
  for each procedure:
    score = 0
    
    // Joint match
    if profile.joint matches procedure.joint:
      score += 0.4
    
    // Keywords
    searchText = profile.diagnosis + profile.prior_treatments
    keywordMatches = count(procedure.keywords in searchText)
    if keywordMatches > 0:
      score += min(0.3, keywordMatches * 0.15)
    
    // Age range
    if profile.age in procedure.age_range:
      score += 0.2
    
    // Activity level
    if profile.activity matches procedure.activity_level:
      score += 0.1
    
    // Apply boost
    score = score * procedure.confidence_boost
    
    // Cap at 1.0
    score = min(1.0, score)
    
    // Check contraindications
    flags = procedure.contraindications that appear in searchText
    
    return { ...procedure, score, contraindication_flags: flags }
  
  // Sort by score descending
  sort(results)
  
  // Return top 3 with score >= 0.2
  return results.filter(score >= 0.2).slice(0, 3)
```

### Claude API (claude.js)

```
generateSummaries(profile, topProcedures)
  
  surgeonPrompt = 
    "Clinical brief for procedures:\n
     - Procedure rationale
     - Technique notes
     - Contraindication flags
     - Expected outcomes
     200-300 words"
  
  patientPrompt =
    "Patient-friendly explanation:\n
     - What/why/how
     - Recovery process
     <200 words"
  
  Promise.all([
    POST /v1/messages {
      model: claude-sonnet-4-20250514,
      max_tokens: 1000,
      messages: [{ role: user, content: surgeonPrompt }]
    },
    POST /v1/messages {
      model: claude-sonnet-4-20250514,
      max_tokens: 1000,
      messages: [{ role: user, content: patientPrompt }]
    }
  ])
  
  return {
    surgeonSummary: response1.content[0].text,
    patientSummary: response2.content[0].text
  }
```

## File Organization

### Frontend Structure
```
frontend/
├── public/
│   └── index.html          # Contains <div id="root">
│
├── src/
│   ├── components/
│   │   ├── PatientForm.jsx      (200 lines, ~50% styling)
│   │   ├── SurgeonPanel.jsx     (170 lines, grid cards)
│   │   ├── PatientPanel.jsx     (210 lines, summary + print)
│   │   └── LoadingSpinner.jsx   (50 lines, overlay + animation)
│   │
│   ├── utils/
│   │   ├── recommend.js         (65 lines, scoring algorithm)
│   │   └── claude.js            (70 lines, API calls)
│   │
│   ├── data/
│   │   └── procedures.json      (25 procedures, ~800 lines)
│   │
│   ├── App.js                   (200 lines, state + orchestration)
│   ├── index.js                 (10 lines, React root)
│   ├── index.css                (60 lines, branding colors)
│   │
│   └── .env                     (1 line, REACT_APP_ANTHROPIC_KEY)
│
├── .env.example                 (Template)
├── .gitignore                   (Node dependencies)
├── package.json                 (React + react-scripts)
└── .gitignore
```

### Backend Structure
```
backend/
├── app.py                       (Original Flask server)
├── data/
│   └── procedures.json          (25 procedures, new schema)
├── requirements.txt             (Flask, flask-cors)
└── .gitignore
```

## Styling Strategy

### Inline Styles
- All component styling is inline (no CSS files needed except `index.css`)
- Variables object per component for organization
- Hover effects via onMouseEnter/Leave

### Responsive Design
- Grid layouts (grid-template-columns)
- Flex for alignment
- Mobile-first approach with breakpoints in comments

### Arthrex Branding
```css
Primary Blue:      #003087  (Headers, main buttons, bars)
Accent Blue:       #0066CC  (Secondary buttons)
Background:        #F4F6F9  (Page BG)
Card Background:   white    (Panel cards)
Border:            #E0E6ED  (1px solid on cards, inputs)
Text Dark:         #2C3E50  (Body text)
Text Muted:        #5A6B7A  (Secondary text)

Border Radius:     10px (cards)
Box Shadow:        0 2px 4px rgba(0,0,0,0.05)
```

## State Transitions

```
INITIAL
  ↓ Load demo or enter patient data
READY TO SUBMIT
  ↓ Click "Get Recommendations"
LOADING (show spinner)
  ├─ Score locally
  ├─ Call Claude API (parallel)
  ↓ Receive results
RESULTS DISPLAYED
  ├─ Show SurgeonPanel + PatientPanel
  ├─ Confidence bars visible
  ├─ Copy/Print buttons active
  ↓ Click "Start Over"
RESET TO INITIAL
```

## Error States

```
INPUT VALIDATION
  → "Please fill in at least Joint and Diagnosis fields"

NO MATCHES
  → "No matching procedures found. Try different inputs."

CLAUDE API ERROR
  → Falls back to placeholder summaries
  → Shows generic brief + summary

MISSING ENV VAR
  → Error thrown during form submission
  → Message: "REACT_APP_ANTHROPIC_KEY environment variable not set"
```

## Performance Considerations

- Procedures data embedded in frontend (25 items, ~50KB gzipped)
- All scoring happens locally (no server round-trip)
- Claude API calls parallelized (Promise.all)
- Typical latency: 1-3 seconds local scoring + 10-20 seconds Claude API
- No database, no backend dependency for main functionality

## Security Notes

- REACT_APP_ prefix makes env var available in browser (intended for public API key)
- Claude API uses proper headers for browser cross-origin requests
- No user data persisted without user action (no tracking/analytics)
- Frontend-only processing (no backend involvement)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required (arrow functions, destructuring, async/await)
- React 18.2.0 requirements
- CSS Grid & Flexbox support

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Bundler | Webpack (via react-scripts) | 5.0.1 |
| AI/Summaries | Claude API | sonnet-4-20250514 |
| Backend | Flask | 2.3.2 |
| Backend CORS | flask-cors | 3.0.10 |
| Language | JavaScript (Frontend) | ES6+ |
| Language | Python (Backend) | 3.8+ |
| Styling | Inline CSS + index.css | CSS3 |
