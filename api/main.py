"""
ATSense - Advanced NLP Engine for Resume Optimization
"""
import gc
import random
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import os
import re
from functools import lru_cache
import numpy as np
import parser as resume_parser
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer, util

app = FastAPI(title="ATSense Advanced Semantic Engine")

kw_model = None
sim_model = None

def get_models():
    global kw_model, sim_model
    if kw_model is None:
        kw_model = KeyBERT('paraphrase-multilingual-MiniLM-L12-v2')
        sim_model = SentenceTransformer('all-MiniLM-L6-v2')
    return kw_model, sim_model

# Request/Response models
class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    ats_profile: Optional[Dict] = None

class KeywordMetadata(BaseModel):
    text: str
    found: bool
    priority: str
    count_in_jd: int
    count_in_resume: int
    context: str
    recommended_bullet: Optional[str] = None

class AnalysisResponse(BaseModel):
    score: float
    found_keywords: List[str]
    missing_keywords: List[str]
    reasoning: str
    suggestions: List[Dict]
    match_forensics: Dict[str, float]
    section_scores: Dict[str, float]
    keyword_metrics: List[KeywordMetadata]

def get_priority(count: int) -> str:
    if count >= 8:
        return "high"
    if count >= 3:
        return "medium"
    return "low"

@lru_cache(maxsize=256)
def encode_text(text: str):
    try:
        kw_l, sim_l = get_models()
        return sim_l.encode(text, convert_to_tensor=False, show_progress_bar=False)
    except:
        return None

CS_KEYWORDS = {
    "frontend": ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Vue", "Angular"],
    "backend": ["Node.js", "Python", "Java", "API", "Database", "MongoDB", "PostgreSQL"],
    "ml": ["Python", "PyTorch", "TensorFlow", "Machine Learning", "AI"],
    "generic": ["Software Engineer", "Computer Science", "Algorithms"]
}

def detect_role(jd: str) -> str:
    jd_lower = jd.lower()
    scores = {
        "frontend": len(re.findall(r"react|angular|vue|typescript", jd_lower)),
        "backend": len(re.findall(r"node|python|api|sql", jd_lower)),
        "ml": len(re.findall(r"ml|ai|pytorch|tensorflow", jd_lower)),
    }
    max_role = max(scores, key=scores.get) if max(scores.values()) > 0 else "generic"
    return max_role

def clean_keywords(keywords: List[str], text: str) -> List[str]:
    blacklist = {"planys", "actively", "hiring", "company", "mission", "benefits", "salary"}
    stop_words = {"the", "a", "an", "and", "or", "for", "with", "by", "of", "at", "to", "from"}
    
    cleaned = []
    for kw in keywords:
        kw_clean = kw.lower().strip()
        words = kw_clean.split()
        if any(word in blacklist for word in words):
            continue
        if len(kw_clean) < 3:
            continue
        if words and words[0] in stop_words:
            continue
        cleaned.append(kw)
    return cleaned[:15]

