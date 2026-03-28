const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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

export async function generateClarityMD(profile) {
  const payload = {
    ...profile,
    pain_types: Array.isArray(profile?.pain_types) && profile.pain_types.length
      ? profile.pain_types
      : inferPainTypes(profile?.diagnosis || ''),
  };

  const response = await fetch(`${BACKEND_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Backend error');
  }

  return await response.json();
}
