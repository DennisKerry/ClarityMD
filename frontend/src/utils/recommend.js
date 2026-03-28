export function scoreAndRankProcedures(profile, procedures) {
  const scored = procedures.map((proc) => {
    let score = 0;
    const flags = [];

    // Joint match: +0.4
    if (profile.joint && profile.joint.toLowerCase() === proc.joint.toLowerCase()) {
      score += 0.4;
    }

    // Keyword match in diagnosis: +0.3
    const diagnosisText = (profile.diagnosis || '').toLowerCase();
    const treatmentText = (profile.prior_treatments || '').toLowerCase();
    const searchText = `${diagnosisText} ${treatmentText}`.toLowerCase();
    
    let keywordMatches = 0;
    proc.keywords.forEach((kw) => {
      if (searchText.includes(kw.toLowerCase())) {
        keywordMatches += 1;
      }
    });
    if (keywordMatches > 0) {
      score += Math.min(0.3, keywordMatches * 0.15); // max 0.3
    }

    // Age in range: +0.2
    if (profile.age) {
      const age = parseInt(profile.age, 10);
      const ageMin = parseInt(proc.age_range[0], 10);
      const ageMax = parseInt(proc.age_range[1], 10);
      if (age >= ageMin && age <= ageMax) {
        score += 0.2;
      }
    }

    // Activity level match: +0.1
    if (
      profile.activity &&
      profile.activity.toLowerCase() === proc.activity_level.toLowerCase()
    ) {
      score += 0.1;
    }

    // Check contraindications
    proc.contraindications.forEach((contra) => {
      if (searchText.includes(contra.toLowerCase())) {
        flags.push(`⚠️ ${contra}`);
      }
    });

    // Apply confidence boost and cap at 1.0
    score = Math.min(1.0, score * proc.confidence_boost);

    return {
      ...proc,
      score,
      contraindication_flags: flags,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 3 results above 0.2 score threshold
  return scored.filter((p) => p.score >= 0.2).slice(0, 3);
}
