"""
ASHA Assist – Symptom Screening Engine
Rule-based + ML-inspired disease prediction for rural health screening.
"""

from typing import List, Dict, Optional, Tuple
import re

# ── Disease Rule Definitions ─────────────────────────────────────────────────

DISEASE_RULES: Dict[str, Dict] = {
    "Dengue": {
        "keywords": [
            "fever", "high fever", "severe headache", "headache", "pain behind eyes",
            "eye pain", "joint pain", "muscle pain", "body ache", "rash", "skin rash",
            "nausea", "vomiting", "fatigue", "bleeding gums", "bruising"
        ],
        "required_any": ["fever", "high fever"],
        "strong_indicators": ["pain behind eyes", "eye pain", "rash", "joint pain", "bleeding gums"],
        "vitals_risk": {
            "temperature_high": 38.5,
            "pulse_high": 95,
            "oxygen_low": 95
        },
        "season_boost": ["monsoon"],
        "base_risk": "Medium",
        "high_risk_threshold": 5
    },
    "Malaria": {
        "keywords": [
            "fever", "high fever", "chills", "shivering", "sweating", "headache",
            "body ache", "nausea", "vomiting", "fatigue", "pale skin", "jaundice",
            "cyclical fever", "cold", "rigor"
        ],
        "required_any": ["fever", "high fever", "chills"],
        "strong_indicators": ["chills", "shivering", "cyclical fever", "sweating after fever"],
        "vitals_risk": {
            "temperature_high": 39.0,
            "pulse_high": 100,
            "oxygen_low": 94
        },
        "base_risk": "High",
        "high_risk_threshold": 3
    },
    "Tuberculosis": {
        "keywords": [
            "persistent cough", "cough", "coughing blood", "blood in sputum", "hemoptysis",
            "chest pain", "weight loss", "night sweats", "fatigue", "fever", "loss of appetite",
            "breathlessness", "difficulty breathing", "shortness of breath"
        ],
        "required_any": ["cough", "persistent cough", "coughing blood"],
        "strong_indicators": ["coughing blood", "blood in sputum", "night sweats", "weight loss"],
        "vitals_risk": {
            "temperature_high": 37.5,
            "oxygen_low": 93,
            "duration_weeks": 2
        },
        "base_risk": "Medium",
        "high_risk_threshold": 4
    },
    "Anemia": {
        "keywords": [
            "fatigue", "weakness", "pale skin", "pallor", "shortness of breath",
            "dizziness", "cold hands", "cold feet", "headache", "chest pain",
            "rapid heartbeat", "brittle nails", "hair loss", "difficulty concentrating"
        ],
        "required_any": ["fatigue", "weakness", "pale skin", "pallor"],
        "strong_indicators": ["pallor", "pale skin", "cold hands", "rapid heartbeat", "dizziness"],
        "vitals_risk": {
            "pulse_high": 105,
            "oxygen_low": 92
        },
        "base_risk": "Medium",
        "high_risk_threshold": 5
    },
    "Respiratory Infection": {
        "keywords": [
            "cough", "dry cough", "wet cough", "sore throat", "throat pain",
            "runny nose", "nasal congestion", "fever", "mild fever", "difficulty breathing",
            "chest tightness", "wheezing", "breathlessness", "cold", "sneezing"
        ],
        "required_any": ["cough", "sore throat", "runny nose"],
        "strong_indicators": ["difficulty breathing", "chest tightness", "wheezing", "breathlessness"],
        "vitals_risk": {
            "temperature_high": 38.0,
            "oxygen_low": 93
        },
        "base_risk": "Low",
        "high_risk_threshold": 4
    },
    "Typhoid": {
        "keywords": [
            "high fever", "fever", "abdominal pain", "stomach pain", "headache",
            "diarrhea", "constipation", "fatigue", "loss of appetite", "rash",
            "rose spots", "nausea", "vomiting", "weakness", "enlarged spleen"
        ],
        "required_any": ["fever", "high fever", "abdominal pain"],
        "strong_indicators": ["rose spots", "stepladder fever", "abdominal pain with fever", "spleen pain"],
        "vitals_risk": {
            "temperature_high": 39.5,
            "pulse_high": 95
        },
        "base_risk": "High",
        "high_risk_threshold": 4
    }
}

