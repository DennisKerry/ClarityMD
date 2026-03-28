const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

export async function generateSummaries(profile, topProcedures) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
  const primaryProcedure = topProcedures[0] || {};

  const profileText = `
  Age: ${profile.age}
  Sex: ${profile.sex}
  Joint: ${profile.joint}
  Diagnosis: ${profile.diagnosis}
  Activity Level: ${profile.activity}
  Prior Treatments: ${profile.prior_treatments}
  `;

  const surgeonPrompt = `You are an experienced orthopedic surgeon. Review the following patient profile and top recommendation. Provide a clinical brief that includes:
1. Procedure rationale (why this procedure is suitable)
2. Technique notes and critical considerations
3. Any contraindication flags to watch for
4. Expected outcomes and timeline

Patient Profile:
${profileText}

Top Recommendation:
- Procedure: ${primaryProcedure.procedure || 'N/A'}
- Product: ${primaryProcedure.product || 'N/A'}

Keep response concise but clinically thorough (200-300 words). Use medical terminology.`;

  const patientPrompt = `You are a patient educator. Convert the following clinical information into plain, easy-to-understand language covering:
1. What the procedure is and why it's recommended
2. How it will improve their condition
3. What the recovery process looks like
4. Key milestones to expect

Recommendation:
- Procedure: ${primaryProcedure.procedure || 'N/A'}
- Product: ${primaryProcedure.product || 'N/A'}
- Recovery (weeks): ${primaryProcedure.recovery_weeks ?? 'N/A'}

Write this at a 6th grade reading level and keep response under 200 words. Use very simple language and short sentences.`;

  const defaultSurgeonFallback =
    `${primaryProcedure.procedure || 'Top procedure'} with ${primaryProcedure.product || 'recommended product'} appears suitable based on joint, diagnosis, activity, and prior treatment history. Review contraindications and discuss timing with the patient.`;

  const defaultPatientFallback =
    `Your top option is ${primaryProcedure.procedure || 'a procedure'} using ${primaryProcedure.product || 'the recommended product'}. Recovery is about ${primaryProcedure.recovery_weeks ?? 'several'} weeks. Your surgeon will explain each step and what to expect.`;

  if (!apiKey) {
    return {
      surgeonSummary: defaultSurgeonFallback,
      patientSummary: defaultPatientFallback,
      hadError: true,
    };
  }

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

  const surgeonTask = (async () => {
    try {
      return await makeRequest(surgeonPrompt);
    } catch (error) {
      console.error('Error generating surgeon summary:', error);
      return defaultSurgeonFallback;
    }
  })();

  const patientTask = (async () => {
    try {
      return await makeRequest(patientPrompt);
    } catch (error) {
      console.error('Error generating patient summary:', error);
      return defaultPatientFallback;
    }
  })();

  const [surgeonSummary, patientSummary] = await Promise.all([surgeonTask, patientTask]);

  return {
    surgeonSummary,
    patientSummary,
    hadError: surgeonSummary === defaultSurgeonFallback || patientSummary === defaultPatientFallback,
  };
}
