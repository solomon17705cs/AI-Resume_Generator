# 🚀 Feature Set Upgrade — Implementation Plan

This plan outlines the steps to upgrade **ATSense** with industry-grade features: Resume Import, Systematic Keyword Profiling, Skill Validation, and Fresher Optimization.

---

## 1️⃣ Import Existing Resume (Resume Improver Mode)
**Goal:** Allow users to upload their existing resumes and convert them into our structured JSON schema.

### 🏗 Architecture
1. **Frontend:** File upload `input` (accepts `.pdf`, `.docx`, `.txt`).
2. **Backend (Python):** 
   - New endpoint `/api/parse`
   - Libraries: `pdfplumber` (PDF), `python-docx` (DOCX).
3. **AI Layer:** Convert raw extracted text into structured JSON matching `ResumeData` interface using LLaMA/Claude.

### ✅ Action Items
- [ ] Install `pdfplumber` and `python-docx` in Python venv.
- [ ] Create `api/parser.py` with parsing logic for different file types.
- [ ] Add `/parse` endpoint to `api/main.py`.
- [ ] Create `web/src/app/api/parse/route.ts` as a proxy to the Python backend.
- [ ] Build `ImportModal.tsx` in the frontend.

---

## 2️⃣ Industry-Grade Keyword Engine
**Goal:** Systematic keyword matching based on role classification.

### 🧠 Logic
1. **Classify:** AI/Heuristics determine the job role (e.g., "DevOps Engineer").
2. **Retrieve:** Load a predefined "Keyword Bank" for that specific role.
3. **Merge:** Final keywords = `JD Keywords` + `Role Bank Keywords`.
4. **Evidence Match:** Cross-reference keywords against user's resume and GitHub.

### ✅ Action Items
- [ ] Create `api/data/keywords/` directory with JSON files for major roles.
- [ ] Refine `detect_role` in `api/main.py`.
- [ ] Update `/analyze` logic to include bank-based semantic keywords.

---

## 3️⃣ Strict Skill Validation (The Source of Truth)
**Goal:** Avoid AI hallucinations by restricting skills to verified evidence.

### 🛡 Rules
- **Rule:** If a skill is not in (Manual Resume Input + GitHub Repos + Imported Resume), the AI is forbidden to use it.
- **Validation:** Compare generated bullets against the "Evidence Buffer".

### ✅ Action Items
- [ ] Implement an `evidence` collection in the Zustand store.
- [ ] Update AI prompts in `/api/optimize` and `/api/optimize-full` to strictly enforce evidence-based skill usage.

---

## 4️⃣ Fresher Mode Optimization
**Goal:** Change scoring and strategy for users with < 1 year experience.

### ⚖️ New Weights (Fresher Mode)
| Section | Standard Weight | Fresher Weight |
|---------|-----------------|----------------|
| Experience | 40% | 10% |
| Projects | 20% | 40% |
| Skills | 20% | 35% |
| Education | 10% | 15% |

### ✅ Action Items
- [ ] Add `calculate_experience_years()` utility in the frontend.
- [ ] Add `isFresher` flag to `useResumeStore`.
- [ ] Update `ATSScoreGauge.tsx` and `ReasoningPanel.tsx` to reflect fresher-specific advice.
- [ ] Create a "Fresher" version of the AI prompt that focuses on technical depth and problem-solving over revenue/growth metrics.

---

## 📅 Timeline
- **Phase 1:** Resume Parsing & Import (The "Wow" Feature)
- **Phase 2:** Keyword Banks & Role Classification
- **Phase 3:** Fresher Mode & Strict Validation
