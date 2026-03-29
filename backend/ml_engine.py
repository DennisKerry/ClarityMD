from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


CONFIDENCE_THRESHOLDS = {
    "strong": 0.75,
    "good": 0.45,
}


def build_query(profile):
    """Convert patient profile into a rich query string."""
    pain_map = {
        "acute": "sudden injury traumatic onset",
        "chronic": "persistent ongoing long-term pain",
        "mechanical": "movement locking clicking catching",
        "instability": "unstable giving way subluxation",
        "degenerative": "arthritis wear tear osteoarthritis",
        "weakness": "strength loss atrophy functional deficit",
        "impingement": "pinching compression end range pain",
        "activity-related": "exertional sports overhead athletic",
    }

    pain_text = " ".join([pain_map.get(pt, pt) for pt in profile.get("pain_types", [])])

    activity_map = {
        "High": "athlete high activity sports recreational",
        "Medium": "moderate activity work daily tasks",
        "Low": "sedentary low activity elderly conservative",
    }

    query = f"""
        {profile.get('joint', '')} {profile.get('joint', '')} {profile.get('joint', '')}
        {profile.get('diagnosis', '')}
        {profile.get('prior_treatments', '')}
        {pain_text}
        {activity_map.get(profile.get('activity', ''), '')}
        age {profile.get('age', '')} years old {profile.get('sex', '')}
    """
    return query.strip()


def score_procedures(profile, procedures):
    """
    TF-IDF cosine similarity ranking.
    Returns procedures sorted by score descending.
    """
    if not procedures:
        return []

    corpus = [p.full_text or "" for p in procedures]
    query = build_query(profile)
    profile_context = " ".join(
        [
            str(profile.get("diagnosis", "")).lower(),
            str(profile.get("prior_treatments", "")).lower(),
            " ".join([str(p).lower() for p in profile.get("pain_types", [])]),
        ]
    )

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", max_features=5000)

    all_docs = corpus + [query]
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    query_vec = tfidf_matrix[-1]
    doc_vecs = tfidf_matrix[:-1]

    similarities = cosine_similarity(query_vec, doc_vecs)[0]

    results = []
    for i, procedure in enumerate(procedures):
        base_score = float(similarities[i])

        # Bonus scoring on top of TF-IDF
        bonus = 0.0

        # Joint exact match bonus
        if procedure.joint and procedure.joint.lower() == str(profile.get("joint", "")).lower():
            bonus += 0.20

        # Age range bonus
        try:
            profile_age = int(profile.get("age"))
            if procedure.age_min <= profile_age <= procedure.age_max:
                bonus += 0.08
        except (TypeError, ValueError):
            pass

        # Activity match bonus
        if procedure.activity_level and profile.get("activity"):
            if procedure.activity_level.lower() == str(profile.get("activity", "")).lower():
                bonus += 0.07

        # Pain type overlap bonus
        proc_pain = (
            set([x.strip().lower() for x in procedure.pain_types.split(",")])
            if procedure.pain_types
            else set()
        )
        profile_pain = set([x.strip().lower() for x in profile.get("pain_types", [])])
        overlap = len(proc_pain & profile_pain)
        bonus += min(overlap * 0.05, 0.10)

        final_score = min(base_score + bonus, 1.0)

        contraindication_flags = []
        if procedure.contraindications:
            for contra in [c.strip() for c in procedure.contraindications.split(",") if c.strip()]:
                if contra.lower() in profile_context:
                    contraindication_flags.append(contra)

        if final_score > 0.05:  # minimum threshold
            results.append(
                {
                    "procedure": procedure.procedure,
                    "product": procedure.product,
                    "product_category": procedure.product_category,
                    "joint": procedure.joint,
                    "technique": procedure.technique,
                    "recovery_weeks": procedure.recovery_weeks,
                    "contraindications": procedure.contraindications.split(",")
                    if procedure.contraindications
                    else [],
                    "contraindication_flags": contraindication_flags,
                    "arthrex_url": procedure.arthrex_url,
                    "relevance_score": round(final_score, 3),
                    "confidence_label": (
                        "Strong Match"
                        if final_score >= CONFIDENCE_THRESHOLDS["strong"]
                        else "Good Match"
                        if final_score >= CONFIDENCE_THRESHOLDS["good"]
                        else "Possible Match"
                    ),
                    "pain_types_matched": list(proc_pain & profile_pain),
                    "match_reasons": [
                        f"Matched {procedure.joint} pathology context",
                        f"TF-IDF relevance score {round(base_score, 3)}",
                    ],
                    "technique_notes": procedure.technique,
                }
            )

    results.sort(key=lambda x: x["relevance_score"], reverse=True)

    for i, result in enumerate(results):
        result["rank"] = i + 1

    return results