# ── Vitals Risk Assessment ────────────────────────────────────────────────────

def assess_vitals_risk(vitals: Dict) -> Tuple[int, List[str]]:
    """Returns (risk_score, flags_list)"""
    score = 0
    flags = []

    temp = vitals.get("temperature")
    pulse = vitals.get("pulse")
    spo2 = vitals.get("oxygenLevel")
    sbp = vitals.get("bloodPressureSystolic")

    if temp is not None:
        if temp >= 40.0:
            score += 3
            flags.append(f"Very high fever ({temp:.1f}°C)")
        elif temp >= 38.5:
            score += 2
            flags.append(f"High fever ({temp:.1f}°C)")
        elif temp >= 37.5:
            score += 1
            flags.append(f"Low-grade fever ({temp:.1f}°C)")

    if pulse is not None:
        if pulse >= 120:
            score += 3
            flags.append(f"Tachycardia – pulse {pulse} bpm")
        elif pulse >= 100:
            score += 2
            flags.append(f"Elevated pulse ({pulse} bpm)")

    if spo2 is not None:
        if spo2 < 90:
            score += 4
            flags.append(f"Critical oxygen saturation ({spo2}%)")
        elif spo2 < 93:
            score += 3
            flags.append(f"Low oxygen saturation ({spo2}%)")
        elif spo2 < 95:
            score += 2
            flags.append(f"Borderline oxygen saturation ({spo2}%)")

    if sbp is not None:
        if sbp < 90:
            score += 3
            flags.append(f"Hypotension – BP {sbp} mmHg")
        elif sbp < 100:
            score += 2
            flags.append(f"Low blood pressure ({sbp} mmHg)")

    return score, flags


def normalize_symptoms(symptoms: List[str]) -> List[str]:
    """Lowercase and clean symptom strings."""
    normalized = []
    for s in symptoms:
        s = s.lower().strip()
        s = re.sub(r'\s+', ' ', s)
        normalized.append(s)
    return normalized


def score_disease(disease: str, rules: Dict, symptoms: List[str], vitals: Dict, age: int) -> Dict:
    """Score a disease based on symptoms and vitals."""
    keyword_matches = set()
    for kw in rules["keywords"]:
        for sym in symptoms:
            if kw in sym or sym in kw:
                keyword_matches.add(kw)
                break

    match_count = len(keyword_matches)
    has_required = any(
        any(req in sym or sym in req for sym in symptoms)
        for req in rules["required_any"]
    )

    if not has_required:
        return {"disease": disease, "score": 0, "match_count": 0, "confidence": 0.0}

    strong_matches = sum(
        1 for si in rules["strong_indicators"]
        if any(si in sym or sym in si for sym in symptoms)
    )

    vital_score, _ = assess_vitals_risk(vitals)

    # Age-based adjustments
    age_factor = 0
    if age < 5 or age > 60:
        age_factor = 1  # Higher vulnerability

    total_score = match_count + (strong_matches * 2) + min(vital_score, 4) + age_factor
    max_possible = len(rules["keywords"]) + (len(rules["strong_indicators"]) * 2) + 4 + 1
    confidence = min(total_score / max(max_possible * 0.4, 1), 0.98)

    return {
        "disease": disease,
        "score": total_score,
        "match_count": match_count,
        "strong_matches": strong_matches,
        "confidence": round(confidence, 3)
    }


