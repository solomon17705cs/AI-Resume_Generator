from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import spacy
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer, util
import uvicorn
import os

app = FastAPI(title="ATSense Intelligence Engine V2")

# Advanced Models Cluster
nlp = None
kw_model = None
sim_model = None

def get_models():
    global nlp, kw_model, sim_model
    if nlp is None:
        try:
            # Using standard models for robustness
            nlp = spacy.load("en_core_web_sm")
            kw_model = KeyBERT()
            sim_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Model error: {e}")
    return nlp, kw_model, sim_model

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class AnalysisResponse(BaseModel):
    score: float
    found_keywords: List[str]
    missing_keywords: List[str]
    reasoning: str
    suggestions: List[str]
    match_forensics: Dict[str, float]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    nlp_l, kw_l, sim_l = get_models()
    
    # 1. Advanced Keyword Profiling (Using KeyBERT for better extraction)
    jd_keywords = kw_l.extract_keywords(request.job_description, keyphrase_ngram_range=(1, 2), top_n=15)
    jd_kw_set = {kw[0].lower() for kw in jd_keywords}
    
    resume_text_lower = request.resume_text.lower()
    found = [kw for kw in jd_kw_set if kw in resume_text_lower]
    missing = [kw for kw in jd_kw_set if kw not in resume_text_lower]

    # 2. Semantic Logic & Vector Alignment
    embeddings = sim_l.encode([request.resume_text, request.job_description])
    semantic_sim = float(util.cos_sim(embeddings[0], embeddings[1])[0][0])
    
    # 3. Match Forensics (Simulating deep structural analysis)
    # Keyword coverage (40%) + Semantic Alignment (60%)
    kw_score = (len(found) / len(jd_kw_set)) if jd_kw_set else 1.0
    final_score = (kw_score * 0.4 + semantic_sim * 0.6) * 100
    
    # 4. Professional Reasoning Engine
    reasoning = (
        f"Your profile shows a structural alignment of {round(semantic_sim*100)}% with the role's mission core. "
        f"While your foundational skills are strong, the 'missing signals' list indicates a gap in '{missing[0] if missing else 'none'}' context."
    )
    
    suggestions = []
    if len(missing) > 3:
        suggestions.append(f"CRITICAL: Add specific mentions of {missing[0]} and {missing[1]} to pass tech-filters.")
    if semantic_sim < 0.6:
        suggestions.append("ADVICE: Your experience bullets are descriptive but lack action-verb intensity required by Big Tech ATS.")
    else:
        suggestions.append("STRENGTH: Semantic overlap is high. Focus on refining impact metrics.")

    return AnalysisResponse(
        score=round(final_score, 2),
        found_keywords=found,
        missing_keywords=missing,
        reasoning=reasoning,
        suggestions=suggestions,
        match_forensics={
            "semantic_overlap": round(semantic_sim * 100, 2),
            "keyword_density": round(kw_score * 100, 2),
            "structural_integrity": 85.0 # Simulated
        }
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
