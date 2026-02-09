# ATSense: Advanced Resume Intelligence (SaaS V1)

ATSense is a high-performance career engineering platform. Unlike simple builders, it treats resumes as **architectural data**, ensuring verified alignment with top-tier hiring algorithms.

## 🧠 Mission Core
- **Job-Driven**: Every optimization is synced to a specific Job Description.
- **Explainable AI**: No black-box scores. Every percentage is backed by a "Reasoning Report".
- **Versioned Intelligence**: History tracking for every role you apply for.

## 🛠️ The Advanced Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **State Management**: Zustand (Zustand) for real-time JSON resume state.
- **Backend intelligence**: 
  - **Node.js**: API Gateway & Puppeteer PDF Generation.
  - **Python (FastAPI)**: Semantic analysis via `sentence-transformers`, `KeyBERT`, and `spaCy`.
- **AI Orchestration**: 
  - **LLaMA 3.1 & Claude 3.5** (via OpenRouter) for intelligent bullet rewriting using the XYZ formula.

---

## 🏗️ Technical Architecture (Explain this to the Jury)

> "ATSense separates **Presentation** from **Intelligence**. 
> We store the resume as a structured JSON schema, which is sent to our Python NLP service. 
> This service calculates **Vector Similarity** between the resume and the Job Description, while our AI models perform **Impact Factoring** on individual bullet points. 
> The final PDF is not 'printed', but **engineered** via Puppeteer to be 100% machine-readable."

---

## � Deployment & Launch

### 1. The Brain (NLP API)
```bash
cd api
source venv/bin/activate
python main.py
```

### 2. The Core (Next.js Application)
```bash
cd web
npm install
npm run dev
```

---
Built by Solomon @ Y Hackathon 2026.
