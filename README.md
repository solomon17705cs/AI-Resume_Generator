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

## 🚀 Installation & Setup

Follow these steps to get the full ATSense environment running on your local machine.

### 1. Intelligence Engine (Python Backend)
The backend handles semantic analysis, keyword extraction, and vector matching.

```bash
# Navigate to api directory
cd api

# Create a virtual environment
python3 -m venv venv

# Activate the environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install core dependencies
pip install fastapi uvicorn spacy keybert sentence-transformers pydantic "urllib3<2"

# Download the required NLP model
python3 -m spacy download en_core_web_sm

# Launch the engine (on port 8001)
python3 main.py
```

### 2. Web Flagship (Next.js Frontend)
The frontend manages the state, real-time preview, and AI-powered editing.

```bash
# Navigate to web directory
cd web

# Install npm packages
npm install

# Configure Environment Variables
# Create a .env.local file and add your keys:
# OPENROUTER_API_KEY=your_key_here
# PYTHON_API_URL=http://localhost:8001

# Start the development server
npm run dev
```

### 3. Usage & Access
*   **Web Portal**: [http://localhost:3000](http://localhost:3000)
*   **Editor**: [http://localhost:3000/editor](http://localhost:3000/editor)
*   **API Health**: [http://localhost:8001](http://localhost:8001)

---

## 🚦 Phase 2: Operations
1. Paste a Job Description in the **Sync Terminal**.
2. Click **"Launch Analysis"** to see your Match Forensics.
3. Use the **Sparkles (AI)** button on any bullet point to rewrite it using the XYZ Formula.
4. Export the resulting **Engineered PDF** for application.

---
Built by Solomon @ Y Hackathon 2026.
