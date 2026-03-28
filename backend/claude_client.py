"""
Claude API client for ClarityMD.

Generates two text summaries from ML recommendations + patient profile:
  1. Surgeon brief (clinical tone)
  2. Patient education summary (conversational tone)
"""

import os
import anthropic


def _get_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    return anthropic.Anthropic(api_key=api_key)


def _format_profile(profile: dict) -> str:
    return (
        f"Age: {profile.get('age', 'N/A')}, "
        f"Sex: {profile.get('sex', 'N/A')}, "
        f"Affected joint/area: {profile.get('joint', 'N/A')}, "
        f"Diagnosis/Symptoms: {profile.get('diagnosis', 'N/A')} — {profile.get('symptoms', '')}, "
        f"Activity level: {profile.get('activity_level', 'N/A')}, "
        f"Prior treatments: {profile.get('prior_treatments', 'None listed')}"
    )


def _format_recommendations(recommendations: list[dict]) -> str:
    lines = []
    for i, rec in enumerate(recommendations, 1):
        lines.append(
            f"{i}. {rec['procedure']} (Confidence: {rec['confidence_score']}%)\n"
            f"   Arthrex Product: {rec['arthrex_product']}\n"
            f"   Technique: {rec['technique_notes']}\n"
            f"   Implant Sizing: {rec['implant_sizing']}\n"
            f"   Contraindications: {rec['contraindications']}"
        )
    return "\n".join(lines)


def generate_surgeon_summary(profile: dict, recommendations: list[dict]) -> str:
    """
    Generate a clinical surgeon brief using Claude.
    Returns a string or a fallback message if the API key is missing.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        return _fallback_surgeon_summary(profile, recommendations)

    client = _get_client()
    profile_text = _format_profile(profile)
    rec_text = _format_recommendations(recommendations)

    prompt = f"""You are a clinical decision support AI assisting an orthopedic surgeon.

Patient Profile:
{profile_text}

ML-Recommended Procedures (ranked by match confidence):
{rec_text}

Generate a concise clinical surgeon brief that includes:
1. A summary of the top recommended procedure and rationale
2. Key technique and product notes for the primary recommendation
3. Implant sizing guidance relevant to this patient
4. Risk flags or contraindications to consider for this specific patient
5. Brief notes on the 2nd and 3rd ranked alternatives if relevant

Tone: Clinical and precise. Use standard orthopedic terminology. Be concise — this is a pre-op reference tool, not a full report. Maximum 300 words."""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def generate_patient_summary(profile: dict, recommendations: list[dict]) -> str:
    """
    Generate a plain-language patient education summary using Claude.
    Returns a string or a fallback message if the API key is missing.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        return _fallback_patient_summary(profile, recommendations)

    client = _get_client()
    top_rec = recommendations[0] if recommendations else {}
    profile_text = _format_profile(profile)

    prompt = f"""You are a patient education AI helping a surgeon explain a procedure to their patient.

Patient Profile:
{profile_text}

Recommended Procedure: {top_rec.get('procedure', 'N/A')}
Arthrex Product Used: {top_rec.get('arthrex_product', 'N/A')}
Technique: {top_rec.get('technique_notes', 'N/A')}

Write a friendly, plain-language explanation for the patient that covers:
1. What this procedure is (in simple terms — no jargon)
2. Why it's recommended for their situation
3. What they can expect during and after the procedure
4. Recovery outlook and what it means for their daily life and activities

Tone: Warm, clear, reassuring. Avoid medical jargon. Write as if talking to the patient directly.
Do NOT include disclaimers like "consult your doctor" — this IS the doctor's tool.
Maximum 250 words."""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def _fallback_surgeon_summary(profile: dict, recommendations: list[dict]) -> str:
    """Fallback when Claude API key is not configured."""
    if not recommendations:
        return "No recommendations generated."
    top = recommendations[0]
    lines = [
        f"**Primary Recommendation: {top['procedure']}** (Confidence: {top['confidence_score']}%)",
        "",
        f"**Arthrex Product:** {top['arthrex_product']}",
        f"**Technique:** {top['technique_notes']}",
        f"**Implant Sizing:** {top['implant_sizing']}",
        f"**Contraindications/Risk Flags:** {top['contraindications']}",
        f"**Recommended Patient Age Range:** {top['recommended_age_range']} yrs",
        "",
        "**Differential Considerations:**",
    ]
    for rec in recommendations[1:]:
        lines.append(
            f"- {rec['procedure']} — {rec['arthrex_product']} "
            f"(Confidence: {rec['confidence_score']}%)"
        )
    lines.append("")
    lines.append(
        "_Note: Claude API key not configured. Add ANTHROPIC_API_KEY to .env for AI-generated summaries._"
    )
    return "\n".join(lines)


def _fallback_patient_summary(profile: dict, recommendations: list[dict]) -> str:
    """Fallback when Claude API key is not configured."""
    if not recommendations:
        return "No procedure recommendations available."
    top = recommendations[0]
    procedure = top["procedure"]
    product = top["arthrex_product"]
    return (
        f"Based on your profile, your surgeon is recommending a procedure called **{procedure}**.\n\n"
        f"This procedure uses the **{product}** system, which is a specialized tool designed to "
        f"help repair your {profile.get('joint', 'affected area')} effectively with minimal invasiveness.\n\n"
        f"Your care team will walk you through exactly what to expect before, during, and after "
        f"your procedure — including your recovery timeline and what activities you can look "
        f"forward to getting back to.\n\n"
        "_Note: Claude API key not configured. Add ANTHROPIC_API_KEY to .env for AI-generated summaries._"
    )
