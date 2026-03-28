import PROCEDURES_CATALOG from '../data/procedures.json';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

// Compact catalog summary for Claude context — id, procedure, joint, product, keywords
const CATALOG_SUMMARY = PROCEDURES_CATALOG.map((p) => ({
  id: p.id,
  procedure: p.procedure,
  joint: p.joint,
  product: p.product,
  product_url: p.product_url,
  product_category: p.product_category,
  keywords: p.keywords,
  technique: p.technique,
  age_range: p.age_range,
  activity_level: p.activity_level,
  recovery_weeks: p.recovery_weeks,
  contraindications: p.contraindications,
}));

export async function generateClarityMD(profile) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;

  if (!apiKey) {
    return {
      procedures: [],
      surgeonSummary: 'API key not configured',
      patientSummary: 'API key not configured',
      error: 'REACT_APP_ANTHROPIC_KEY environment variable not set',
    };
  }

  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': API_VERSION,
    'anthropic-dangerous-direct-browser-access': 'true',
    'content-type': 'application/json',
  };

  const makeRequest = async (msg, sysMsg) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        messages: [{ role: 'user', content: msg }],
        ...(sysMsg && { system: sysMsg }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  };

  try {
    const catalogJson = JSON.stringify(CATALOG_SUMMARY, null, 2);

    const systemPrompt = `You are a clinical decision support engine for Arthrex, the orthopedic medical device company.

CRITICAL RULES:
1. You MUST ONLY recommend procedures from the ARTHREX PROCEDURE CATALOG provided below. Do NOT invent, hallucinate, or add procedures not in this list.
2. Use the exact product names, product_urls, and technique notes from the catalog entries. Do not substitute other brand names.
3. Match procedures to the patient profile using joint, keywords, age_range, activity_level, and diagnosis context.
4. For joints outside the primary Arthrex surgical portfolio (e.g., isolated neck muscle strain, isolated spine), return the relevant conservative or injection entries from the catalog if they exist, and explain honestly that surgical Arthrex procedures may not be indicated.
5. Respond with ONLY a valid JSON array — no markdown, no explanation, no preamble.

ARTHREX PROCEDURE CATALOG (your only source of truth):
${catalogJson}`;

    const userPrompt = `Patient profile:
- Age: ${profile.age}
- Sex: ${profile.sex}
- Affected area: ${profile.joint}
- Diagnosis / Symptoms: ${profile.diagnosis}
- Activity level: ${profile.activity}
- Prior treatments: ${profile.prior_treatments}

From the catalog above, return a JSON array of the most relevant procedures for this patient, sorted by relevance_score descending.

Each object must have exactly these fields:
{
  "rank": 1,
  "procedure": "Exact procedure name from catalog",
  "product": "Exact product name from catalog entry",
  "product_url": "Exact product_url from catalog entry",
  "product_category": "Exact product_category from catalog entry",
  "relevance_score": 0.95,
  "match_reasons": ["brief reason matched to this patient", "another reason"],
  "technique_notes": "Exact technique field from catalog with any patient-specific notes appended",
  "recovery_weeks": 24,
  "contraindications": ["contraindication 1", "contraindication 2"],
  "arthrex_url": "Exact product_url from catalog entry",
  "confidence_label": "Strong Match"
}

Scoring rules:
- 0.85–1.00 = Strong Match (label: "Strong Match")
- 0.60–0.84 = Good Match (label: "Good Match")
- 0.35–0.59 = Possible Match (label: "Possible Match")
- Below 0.35 = exclude entirely

Rules:
- Include all procedures above 0.35, sorted by relevance_score descending.
- ONLY use procedures from the catalog. Do not add any procedure not in the list.
- Copy product, product_url, product_category, and technique_notes EXACTLY from the matching catalog entry.
- For neck/spine complaints without neurological signs, return the conservative and injection entries from the catalog (ids 45, 46) and set relevance_score appropriately. Do not return knee or elbow procedures for neck pain.
- If truly no catalog entry matches above 0.35, return an empty array []`;

    const recommendationText = await makeRequest(userPrompt, systemPrompt);

    let procedures = [];
    try {
      const clean = recommendationText.replace(/```json|```/g, '').trim();
      procedures = JSON.parse(clean);
      if (!Array.isArray(procedures)) procedures = [];
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      console.error('Raw response:', recommendationText);
      return {
        procedures: [],
        surgeonSummary: 'Error parsing procedures',
        patientSummary: 'Error parsing procedures',
        error: `Failed to parse response: ${parseErr.message}`,
      };
    }

    const topThree = procedures.slice(0, 3);
    const primaryProc = topThree[0] || {};

    const surgeonPrompt = `You are a clinical decision support assistant for orthopedic surgeons.

Patient: ${profile.age}yo ${profile.sex}
Area: ${profile.joint}
Diagnosis: ${profile.diagnosis}
Activity: ${profile.activity}
Prior treatments: ${profile.prior_treatments}

Top matched Arthrex procedures:
${JSON.stringify(topThree, null, 2)}

Write a clinical brief with these sections:
1. Primary Recommendation & Rationale
2. Arthrex Product & Technique Notes
3. Implant Sizing Considerations  
4. Risk Flags & Contraindications

Tone: clinical, precise, evidence-informed. Under 300 words.`;

    const patientPrompt = `Explain these medical recommendations to a patient with no medical background.

Top recommended procedure: ${primaryProc.procedure || 'N/A'}
Product: ${primaryProc.product || 'N/A'}
Recovery: approximately ${primaryProc.recovery_weeks || '12-16'} weeks

Write a warm, clear explanation:
1. What is this procedure? (simple terms)
2. Why is it right for you?
3. What happens during the procedure?
4. What does recovery look like?

Friendly tone. 6th grade reading level. Under 200 words.`;

    const [surgeonSummary, patientSummary] = await Promise.all([
      makeRequest(surgeonPrompt).catch((err) => {
        console.error('Surgeon summary error:', err);
        return 'Clinical summary unavailable';
      }),
      makeRequest(patientPrompt).catch((err) => {
        console.error('Patient summary error:', err);
        return 'Patient summary unavailable';
      }),
    ]);

    return {
      procedures,
      surgeonSummary,
      patientSummary,
    };
  } catch (err) {
    console.error('Error in generateClarityMD:', err);
    return {
      procedures: [],
      surgeonSummary: `Error: ${err.message}`,
      patientSummary: `Error: ${err.message}`,
      error: err.message,
    };
  }
}
