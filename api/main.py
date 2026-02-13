from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Set, Tuple
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer, util
import uvicorn
import os
import re
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('tokenizers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

app = FastAPI(title="ATSense Advanced Semantic Engine")

# Advanced Models Cluster
kw_model = None
sim_model = None
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

CS_SEMANTIC_KEYWORDS = {
    'frontend': [
        'JavaScript Developer', 'Frontend Engineer', 'JavaScript ES6+', 'React', 'TypeScript',
        'Component-based architecture', 'State management', 'Responsive Design',
        'Performance optimization', 'Designed and implemented', 'Developed responsive UI'
    ],
    'backend': [
        'Node.js Developer', 'Backend Engineer', 'JavaScript ES6+', 'Node.js', 'RESTful APIs',
        'Microservices architecture', 'Database optimization', 'Scalable systems',
        'Architected backend services', 'Integrated API endpoints'
    ],
    'ml': [
        'ML Engineer', 'AI Developer', 'Python', 'PyTorch', 'TensorFlow',
        'Neural networks', 'Model training', 'Data preprocessing',
        'Engineered ML models', 'Optimized model performance'
    ],
    'generic': [
        'Software Engineer', 'Computer Science', 'Data structures', 'Algorithms',
        'System design', 'Code optimization', 'Object-oriented programming',
        'Engineered robust solutions', 'Implemented optimized algorithms'
    ]
}

def detect_role(jd: str) -> str:
    jd_lower = jd.lower()
    # Weighted scoring matching frontend logic
    scores = {
        'frontend': len(re.findall(r'frontend|react|angular|vue|css|html|ui|ux|web|accessibility|responsive', jd_lower)) * 1.5,
        'backend': len(re.findall(r'backend|node|express|django|flask|spring|sql|api|database|server|microservices|distributed', jd_lower)) * 1.5,
        'ml': len(re.findall(r'ml|ai|machine learning|deep learning|neural|data science|pytorch|tensorflow|computer vision|nlp', jd_lower)) * 2.0,
        'fullstack': len(re.findall(r'full stack|fullstack', jd_lower)) * 3.0
    }
    
    max_score = max(scores.values())
    if max_score == 0:
        return 'generic'
        
    if scores['fullstack'] == max_score or (scores['frontend'] > 3 and scores['backend'] > 3):
        return 'backend' # Score as backend for technical depth requirement
        
    max_role = max(scores, key=scores.get)
    return max_role

def get_models():
    global kw_model, sim_model
    if kw_model is None:
        try:
            kw_model = KeyBERT()
            sim_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Model error: {e}")
    return kw_model, sim_model

def lemmatize_text(text: str) -> str:
    """Convert text to lemmatized form for better matching."""
    try:
        tokens = word_tokenize(text.lower())
        lemmatized = [lemmatizer.lemmatize(token) for token in tokens if token.isalpha()]
        return ' '.join(lemmatized)
    except:
        return text.lower()

def find_semantic_matches(keyword: str, text: str, model) -> Tuple[bool, float]:
    """Find semantic matches of a keyword in text, not just exact matches."""
    try:
        # Direct substring match (fastest)
        if keyword.lower() in text.lower():
            return True, 1.0
        
        # Lemmatized match
        keyword_lemmatized = lemmatize_text(keyword)
        text_lemmatized = lemmatize_text(text)
        if keyword_lemmatized in text_lemmatized:
            return True, 0.9
        
        # Semantic embedding similarity
        kw_embedding = model.encode(keyword, convert_to_tensor=False)
        
        # Split text into sentences and find best match
        sentences = re.split(r'[.!?]+', text)
        best_score = 0.0
        
        for sentence in sentences:
            if len(sentence.strip()) > 10:
                sent_embedding = model.encode(sentence, convert_to_tensor=False)
                similarity = float(util.cos_sim(kw_embedding, sent_embedding)[0][0])
                if similarity > best_score:
                    best_score = similarity
        
        # Return True if semantic similarity is above threshold
        if best_score > 0.65:
            return True, min(0.85, best_score)
        
        return False, best_score
    except:
        return False, 0.0

def extract_technical_terms(text: str) -> Set[str]:
    """Extract technical terms, frameworks, tools, and acronyms."""
    technical_patterns = [
        r'\b(?:Python|JavaScript|TypeScript|Java|C\+\+|C#|Go|Rust|PHP|Ruby|Swift)\b',
        r'\b(?:React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|ASP\.NET)\b',
        r'\b(?:AWS|Azure|Google Cloud|GCP|Docker|Kubernetes|Git|Jenkins)\b',
        r'\b(?:REST|GraphQL|API|SQL|NoSQL|PostgreSQL|MongoDB|Redis)\b',
        r'\b(?:HTML|CSS|JSON|XML|YAML|UNIX|Linux|Windows)\b',
        r'\b[A-Z][A-Z]+\b',  # Acronyms
    ]
    
    found_terms = set()
    for pattern in technical_patterns:
        matches = re.findall(pattern, text)
        found_terms.update(matches)
    
    return found_terms

def improve_keyword_matching(keywords: List[str], resume_text: str, sim_model) -> Dict[str, Dict]:
    """Enhanced keyword matching with semantic understanding."""
    matches = {}
    
    for kw in keywords:
        kw_lower = kw.lower()
        
        # Try exact match first
        exact_count = len(re.findall(r'\b' + re.escape(kw_lower) + r'\b', resume_text.lower()))
        
        if exact_count > 0:
            matches[kw] = {
                'found': True,
                'count': exact_count,
                'confidence': 1.0,
                'method': 'exact'
            }
        else:
            # Try semantic match
            found, confidence = find_semantic_matches(kw, resume_text, sim_model)
            matches[kw] = {
                'found': found,
                'count': 1 if found else 0,
                'confidence': confidence,
                'method': 'semantic' if found else 'none'
            }
    
    return matches

def clean_keywords(keywords: List[str], text: str) -> List[str]:
    resume_text: str
    job_description: str
    ats_profile: Optional[Dict] = None

class KeywordMetadata(BaseModel):
    text: str
    found: bool
    priority: str # 'high', 'medium', 'low'
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
    if count >= 8: return "high"
    if count >= 3: return "medium"
    return "low"

def generate_sentence(kw: str, jd: str) -> str:
    # Heuristic to create a high-impact bullet point
    # In a real app, this could be an LLM call
    verbs = ["Led", "Engineered", "Optimized", "Developed", "Architected", "Spearheaded"]
    impacts = ["reducing inspection time by 30%", "improving system reliability by 25%", "resulting in a 40% efficiency gain", "delivering high-precision results for mission-critical missions"]
    import random
    return f"{random.choice(verbs)} {kw} implementation and evaluation, {random.choice(impacts)}."

def clean_keywords(keywords: List[str], text: str) -> List[str]:
    """
    Remove branding, company names, and broken phrases.
    Ensures semantic keywords are professional noun phrases.
    """
    cleaned = []
    # More aggressive blacklist for filler/marketing terms
    blacklist = {
        'planys', 'actively', 'hiring', 'globally', 'integrates', 'deep', 'brief', 
        'opportunity', 'join', 'company', 'mission', 'vision', 'located', 'office',
        'remote', 'hybrid', 'benefits', 'salary', 'competitive', 'equal', 'employer',
        'professional', 'passionate', 'dedicated', 'experienced', 'successfully',
        'strengthen', 'seamlessly', 'excellent', 'passionate', 'team', 'work', 
        'environment', 'dynamic', 'thrive', 'motivated', 'ability', 'capability'
    }
    # Words that should never be the start of a multi-word keyword unless it's a known tech
    broken_starts = {
        'development', 'builds', 'applications', 'working', 'using', 'leveraging', 
        'handling', 'managing', 'providing', 'excellent', 'strong', 'brief', 'integrated',
        'automation' # 'Automation' is often filler if it's 'automation seamlessly'
    }
    
    # Technical dictionary for positive reinforcement
    tech_stack = {
        'python', 'java', 'node', 'react', 'typescript', 'aws', 'docker', 'kubernetes',
        'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'spark', 'pytorch', 'tensorflow'
    }

    for kw in keywords:
        kw_clean = kw.lower().strip()
        words = kw_clean.split()
        
        # 1. Blacklist check
        if any(word in blacklist for word in words): continue
        if len(kw_clean) < 3 or kw_clean.isdigit(): continue
        
        # 2. Stop words at start/end
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'by', 'of', 'at', 'to', 'from', 'in', 'on', 'if', 'is', 'are', 'was', 'were', 'our', 'your'}
        if words[0] in stop_words or words[-1] in stop_words: continue
        
        # 3. Filter out generic "Verb + Adverb" or "Verb + Noun" that aren't technical
        # e.g. "automation seamlessly", "strengthen automation"
        if words[0] in broken_starts and len(words) < 3 and not (len(words) >= 2 and words[1] in tech_stack):
            continue
            
        # 4. Filter out very common filler phrases
        if 'integrates' in kw_clean or 'seamlessly' in kw_clean:
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
    jd_keywords_raw = kw_l.extract_keywords(request.job_description, keyphrase_ngram_range=(1, 3), stop_words='english', top_n=50)
    extracted_keywords = [kw[0] for kw in jd_keywords_raw]
    
    # Inject Domain Semantic Keywords
    role = detect_role(request.job_description)
    domain_keywords = CS_SEMANTIC_KEYWORDS.get(role, CS_SEMANTIC_KEYWORDS['generic'])
    
    # Mix extracted and domain keywords
    combined_keywords = list(dict.fromkeys(extracted_keywords + domain_keywords))
    jd_keywords = clean_keywords(combined_keywords, request.job_description)
    
    # Count frequencies and get context
    jd_lower = request.job_description.lower()
    resume_lower = request.resume_text.lower()
    
    keyword_metrics = []
    found_list = []
    missing_list = []

    for kw in jd_keywords:
        kw_lwr = kw.lower()
        count_jd = len(re.findall(r'\b' + re.escape(kw_lwr) + r'\b', jd_lower))
        count_resume = len(re.findall(r'\b' + re.escape(kw_lwr) + r'\b', resume_lower))
        
        context = ""
        idx = jd_lower.find(kw_lwr)
        if idx != -1:
            start = max(0, idx - 40)
            end = min(len(request.job_description), idx + len(kw) + 40)
            context = "..." + request.job_description[start:end].replace("\n", " ") + "..."

        found = count_resume > 0
        priority = get_priority(count_jd)
        
        metric = KeywordMetadata(
            text=kw,
            found=found,
            priority=priority,
            count_in_jd=count_jd,
            count_in_resume=count_resume,
            context=context,
            recommended_bullet=generate_sentence(kw, request.job_description) if not found else None
        )
        keyword_metrics.append(metric)
        
        if found:
            found_list.append(kw)
        else:
            missing_list.append(kw)

    # 1. Keyword Match (40%)
    high_priority_missing = [m for m in keyword_metrics if m.priority == "high" and not m.found]
    kw_raw_score = (len(found_list) / len(jd_keywords)) if jd_keywords else 1.0
    # Penalty for missing high priority
    kw_penalty = len(high_priority_missing) * 0.05
    kw_match_score = max(0.1, kw_raw_score - kw_penalty)

    # 2. Section Compliance (30%)
    standard_headers = ["experience", "education", "skills", "summary", "projects"]
    headers_found = [h for h in standard_headers if h in resume_lower]
    section_score = len(headers_found) / len(standard_headers)

    # 3. Semantic Relevance (20%)
    embeddings = sim_l.encode([request.resume_text, request.job_description])
    semantic_sim = float(util.cos_sim(embeddings[0], embeddings[1])[0][0])
    semantic_score = max(0.2, semantic_sim)

    # 4. Clarity & Recency (10%)
    words = re.findall(r'\w+', resume_lower)
    total_words = len(words)
    # Check for sentence length issues
    sentences = re.split(r'[.!?]+', request.resume_text)
    avg_sentence_len = total_words / len(sentences) if sentences else 0
    clarity_score = 1.0
    if avg_sentence_len > 25: clarity_score -= 0.3 # Too wordy
    if total_words > 1000: clarity_score -= 0.2 # Too long
    clarity_score = max(0.1, clarity_score)

    final_score = (
        (kw_match_score * 40) + 
        (section_score * 30) +
        (semantic_score * 20) +
        (clarity_score * 10)
    )
    
    suggestions = []
    if kw_match_score < 0.4:
        suggestions.append({"id": "kw-low", "type": "critical", "title": "Critical Keywords Missing", "message": f"Missing {len(missing_list)} key terms found in JD."})
    if section_score < 0.7:
        suggestions.append({"id": "structure-bad", "type": "warning", "title": "Poor Structure", "message": "Standard resume sections are missing or mislabeled."})

    return AnalysisResponse(
        score=round(float(final_score), 2),
        found_keywords=found_list,
        missing_keywords=missing_list,
        reasoning=f"Weighted analysis based on industry ATS standards. Keywords: {round(kw_match_score*100)}%, Section: {round(section_score*100)}%, Semantic: {round(semantic_score*100)}%.",
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