def determine_risk_level(disease: str, score_data: Dict, vitals: Dict, age: int) -> str:
    """Determine risk level based on disease, score, vitals, and age."""
    rules = DISEASE_RULES.get(disease, {})
    vital_score, vital_flags = assess_vitals_risk(vitals)

    # Critical vital signs always = High risk
    spo2 = vitals.get("oxygenLevel", 100)
    temp = vitals.get("temperature", 37)
    if spo2 is not None and spo2 < 90:
        return "High"
    if temp is not None and temp >= 40.5:
        return "High"

    base_risk = rules.get("base_risk", "Low")
    threshold = rules.get("high_risk_threshold", 5)
    match_count = score_data.get("match_count", 0)

    # Escalation logic
    if base_risk == "High" and match_count >= 3:
        return "High"
    if base_risk == "High" and match_count >= 1:
        return "Medium" if vital_score < 3 else "High"
    if match_count >= threshold or vital_score >= 5:
        return "High"
    if match_count >= (threshold - 2) or vital_score >= 3:
        return "Medium"
    if base_risk == "Medium" and match_count >= 2:
        return "Medium"

    # Age escalation
    if (age < 5 or age > 65) and base_risk != "Low":
        if base_risk == "Medium":
            return "High" if match_count >= 3 else "Medium"

    return "Low" if base_risk == "Low" else base_risk


def get_recommendation(disease: str, risk_level: str, vitals: Dict) -> str:
    recs = {
        ("High", "Dengue"): "Refer to PHC immediately. Monitor platelet count urgently. Ensure IV fluids.",
        ("High", "Malaria"): "Refer to PHC immediately for blood smear test and antimalarial treatment.",
        ("High", "Typhoid"): "Refer to PHC immediately. Blood culture required. Avoid NSAIDs.",
        ("High", "Tuberculosis"): "Refer to District TB Center. Sputum test and chest X-ray required.",
        ("Medium", "Tuberculosis"): "Visit PHC within 24 hours. Sputum microscopy recommended.",
        ("Medium", "Dengue"): "Visit PHC within 24 hours. Platelet count monitoring advised.",
        ("Medium", "Anemia"): "Visit PHC. CBC test required. Iron supplementation likely needed.",
        ("Low", "Respiratory Infection"): "Rest at home. Adequate fluids. Paracetamol for fever. Follow up in 3 days.",
        ("Low", "Anemia"): "Iron-rich diet. Follow up in 1 week. Hemoglobin test recommended.",
    }

    spo2 = vitals.get("oxygenLevel")
    if spo2 is not None and spo2 < 93:
        return "URGENT: Low oxygen saturation detected. Refer to hospital immediately."

    key = (risk_level, disease)
    if key in recs:
        return recs[key]

    default_recs = {
        "High": f"Immediate referral to Primary Health Center required for {disease} treatment.",
        "Medium": f"Visit nearest PHC within 24 hours. Further testing required for {disease}.",
        "Low": "Monitor symptoms. Ensure adequate rest and hydration. Follow up in 3 days if no improvement."
    }
    return default_recs.get(risk_level, "Please consult a healthcare provider.")


def predict(symptoms: List[str], vitals: Dict, age: int = 30, gender: str = "unknown") -> Dict:
    """
    Main prediction function.
    Returns disease prediction, risk level, confidence, and differentials.
    """
    if not symptoms:
        return {
            "disease_prediction": "Unknown",
            "risk_level": "Low",
            "recommendation": "Insufficient symptoms. Please re-enter symptoms.",
            "confidence": 0.0,
            "differentials": []
        }

    normalized_symptoms = normalize_symptoms(symptoms)
    scores = []

    for disease, rules in DISEASE_RULES.items():
        result = score_disease(disease, rules, normalized_symptoms, vitals, age)
        if result["score"] > 0:
            scores.append(result)

    scores.sort(key=lambda x: x["score"], reverse=True)

    if not scores:
        return {
            "disease_prediction": "Unknown",
            "risk_level": "Low",
            "recommendation": "No matching disease pattern. Monitor symptoms and consult a healthcare provider.",
            "confidence": 0.0,
            "differentials": []
        }

    top = scores[0]
    disease = top["disease"]
    risk_level = determine_risk_level(disease, top, vitals, age)
    recommendation = get_recommendation(disease, risk_level, vitals)

    _, vital_flags = assess_vitals_risk(vitals)

    differentials = [
        {"disease": s["disease"], "probability": round(s["confidence"] * 0.6, 3)}
        for s in scores[1:4]
        if s["confidence"] > 0.1
    ]

    return {
        "disease_prediction": disease,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence": top["confidence"],
        "vital_flags": vital_flags,
        "differentials": differentials,
        "ai_model": "rule-based-v2"
    }
