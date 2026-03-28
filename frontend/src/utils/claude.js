const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

export async function generateSummaries(profile, topProcedures) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
  
  if (!apiKey) {
    throw new Error('REACT_APP_ANTHROPIC_KEY environment variable not set');
  }

  const proceduresText = topProcedures
    .map((proc) => `- ${proc.procedure} (${proc.joint}): ${proc.technique}`)
    .join('\n');

  const profileText = `
  Age: ${profile.age}
  Joint: ${profile.joint}
  Diagnosis: ${profile.diagnosis}
  Activity Level: ${profile.activity}
  Prior Treatments: ${profile.prior_treatments}
  `;

  const surgeonPrompt = `You are an experienced orthopedic surgeon. Review the following patient profile and recommended procedures. Provide a clinical brief that includes:
1. Procedure rationale (why this procedure is suitable)
2. Technique notes and critical considerations
3. Any contraindication flags to watch for
4. Expected outcomes and timeline

Patient Profile:
${profileText}

Recommended Procedures:
${proceduresText}

Keep response concise but clinically thorough (200-300 words). Use medical terminology.`;

  const patientPrompt = `You are a patient educator. Convert the following clinical information into plain, easy-to-understand language covering:
1. What the procedure is and why it's recommended
2. How it will improve their condition
3. What the recovery process looks like
4. Key milestones to expect

Patient Profile:
${profileText}

Recommended Procedures:
${proceduresText}

Keep response under 200 words. Use simple language, no medical jargon.`;

  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': API_VERSION,
    'anthropic-dangerous-direct-browser-access': 'true',
    'content-type': 'application/json',
  };

  const makeRequest = async (prompt) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
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
    const [surgeonSummary, patientSummary] = await Promise.all([
      makeRequest(surgeonPrompt),
      makeRequest(patientPrompt),
    ]);

    return {
      surgeonSummary,
      patientSummary,
    };
  } catch (error) {
    console.error('Error generating summaries:', error);
    throw error;
  }
}
