"""
ML Recommendation Engine for ClarityMD.

Uses TF-IDF vectorization and cosine similarity to match a patient profile
against the curated Arthrex procedure dataset and return ranked recommendations.
"""

import os
import json
import math
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "procedures.csv")


def _load_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["diagnosis_keywords"] = df["diagnosis_keywords"].fillna("")
    return df


def _build_query(profile: dict) -> str:
    """
    Combine patient profile fields into a single query string for similarity
    matching against procedure diagnosis keywords.
    """
    parts = []
    if profile.get("joint"):
        parts.append(profile["joint"])
    if profile.get("diagnosis"):
        parts.append(profile["diagnosis"])
    if profile.get("symptoms"):
        parts.append(profile["symptoms"])
    if profile.get("activity_level"):
        parts.append(profile["activity_level"])
    return " ".join(parts).lower()


def _age_score(age: int, age_min: int, age_max: int) -> float:
    """Return 1.0 if age is in range, partial credit just outside."""
    try:
        age = int(age)
        age_min = int(age_min)
        age_max = int(age_max)
    except (TypeError, ValueError):
        return 0.8
    if age_min <= age <= age_max:
        return 1.0
    diff = min(abs(age - age_min), abs(age - age_max))
    return max(0.0, 1.0 - diff * 0.05)


def _activity_score(patient_activity: str, procedure_activity: str) -> float:
    """Score how well activity levels align."""
    order = {"Low": 0, "Moderate": 1, "High": 2}
    p = order.get(patient_activity, 1)
    proc = order.get(procedure_activity, 1)
    diff = abs(p - proc)
    return [1.0, 0.7, 0.4][diff]


def recommend(profile: dict, top_n: int = 3) -> list[dict]:
    """
    Given a patient profile dict, return top_n procedure recommendations.

    Args:
        profile: dict with keys: age, sex, joint, diagnosis, symptoms,
                 activity_level, prior_treatments
        top_n: number of recommendations to return

    Returns:
        list of dicts with procedure details and confidence scores
    """
    df = _load_dataset()

    # Build TF-IDF corpus: one document per procedure combining joint +
    # diagnosis_keywords
    corpus = (df["joint"] + " " + df["diagnosis_keywords"]).str.lower().tolist()

    query = _build_query(profile)
    if not query.strip():
        query = "general orthopedic procedure"

    # Fit vectorizer on corpus + query together for consistent vocabulary
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
    all_texts = corpus + [query]
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    procedure_vectors = tfidf_matrix[:-1]
    query_vector = tfidf_matrix[-1]

    text_scores = cosine_similarity(query_vector, procedure_vectors).flatten()

    # Blend with demographic scores
    age = profile.get("age", 35)
    activity = profile.get("activity_level", "Moderate")

    composite_scores = []
    for i, row in df.iterrows():
        text_sim = float(text_scores[i])
        age_s = _age_score(age, row["patient_age_min"], row["patient_age_max"])
        act_s = _activity_score(activity, row["activity_level"])
        dataset_weight = float(row.get("confidence_weight", 1.0))

        # Weighted composite: text similarity carries most weight
        composite = (
            text_sim * 0.60
            + age_s * 0.20
            + act_s * 0.15
            + (dataset_weight - 0.7) * 0.05
        )
        composite_scores.append(composite)

    df = df.copy()
    df["_composite"] = composite_scores

    # Sort and take top N
    top_df = df.nlargest(top_n, "_composite")

    results = []
    for _, row in top_df.iterrows():
        confidence_pct = min(99, max(10, round(row["_composite"] * 100)))
        results.append(
            {
                "procedure": row["procedure"],
                "joint": row["joint"],
                "arthrex_product": row["arthrex_product"],
                "technique_notes": row["technique_notes"],
                "implant_sizing": row["implant_sizing"],
                "contraindications": row["contraindications"],
                "recommended_age_range": f"{int(row['patient_age_min'])}-{int(row['patient_age_max'])}",
                "recommended_activity_level": row["activity_level"],
                "confidence_score": confidence_pct,
            }
        )

    return results
