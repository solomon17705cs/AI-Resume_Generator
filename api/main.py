from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer, util
import uvicorn
import os
import re

app = FastAPI(title="ATSense Hybrid Intelligence Engine")

# Advanced Models Cluster
kw_model = None
sim_model = None

def get_models():
    global kw_model, sim_model
    if kw_model is None:
        try:
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
    suggestions: List[Dict]
    match_forensics: Dict[str, float]

def clean_keywords(keywords: List[str], text: str) -> List[str]:
    """
    Remove branding, company names, and broken phrases.
    Ensures semantic keywords are professional noun phrases.
    """
    cleaned = []
    
    # Generic noise words and branding-likely terms
    blacklist = {
        'planys', 'actively', 'hiring', 'globally', 'integrates', 'deep', 'brief', 
        'opportunity', 'join', 'company', 'mission', 'vision', 'located', 'office',
        'remote', 'hybrid', 'benefits', 'salary', 'competitive', 'equal', 'employer',
        'professional', 'passionate', 'dedicated', 'experienced', 'successfully'
    }

    # Common verbs/adjectives that often start 'broken' semantic phrases
    broken_starts = {
        'development', 'builds', 'applications', 'working', 'using', 'leveraging', 
        'handling', 'managing', 'providing', 'excellent', 'strong', 'brief'
    }

    for kw in keywords:
        kw_clean = kw.lower().strip()
        words = kw_clean.split()
        
        # 1. Check against blacklist (remove if any word is in blacklist)
        if any(word in blacklist for word in words):
            continue
            
        # 2. Remove very short keywords or digits
        if len(kw_clean) < 3 or kw_clean.isdigit():
            continue
            
        # 3. Check for broken n-grams (Starts/Ends with Stop Words)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'by', 'of', 'at', 'to', 'from', 'in', 'on', 'if', 'is', 'are', 'was', 'were'}
        if words[0] in stop_words or words[-1] in stop_words:
            continue
            
        # 4. Filter out phrases that start with a generic action but don't have enough nouns
        # (e.g., 'development unmanned' -> bad, 'unmanned development' -> slightly better but still weak)
        if words[0] in broken_starts and len(words) < 3:
            continue

        cleaned.append(kw)
    
    return cleaned[:15]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    kw_l, sim_l = get_models()
    
    profile = request.ats_profile or {
        "weights": {"keywords": 0.40, "semantic": 0.30, "structure": 0.20, "formatting": 0.10}
    }
    weights = profile["weights"]
    
    # 1. Hybrid Keyword Match (40% Weight)
    # Using 1-3 ngrams for richer phrases, cleaning for quality
    jd_keywords_raw = kw_l.extract_keywords(request.job_description, keyphrase_ngram_range=(1, 3), stop_words='english', top_n=50)
    jd_keywords = clean_keywords([kw[0] for kw in jd_keywords_raw], request.job_description)
    jd_kw_set = {kw.lower() for kw in jd_keywords}
    
    resume_text_lower = request.resume_text.lower()
    found = [kw for kw in jd_kw_set if kw in resume_text_lower]
    missing = [kw for kw in jd_kw_set if kw not in resume_text_lower]
    
    words = re.findall(r'\w+', resume_text_lower)
    total_words = len(words)
    kw_count = sum(resume_text_lower.count(kw) for kw in found)
    density = (kw_count / total_words * 100) if total_words > 0 else 0
    
    if 2 <= density <= 5:
        kw_match_score = 1.0
    else:
        kw_match_score = max(0.4, 1.0 - abs(density - 3.5) / 10)

    # 2. Semantic Relevance (30% Weight)
    embeddings = sim_l.encode([request.resume_text, request.job_description])
    semantic_sim = float(util.cos_sim(embeddings[0], embeddings[1])[0][0])
    
    # 3. Section Compliance & Brevity (20% Weight)
    standard_headers = ["experience", "education", "skills", "summary", "projects"]
    headers_found = [h for h in standard_headers if h in resume_text_lower]
    header_score = len(headers_found) / len(standard_headers)
    
    brevity_score = 1.0
    if total_words > 1000:
        brevity_score = 0.7
    elif total_words > 800:
        brevity_score = 0.85

    structural_score = (header_score * 0.7) + (brevity_score * 0.3)
    
    # 4. Clarity & Impact (10% Weight)
    clarity_score = 0.90 
    
    raw_score = (
        (kw_match_score * weights["keywords"]) + 
        (semantic_sim * weights["semantic"]) +
        (structural_score * weights["structure"]) +
        (clarity_score * weights["formatting"])
    ) * 100
    
    final_score = min(raw_score, 100.0)
    
    ats_name = profile.get("name", "Generic ATS")
    reasoning = (
        f"Detected {ats_name} configuration. "
        f"Keyword density is {round(density, 1)}% (Target: 2-5%). "
        f"The system alignment shows {round(semantic_sim*100)}% mission core overlap."
    )
    
    suggestions = []
    if density < 2:
        suggestions.append({"type": "critical", "message": f"LOW DENSITY: Your keyword density is low ({round(density, 1)}%). Naturaly integrate terms like '{missing[0]}' if applicable." if missing else "LOW DENSITY: Add more skill-based phrases."})
    elif density > 5:
        suggestions.append({"type": "warning", "message": f"STUFFING ALERT: Keyword density is {round(density, 1)}%. Ensure your content remains readable for human reviewers."})

    if total_words > 800:
        suggestions.append({"type": "warning", "message": f"LENGTH ALERT: Your resume is ~{total_words} words. Aim for under 800 words for maximum impact."})

    if structural_score < 0.8:
        suggestions.append({"type": "critical", "message": "STRUCTURE ALERT: Use standard section headers like 'PROFESSIONAL EXPERIENCE' to improve ATS parsing."})

    return AnalysisResponse(
        score=round(float(final_score), 2),
        found_keywords=found,
        missing_keywords=missing,
        reasoning=reasoning,
        suggestions=suggestions,
        match_forensics={
            "keyword_match": round(min(kw_match_score * 100, 100.0), 2),
            "semantic_relevance": round(min(semantic_sim * 100, 100.0), 2),
            "section_compliance": round(min(structural_score * 100, 100.0), 2),
            "clarity_recency": round(min(clarity_score * 100, 100.0), 2)
        }
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
