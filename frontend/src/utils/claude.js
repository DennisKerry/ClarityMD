const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

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
    const systemPrompt = `You are a clinical decision support engine for Arthrex, the orthopedic medical device company. You have deep knowledge of Arthrex's full product and procedure catalog. When given a patient profile, return ALL relevant Arthrex procedures ranked by relevance score from highest to lowest.

You MUST respond with ONLY a valid JSON array. No explanation, no markdown, no preamble. Just the raw JSON array.`;

    const userPrompt = `Patient profile:
- Age: ${profile.age}
- Sex: ${profile.sex}
- Affected area: ${profile.joint}
- Diagnosis / Symptoms: ${profile.diagnosis}
- Activity level: ${profile.activity}
- Prior treatments: ${profile.prior_treatments}

Return a JSON array of ALL Arthrex procedures relevant to this patient, sorted by relevance_score descending (highest first).

Each object in the array must have exactly these fields:
{
  "rank": 1,
  "procedure": "Full procedure name",
  "product": "Arthrex product name with trademark symbol if applicable",
  "product_category": "Category e.g. Ligament Fixation",
  "relevance_score": 0.95,
  "match_reasons": ["reason 1", "reason 2"],
  "technique_notes": "Brief clinical technique description",
  "recovery_weeks": 24,
  "contraindications": ["contraindication 1", "contraindication 2"],
  "arthrex_url": "https://www.arthrex.com/[relevant-path]",
  "confidence_label": "Strong Match"
}

Scoring rules:
- 0.85–1.00 = Strong Match (label: "Strong Match")
- 0.60–0.84 = Good Match (label: "Good Match")  
- 0.35–0.59 = Possible Match (label: "Possible Match")
- Below 0.35 = exclude entirely

Include ALL procedures above 0.35, even if there are 10–15 of them.
Sort strictly by relevance_score descending.
Use real Arthrex product names and real arthrex.com URL paths.
arthrex_url must start with https://www.arthrex.com/`;

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
