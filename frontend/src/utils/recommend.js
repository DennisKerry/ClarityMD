const JOINT_ALIASES = {
  knee: ['knee', 'patella', 'tibiofemoral', 'meniscus', 'acl', 'pcl', 'lcl', 'mcl'],
  shoulder: ['shoulder', 'glenohumeral', 'rotator cuff', 'labrum', 'acromion', 'bankart', 'slap'],
  hip: ['hip', 'acetabular', 'femoroacetabular', 'fai', 'groin'],
  wrist: ['wrist', 'carpal', 'distal radius', 'hand'],
  elbow: ['elbow', 'ulnar collateral', 'ucl', 'epicondyle'],
  ankle: ['ankle', 'talus', 'talar', 'foot drop', 'dorsiflexion'],
  multiple: ['multiple', 'multijoint', 'multi-joint', 'generalized'],
};

const ACTIVITY_ALIASES = {
  high: ['high', 'very active', 'athlete', 'sport', 'competitive', 'runner', 'manual labor'],
  medium: ['medium', 'moderate', 'active', 'recreational'],
  low: ['low', 'sedentary', 'limited', 'minimal activity'],
  variable: ['variable', 'mixed', 'depends'],
};

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

function resolveJointFromText(text) {
  const normalized = normalizeText(text);
  const matched = Object.entries(JOINT_ALIASES).find(([, aliases]) =>
    containsAny(normalized, aliases)
  );
  return matched ? matched[0] : '';
}

function resolveActivityFromText(text) {
  const normalized = normalizeText(text);
  const matched = Object.entries(ACTIVITY_ALIASES).find(([, aliases]) =>
    containsAny(normalized, aliases)
  );
  return matched ? matched[0] : '';
}

function recommendProcedures(profile, procedures) {
  const diagnosisText = normalizeText(profile.diagnosis);
  const treatmentText = normalizeText(profile.prior_treatments);
  const jointText = normalizeText(profile.joint);
  const activityText = normalizeText(profile.activity);
  const searchText = [jointText, diagnosisText, treatmentText, activityText]
    .filter(Boolean)
    .join(' ');

  const inferredJoint = resolveJointFromText(searchText);
  const inferredActivity = resolveActivityFromText(activityText || searchText);

  const scored = procedures.map((proc) => {
    let score = 0;
    const flags = [];
    const procJoint = normalizeText(proc.joint);
    const procActivity = normalizeText(proc.activity_level);

    // Joint match supports exact, contains, and inferred text intent.
    const directJointMatch =
      (jointText && (jointText.includes(procJoint) || procJoint.includes(jointText))) || false;
    const aliasJointMatch =
      inferredJoint && (inferredJoint === procJoint || procJoint === 'multiple');

    if (directJointMatch || aliasJointMatch) {
      score += 0.4;
    } else if (procJoint === 'multiple' && inferredJoint) {
      // Keep broad multi-joint options in consideration when a specific joint is inferred.
      score += 0.2;
    }

    // Keyword match in free text and procedure descriptors: +0.3
    let keywordMatches = 0;
    const allKeywords = [
      ...(proc.keywords || []),
      proc.procedure || '',
      proc.product || '',
      proc.product_category || '',
    ];

    allKeywords.forEach((kw) => {
      const keyword = normalizeText(kw);
      if (keyword && searchText.includes(keyword)) {
        keywordMatches += 1;
      }
    });
    if (keywordMatches > 0) {
      score += Math.min(0.3, keywordMatches * 0.12); // max 0.3
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

    // Activity level match supports free-text mapping (e.g., "very active athlete" => high).
    const directActivityMatch =
      activityText && (activityText.includes(procActivity) || procActivity.includes(activityText));
    const aliasActivityMatch = inferredActivity && inferredActivity === procActivity;

    if (directActivityMatch || aliasActivityMatch) {
      score += 0.1;
    }

    // Check contraindications
    (proc.contraindications || []).forEach((contra) => {
      if (searchText.includes(normalizeText(contra))) {
        flags.push(`⚠️ ${contra}`);
      }
    });

    // Apply confidence boost, cap at 1.0, and round to 2 decimals.
    score = Math.round(Math.min(1.0, score * proc.confidence_boost) * 100) / 100;

    return {
      ...proc,
      score,
      contraindication_flags: flags,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 3 results above 0.2 score threshold, always as an array.
  const topMatches = scored.filter((p) => p.score >= 0.2).slice(0, 3);
  return topMatches.length > 0 ? topMatches : [];
}

export { recommendProcedures, recommendProcedures as scoreAndRankProcedures };
