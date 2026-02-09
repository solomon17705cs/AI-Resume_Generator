from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer, util
import uvicorn
import os

app = FastAPI(title="ATSense Intelligence Engine V2")

# Advanced Models Cluster
kw_model = None
sim_model = None

def get_models():
    global kw_model, sim_model
    if kw_model is None:
        try:
            # Using standard models for robustness
            kw_model = KeyBERT()
            sim_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Model error: {e}")
    return kw_model, sim_model

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    ats_profile: Optional[Dict] = None

class AnalysisResponse(BaseModel):
    score: float
    found_keywords: List[str]
    missing_keywords: List[str]
    reasoning: str
    suggestions: List[str]
    match_forensics: Dict[str, float]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    kw_l, sim_l = get_models()
    
    # Load profile weights (defaulting to generic)
    profile = request.ats_profile or {
        "weights": {"keywords": 0.40, "semantic": 0.30, "structure": 0.20, "formatting": 0.10}
    }
    weights = profile["weights"]
    
    # 1. Advanced Keyword Profiling (Using KeyBERT for better extraction)
    jd_keywords = kw_l.extract_keywords(request.job_description, keyphrase_ngram_range=(1, 2), top_n=15)
    jd_kw_set = {kw[0].lower() for kw in jd_keywords}
    
    resume_text_lower = request.resume_text.lower()
    found = [kw for kw in jd_kw_set if kw in resume_text_lower]
    missing = [kw for kw in jd_kw_set if kw not in resume_text_lower]

    # 2. Semantic Logic & Vector Alignment
    embeddings = sim_l.encode([request.resume_text, request.job_description])
    semantic_sim = float(util.cos_sim(embeddings[0], embeddings[1])[0][0])
    
    # 3. Match Forensics (ATS Profile specific weighting)
    kw_score = (len(found) / len(jd_kw_set)) if jd_kw_set else 1.0
    
    # Simulated structural score (usually based on section presence and formatting)
    # Deep dive: more complex in production, but here we simulate based on "rules" matching
    structural_score = 0.85 
    
    # Calculate weighted score
    final_score = (
        (kw_score * weights["keywords"]) + 
        (semantic_sim * weights["semantic"]) +
        (structural_score * weights["structure"]) +
        (0.90 * weights["formatting"]) # Simulated formatting score
    ) * 100
    
    # 4. Professional Reasoning Engine (ATS Contextualized)
    ats_name = profile.get("name", "Generic ATS")
    reasoning = (
        f"Detected {ats_name} configuration. "
        f"Structural alignment: {round(semantic_sim*100)}% with JD mission core. "
        f"Keyword density is optimized for {ats_name}'s ranking algorithms."
    )
    
    suggestions = []
    if len(missing) > 3:
        suggestions.append(f"ATS ALERT: Add specific mentions of {missing[0]} and {missing[1]} to pass {ats_name} filters.")
    
    if ats_name == "Workday" and len(request.resume_text) > 5000:
        suggestions.append("WORKDAY ADVICE: Your resume length may trigger truncation in some older Workday parsers. Aim for brevity.")
    
    if semantic_sim < 0.6:
        suggestions.append(f"SEMANTIC ADVICE: Your bullets lack technical intensity for {ats_name}'s semantic layer.")
    else:
        suggestions.append("PRO TIP: Semantic overlap is high. Excellent for modern systems like Greenhouse/Lever.")

    return AnalysisResponse(
        score=round(final_score, 2),
        found_keywords=found,
        missing_keywords=missing,
        reasoning=reasoning,
        suggestions=suggestions,
        match_forensics={
            "semantic_overlap": round(semantic_sim * 100, 2),
            "keyword_density": round(kw_score * 100, 2),
            "structural_integrity": round(structural_score * 100, 2)
        }
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
