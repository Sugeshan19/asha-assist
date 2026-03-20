"""
ASHA Assist – AI Microservice (FastAPI)
Symptom screening and risk prediction for rural healthcare.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime
import os
import httpx

from symptom_engine import predict

app = FastAPI(
    title="ASHA Assist AI Service",
    description="Symptom screening and disease prediction for rural healthcare workers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ─────────────────────────────────────────────────

class Vitals(BaseModel):
    temperature: Optional[float] = Field(None, description="Body temperature in Celsius")
    pulse: Optional[int] = Field(None, description="Heart rate in bpm")
    oxygenLevel: Optional[float] = Field(None, description="SpO2 percentage")
    bloodPressureSystolic: Optional[int] = Field(None, description="Systolic BP mmHg")
    bloodPressureDiastolic: Optional[int] = Field(None, description="Diastolic BP mmHg")
    weight: Optional[float] = Field(None, description="Weight in kg")


class ScreeningRequest(BaseModel):
    symptoms: List[str] = Field(default=[], description="List of symptom strings")
    vitals: Optional[Vitals] = Field(default=None)
    age: int = Field(default=30, ge=0, le=120)
    gender: str = Field(default="unknown")
    useLLM: bool = Field(default=False, description="Optional OpenAI-assisted reasoning")


class Differential(BaseModel):
    disease: str
    probability: float


class ScreeningResponse(BaseModel):
    disease_prediction: str
    risk_level: str
    recommendation: str
    confidence: float
    vital_flags: List[str] = []
    differentials: List[Differential] = []
    ai_model: str = "rule-based-v2"
    processed_at: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "ASHA Assist AI Service",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.post("/predict", response_model=ScreeningResponse)
async def predict_disease(request: ScreeningRequest):
    """
    Accepts patient symptoms and vitals, returns disease prediction,
    risk level, and referral recommendation.
    """
    try:
        vitals_dict = request.vitals.model_dump(exclude_none=True) if request.vitals else {}

        result = predict(
            symptoms=request.symptoms,
            vitals=vitals_dict,
            age=request.age,
            gender=request.gender
        )

        if request.useLLM and os.getenv("OPENAI_API_KEY"):
            result = await enhance_with_llm(request, result)

        return ScreeningResponse(
            disease_prediction=result["disease_prediction"],
            risk_level=result["risk_level"],
            recommendation=result["recommendation"],
            confidence=result["confidence"],
            vital_flags=result.get("vital_flags", []),
            differentials=[Differential(**d) for d in result.get("differentials", [])],
            ai_model=result.get("ai_model", "rule-based-v2"),
            processed_at=datetime.datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


async def enhance_with_llm(request: ScreeningRequest, baseline_result: Dict[str, Any]) -> Dict[str, Any]:
    """Optional enhancement layer using OpenAI chat completions API."""
    try:
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        prompt = {
            "symptoms": request.symptoms,
            "vitals": request.vitals.model_dump(exclude_none=True) if request.vitals else {},
            "age": request.age,
            "gender": request.gender,
            "baseline": baseline_result
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "temperature": 0.2,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a clinical triage assistant. Return strict JSON with keys: disease_prediction, risk_level, recommendation. Risk must be Low/Medium/High."
                        },
                        {
                            "role": "user",
                            "content": str(prompt)
                        }
                    ],
                    "response_format": {"type": "json_object"}
                }
            )
            response.raise_for_status()
            payload = response.json()
            content = payload["choices"][0]["message"]["content"]
            parsed = __import__("json").loads(content)

        baseline_result["disease_prediction"] = parsed.get("disease_prediction", baseline_result["disease_prediction"])
        baseline_result["risk_level"] = parsed.get("risk_level", baseline_result["risk_level"])
        baseline_result["recommendation"] = parsed.get("recommendation", baseline_result["recommendation"])
        baseline_result["ai_model"] = f"{baseline_result.get('ai_model', 'rule-based-v2')}+openai"
        return baseline_result
    except Exception:
        # Do not fail triage if OpenAI is unavailable.
        return baseline_result


@app.post("/batch-predict")
def batch_predict(requests: List[ScreeningRequest]):
    """Batch prediction for multiple patients."""
    if len(requests) > 50:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 50")

    results = []
    for req in requests:
        vitals_dict = req.vitals.model_dump(exclude_none=True) if req.vitals else {}
        result = predict(req.symptoms, vitals_dict, req.age, req.gender)
        results.append(result)
    return {"predictions": results, "count": len(results)}


@app.get("/diseases")
def list_diseases():
    """Return list of detectable diseases."""
    from symptom_engine import DISEASE_RULES
    diseases = []
    for name, rules in DISEASE_RULES.items():
        diseases.append({
            "name": name,
            "base_risk": rules.get("base_risk", "Low"),
            "key_symptoms": rules.get("strong_indicators", [])[:4]
        })
    return {"diseases": diseases}


@app.get("/symptoms")
def list_symptoms():
    """Return all known symptom keywords."""
    from symptom_engine import DISEASE_RULES
    all_symptoms = set()
    for rules in DISEASE_RULES.values():
        all_symptoms.update(rules["keywords"])
    return {"symptoms": sorted(list(all_symptoms))}
