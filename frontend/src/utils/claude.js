function inferPainTypes(diagnosisText = '') {
  const text = String(diagnosisText).toLowerCase();
  const inferred = [];

  if (/acute|sudden|trauma|rupture|tear/.test(text)) inferred.push('acute');
  if (/chronic|months|years|persistent/.test(text)) inferred.push('chronic');
  if (/lock|click|catch|mechanical/.test(text)) inferred.push('mechanical');
  if (/instability|giving way|sublux|disloc/.test(text)) inferred.push('instability');
  if (/arthritis|degenerative|wear/.test(text)) inferred.push('degenerative');
  if (/weakness|atrophy|strength/.test(text)) inferred.push('weakness');
  if (/impingement|pinch/.test(text)) inferred.push('impingement');
  if (/sport|athlet|overhead|running/.test(text)) inferred.push('activity-related');

  return inferred.length ? inferred : ['mechanical'];
}

function buildFallbackSummaries(profile, rankedProcedures, reason = '') {
  const top3 = rankedProcedures.slice(0, 3);
  const top = top3[0] || {};

  const surgeonLines = [
    'Clinical summary fallback (AI summary unavailable).',
    reason ? `Reason: ${reason}` : '',
    '',
    `Primary recommendation: ${top.procedure || 'No procedure available'}`,
    `Product: ${top.product || 'N/A'}`,
    `Joint/Area: ${profile?.joint || 'N/A'}`,
    `Recovery estimate: ${top.recovery_weeks || 'N/A'} weeks`,
    '',
    'Top ranked procedures:',
    ...top3.map(
      (p) => `- #${p.rank || '?'} ${p.procedure} (${p.relevance_score ?? 'n/a'} score)`
    ),
    '',
    `Contraindications: ${Array.isArray(top.contraindications) && top.contraindications.length
      ? top.contraindications.join(', ')
      : 'None documented'}`,
  ].filter(Boolean);

  const patientLines = [
    'Your care team found a strong procedure match based on your profile.',
    top.procedure ? `Recommended procedure: ${top.procedure}.` : '',
    top.product ? `Likely system/product: ${top.product}.` : '',
    top.recovery_weeks ? `Expected recovery is about ${top.recovery_weeks} weeks.` : '',
    'A full AI-written explanation is temporarily unavailable, but your ranked options are ready for review.',
  ].filter(Boolean);

  return {
    surgeonSummary: surgeonLines.join('\n'),
    patientSummary: patientLines.join(' '),
  };
}

export async function generateSummaries(profile, rankedProcedures) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
  if (!apiKey) {
    return buildFallbackSummaries(profile, rankedProcedures, 'Anthropic API key not configured');
  }

  const normalizedProfile = {
    ...profile,
    pain_types:
      Array.isArray(profile?.pain_types) && profile.pain_types.length
        ? profile.pain_types
        : inferPainTypes(profile?.diagnosis || ''),
  };

  const top3 = rankedProcedures.slice(0, 3);

  const surgeonPrompt = `You are a clinical decision support assistant for orthopedic surgeons.

Patient: ${normalizedProfile.age}yo ${normalizedProfile.sex}
Area: ${normalizedProfile.joint}
Pain types: ${normalizedProfile.pain_types?.join(', ')}
Diagnosis: ${normalizedProfile.diagnosis}
Activity: ${normalizedProfile.activity}
Prior treatments: ${normalizedProfile.prior_treatments}

ML-ranked Arthrex procedures (top 3 of ${rankedProcedures.length} matched):
${JSON.stringify(
    top3.map((p) => ({
      rank: p.rank,
      procedure: p.procedure,
      product: p.product,
      score: p.relevance_score,
      technique: p.technique,
      contraindications: p.contraindications,
    })),
    null,
    2
  )}

Write a clinical brief:
1. Primary Recommendation & Rationale
2. Arthrex Product & Technique Notes
3. Implant Sizing Considerations
4. Contraindication Flags
Clinical tone. Under 300 words.`;

  const patientPrompt = `Explain this to a patient with no medical background.
Procedure: ${top3[0]?.procedure}
Product: ${top3[0]?.product}
Recovery: ${top3[0]?.recovery_weeks} weeks

Cover:
1. What is this procedure?
2. Why is it right for you?
3. What happens during it?
4. What does recovery look like?
Friendly, 6th grade reading level, under 200 words.`;

  async function callClaude(prompt) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data?.content?.[0]?.text || '';
  }

  try {
    const [surgeonSummary, patientSummary] = await Promise.all([
      callClaude(surgeonPrompt),
      callClaude(patientPrompt),
    ]);

    return { surgeonSummary, patientSummary };
  } catch (error) {
    const message = String(error?.message || 'AI summary unavailable');
    const lowCredit = /credit balance is too low|billing|insufficient/i.test(message);
    const reason = lowCredit ? 'Anthropic credit balance is too low' : message;
    return buildFallbackSummaries(profile, rankedProcedures, reason);
  }
}
