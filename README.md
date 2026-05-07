# 🚀 ATSense: The High-Performance Resume Engineering Engine

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![AI](https://img.shields.io/badge/AI-Generated-blueviolet?style=for-the-badge)

ATSense is not just a resume builder; it’s a **Career Engineering Platform**. It treats resumes as a structured data problem, ensuring that every bullet point, skill, and summary is mathematically optimized for Applicant Tracking Systems (ATS).

---

## 🧠 Core Intelligence Features

### 1. **Neural Optimization Engine (V2)**
Our core logic uses a "Strict No-Hallucination" policy. It doesn't invent fake jobs; it performs **Semantic Weaving** to integrate job-specific keywords into your *actual* history.
- **ATS Weighting Logic**: Prioritizes Role (35%), Core Tech (25%), Concepts (20%), and Action Phrases (15%).
- **Semantic Expansion**: Automatically suggests related tech (e.g., expanding "JavaScript" to "JavaScript ES6+" for modern JD matching).

### 2. **Multi-Signal ATS Detection**
Automatically detects which ATS a company is using (Workday, Greenhouse, Lever, etc.) based on the Job URL or description, and adjusts the PDF schema and keyword density to match that specific algorithm's preferences.

### 3. **Dynamic Experience Layouts**
- **Fresher Mode**: Automatically repositions Education and Projects to the top for entry-level candidates.
- **Professional Mode**: Focuses on high-impact metrics and multi-year job tenure.
- **Academic & Professional Blend**: Specially designed for students with internships.

### 4. **GitHub & LinkedIn Integration**
- **Skill Sync**: One-click extraction of your most-used languages from your GitHub profile.
- **Project Import**: Automatically builds technical project cards from your public repositories.

---

## 🛠️ The Tech Stack

### **Flagship Web (Frontend)**
- **Framework**: Next.js 14 (App Router)
- **State**: Zustand (Atomic state management for the JSON Resume Schema)
- **Styling**: Tailwind CSS + Framer Motion (Glassmorphism UI)
- **PDF Core**: Puppeteer-based headless rendering for 100% machine-readable exports.

### **Intelligence Engine (Backend)**
- **Language**: Python 3.10+ (FastAPI)
- **NLP**: `KeyBERT` for keyword extraction and `Sentence-Transformers` for vector similarity.
- **Models**: LLaMA 3.3-70B & GPT-4o-mini (via OpenRouter API).

---

## 🚀 Installation Guide

### **1. Prerequisites**
- Node.js (v18+)
- Python (v3.9+)
- OpenRouter API Key

### **2. Setup the Python Engine**
```bash
cd api
python3 -m venv venv
source venv/bin/activate  
Windows: venv\Scripts\activate

pip install -r requirements.txt  # If requirements.txt exists, or manual install:
pip install fastapi uvicorn keybert sentence-transformers spacy pydantic "urllib3<2"
python3 -m spacy download en_core_web_sm
python3 main.py
```
*The engine will run on `http://localhost:8001`.*

### **3. Setup the Web Flagship**
```bash
cd web
npm install
```

Create a `.env.local` in the `web` directory:
```env
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8001
```

```bash
npm run dev
```
*The portal will be available at `http://localhost:3000`.*

---

## 📖 How to Use (Step-by-Step for New Users)

### **Step 1: Onboarding**
- **Login/Register**: Create an account or use "Demo Login" (if enabled). We recommend linking your GitHub account during registration for automatic skill extraction.

### **Step 2: Sync the Target Job**
- Navigate to the **Editor**.
- On the left sidebar, paste the **Job Description** (or Job URL) you are targeting.
- Click **"Launch Analysis"**. The system will scan the JD and calculate your current score against it.

### **Step 3: Neural Optimization**
- Click **"Magic Optimization"**.
- Watch as the AI performs the "High-ATS" weighting, weaving specific phrases into your existing EXPERIENCE and SUMMARY sections.
- *Note*: It will never invent professional history. It only refines what you’ve provided.

### **Step 4: Real-Time Refinement**
- Use the **AI Writer** in the Summary tab to generate a targeted professional bio.
- Use the **Sparkles** icons on any bullet point to refine individual sentences using the **XYZ Formula** (Action Verb + Metric + Technical Implementation).

### **Step 5: Exporting**
- Once the **ATS Score Gauge** reaches 85%+, click **"Export PDF"**.
- The system will generate an **Engineered PDF** that is optimized for parsing by Workday, Greenhouse, and other top-tier systems.

---

## 📁 Project Structure

```text
├── api/                # Python NLP Intelligence Service
│   ├── main.py         # FastAPI Entry point
│   └── ...             # Semantic models and logic
├── web/                # Next.js Application
│   ├── src/
│   │   ├── app/        # Pages and API Routes
│   │   ├── components/ # UI Components (Editor, Preview, etc.)
│   │   ├── store/      # Zustand State (Resume JSON Schema)
│   │   └── utils/      # ATS Profiles, Prompts, and Logic
└── README.md
```

---

## 🚦 Troubleshooting

1. **"Neural Core Offline"**: Ensure the Python backend is running on port 8001. Check CORS settings in `api/main.py`.
2. **AI not responding**: Verify your `OPENROUTER_API_KEY` has active credits.
3. **Empty PDF**: Ensure `Puppeteer` is installed correctly (`npm install puppeteer`).

---

Built with ❤️ by **Solomon K**
*Engineering the future of career intelligence.*
