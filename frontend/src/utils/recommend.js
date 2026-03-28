import { supabase } from './supabase';

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

export async function recommendProcedures(profile) {
  const normalizedProfile = {
    ...profile,
    pain_types:
      Array.isArray(profile?.pain_types) && profile.pain_types.length
        ? profile.pain_types
        : inferPainTypes(profile?.diagnosis || ''),
  };

  let { data: procedures, error } = await supabase
    .from('procedures')
    .select('*')
    .ilike('joint', `%${normalizedProfile.joint}%`);

  if (error) throw new Error(`Supabase error: ${error.message}`);

  if (!procedures || procedures.length < 5) {
    const { data: allProcedures, error: allError } = await supabase
      .from('procedures')
      .select('*');
    if (allError) throw new Error(`Supabase error: ${allError.message}`);
    procedures = allProcedures || [];
  }

  const scored = procedures
    .map((proc) => {
      let score = 0;

      if (proc.joint?.toLowerCase() === normalizedProfile.joint?.toLowerCase()) {
        score += 0.35;
      }

      const fullText = `${normalizedProfile.diagnosis || ''} ${normalizedProfile.prior_treatments || ''}`
        .toLowerCase();

      const keywords = String(proc.keywords || '')
        .split(',')
        .map((kw) => kw.trim())
        .filter(Boolean);
      const keywordHits = keywords.filter((kw) => fullText.includes(kw.toLowerCase())).length;
      score += Math.min(keywordHits * 0.08, 0.25);

      const procPain = String(proc.pain_types || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const profilePain = normalizedProfile.pain_types || [];
      const painOverlap = procPain.filter((p) => profilePain.includes(p)).length;
      score += Math.min(painOverlap * 0.08, 0.2);

      const age = parseInt(normalizedProfile.age, 10);
      if (!Number.isNaN(age) && age >= (proc.age_min || 0) && age <= (proc.age_max || 99)) {
        score += 0.1;
      }

      if (proc.activity_level?.toLowerCase() === normalizedProfile.activity?.toLowerCase()) {
        score += 0.1;
      }

      const confidenceBoost = Number(proc.confidence_boost) || 1.0;
      const finalScore = Math.min(score * confidenceBoost, 1.0);

      const contraindications = String(proc.contraindications || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      return {
        ...proc,
        relevance_score: Math.round(finalScore * 1000) / 1000,
        confidence_label:
          finalScore >= 0.75 ? 'Strong Match' : finalScore >= 0.45 ? 'Good Match' : 'Possible Match',
        pain_types_matched: procPain.filter((p) => profilePain.includes(p)),
        contraindications,
      };
    })
    .filter((p) => p.relevance_score > 0.1)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return scored;
}

export { recommendProcedures as scoreAndRankProcedures };