def extract_experience_years(resume_text: str) -> float:
    years = re.findall(r"\b(20\d{2})\b", resume_text)
    if not years:
        return 0.0
    unique_years = sorted(set(map(int, years)))
    if len(unique_years) < 2:
        return 0.5
    return float(unique_years[-1] - unique_years[0])

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    kw_l, sim_l = get_models()
    
    # Extract keywords
    try:
        jd_keywords_raw = kw_l.extract_keywords(request.job_description, keyphrase_ngram_range=(1, 3), stop_words="english", top_n=50)
        extracted_keywords = [kw[0] for kw in jd_keywords_raw]
    except:
        extracted_keywords = []
    
    role = detect_role(request.job_description)
    domain_keywords = CS_KEYWORDS.get(role, CS_KEYWORDS["generic"])
    
    combined_keywords = list(dict.fromkeys(extracted_keywords + domain_keywords))
    jd_keywords = clean_keywords(combined_keywords, request.job_description)
    
    jd_lower = request.job_description.lower()
    resume_lower = request.resume_text.lower()
    
    keyword_metrics = []
    found_list = []
    missing_list = []

    for kw in jd_keywords:
        kw_lwr = kw.lower()
        count_jd = len(re.findall(r"\b" + re.escape(kw_lwr) + r"\b", jd_lower))
        count_resume = len(re.findall(r"\b" + re.escape(kw_lwr) + r"\b", resume_lower))
        
        context = ""
        idx = jd_lower.find(kw_lwr)
        if idx != -1:
            start = max(0, idx - 40)
            end = min(len(request.job_description), idx + len(kw) + 40)
            context = "..." + request.job_description[start:end].replace("\n", " ") + "..."

        found = count_resume > 0
        priority = get_priority(count_jd)
        
        verb = random.choice(["Led", "Engineered", "Optimized", "Developed"])
        impact = random.choice(["reducing time by 30%", "improving reliability by 25%", "delivering 40% efficiency gain"])
        recommended = f"{verb} {kw} implementation, {impact}." if not found else None
        
        metric = KeywordMetadata(
            text=kw,
            found=found,
            priority=priority,
            count_in_jd=count_jd,
            count_in_resume=count_resume,
            context=context,
            recommended_bullet=recommended
        )
        keyword_metrics.append(metric)
        
        if found:
            found_list.append(kw)
        else:
            missing_list.append(kw)

    exp_years = extract_experience_years(request.resume_text)
    is_fresher = exp_years < 1.0 or "intern" in resume_lower
    
    high_priority_missing = [m for m in keyword_metrics if m.priority == "high" and not m.found]
    kw_raw_score = (len(found_list) / len(jd_keywords)) if jd_keywords else 1.0
    kw_penalty = len(high_priority_missing) * 0.05
    kw_match_score = max(0.1, kw_raw_score - kw_penalty)

    standard_headers = ["experience", "education", "skills", "summary", "projects"]
    headers_found = [h for h in standard_headers if h in resume_lower]
    section_score = len(headers_found) / len(standard_headers)

    # Semantic score
    resume_emb = encode_text(request.resume_text)
    jd_emb = encode_text(request.job_description)
    semantic_score = 0.5
    if resume_emb is not None and jd_emb is not None:
        try:
            sim_val = float(util.cos_sim(resume_emb.reshape(1, -1), jd_emb.reshape(1, -1))[0][0])
            semantic_score = max(0.2, sim_val)
        except:
            pass

    words = re.findall(r"\w+", resume_lower)
    total_words = len(words)
    sentences_list = re.split(r"[.!?]+", request.resume_text)
    avg_sentence_len = total_words / len(sentences_list) if sentences_list else 0
    clarity_score = 1.0
    if avg_sentence_len > 25:
        clarity_score -= 0.3
    if total_words > 1000:
        clarity_score -= 0.2
    clarity_score = max(0.1, clarity_score)

    if is_fresher:
        final_score = (kw_match_score * 35) + (section_score * 15) + (semantic_score * 40) + (clarity_score * 10)
    else:
        final_score = (kw_match_score * 40) + (section_score * 30) + (semantic_score * 20) + (clarity_score * 10)
    
    suggestions = []
    if is_fresher:
        suggestions.append({"id": "fresher-tip", "type": "info", "title": "Fresher Mode Active", "message": "Scoring prioritized technical depth."})
    if kw_match_score < 0.4:
        suggestions.append({"id": "kw-low", "type": "critical", "title": "Critical Keywords Missing", "message": f"Missing {len(missing_list)} key terms."})
    if section_score < 0.7:
        suggestions.append({"id": "structure-bad", "type": "warning", "title": "Poor Structure", "message": "Standard resume sections missing."})

    return AnalysisResponse(
        score=round(float(final_score), 2),
        found_keywords=found_list,
        missing_keywords=missing_list,
        reasoning=f"Keywords: {round(kw_match_score*100)}%, Section: {round(section_score*100)}%, Semantic: {round(semantic_score*100)}%.",
        suggestions=suggestions,
        match_forensics={
            "keyword_match": round(kw_match_score * 100, 1),
            "section_compliance": round(section_score * 100, 1),
            "semantic_relevance": round(semantic_score * 100, 1),
            "clarity_recency": round(clarity_score * 100, 1)
        },
        section_scores={
            "experience": round(section_score * 100, 1),
            "skills": round(kw_match_score * 100, 1),
            "impact": round((semantic_score * 0.7 + clarity_score * 0.3) * 100, 1)
        },
        keyword_metrics=keyword_metrics[:20]
    )

@app.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = resume_parser.parse_resume_to_text(content, file.filename)
        if not text or text.strip() == "":
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": kw_model is not None and sim_model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
