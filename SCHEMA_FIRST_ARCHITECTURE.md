# Schema-First Resume Generation Architecture

## 🎯 **The Problem We Solved**

### Before (Free-Form Generation)
```
User Input → AI → "Generate a resume" → Unstructured Text → Poor Quality
```

**Issues:**
- ❌ No structure enforcement
- ❌ Inconsistent quality
- ❌ Weak ATS optimization
- ❌ Verbose, unfocused content

### After (Schema-First Generation)
```
User Data + JD + ATS Profile → AI with JSON Schema → Structured JSON → Validation → High Quality
```

**Benefits:**
- ✅ Strict structure enforcement
- ✅ Consistent quality
- ✅ ATS-specific optimization
- ✅ Concise, metric-driven content

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input Layer                         │
│  • Job Description                                          │
│  • User Data (name, experience, projects, skills)          │
│  • ATS Type (Greenhouse, Workday, etc.)                    │
│  • Target Role                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Prompt Builder Layer                       │
│  • buildSchemaPrompt() - Enforces JSON schema               │
│  • Injects ATS-specific rules                               │
│  • Adds quality constraints (word limits, metrics)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   AI Generation Layer                       │
│  • LLaMA 3.3-70B Instruct                                   │
│  • JSON mode (response_format: json_object)                 │
│  • Temperature: 0.3 (consistent structure)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Validation Layer (Zod)                     │
│  • AIGeneratedResumeSchema                                  │
│  • Checks: word limits, structure, required fields          │
│  • Returns: success + data OR errors                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Quality Metrics Layer                      │
│  • Count bullets with metrics                               │
│  • Calculate average bullet length                          │
│  • Verify keyword density                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Rendering Layer                            │
│  • Reactive Resume (or custom renderer)                     │
│  • ATS-safe HTML/PDF export                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 **JSON Schema Definition**

### Core Schema Structure

```typescript
{
  summary: string,              // Max 60 words, third person
  experience: [
    {
      title: string,            // Job title
      company: string,          // Company name
      location: string,         // Optional
      startDate: "YYYY-MM",     // ISO format
      endDate: "YYYY-MM" | "Present",
      bullets: [
        string                  // Max 25 words, starts with action verb
      ]
    }
  ],
  projects: [
    {
      name: string,
      description: string,      // Max 30 words
      technologies: string[],   // Min 2
      link: string,             // URL or empty
      bullets: string[]         // Max 25 words each
    }
  ],
  skills: [
    {
      name: string,             // Category name
      skills: string[]          // Min 3 per category
    }
  ]
}
```

### Validation Rules (Zod)

| Field | Rule | Reason |
|-------|------|--------|
| **Bullet** | ≤ 25 words | ATS readability |
| **Bullet** | Starts with capital | Action verb requirement |
| **Bullet** | No ellipsis (...) | Be specific |
| **Summary** | ≤ 60 words | Conciseness |
| **Summary** | Third person | Professional tone |
| **Project Desc** | ≤ 30 words | Brevity |
| **Skills** | ≥ 3 per category | Completeness |
| **Dates** | YYYY-MM format | ATS parsing |

---

## 🎯 **ATS-Specific Generation Rules**

### Greenhouse (Tech Startups)
```typescript
{
  bulletStyle: "action verb + technology + metric",
  keywordDensity: "3-4%",
  maxBulletWords: 25,
  requireMetrics: true,
  sectionOrder: ["summary", "experience", "projects", "skills"]
}
```

**Example Bullet:**
> "Developed RESTful APIs using Node.js and PostgreSQL, reducing response latency by 28%"

### Workday (Fortune 500)
```typescript
{
  bulletStyle: "formal language + exact matches",
  keywordDensity: "4-5%",
  maxBulletWords: 30,
  requireMetrics: false,
  sectionOrder: ["summary", "experience", "skills", "projects"]
}
```

**Example Bullet:**
> "Senior Software Engineer responsible for architecting enterprise-scale microservices infrastructure using Java Spring Boot and AWS"

### Zoho Recruit (SMBs)
```typescript
{
  bulletStyle: "technology-heavy + comprehensive",
  keywordDensity: "5-6%",
  maxBulletWords: 35,
  requireMetrics: false,
  sectionOrder: ["skills", "experience", "projects"]
}
```

**Example Bullet:**
> "Built full-stack web applications using React, Redux, Node.js, Express, MongoDB, AWS EC2, S3, Lambda, and Docker for containerization"

### Darwinbox (Asia/Middle East)
```typescript
{
  bulletStyle: "ownership verbs + team size + impact",
  keywordDensity: "3-4%",
  maxBulletWords: 28,
  requireMetrics: true,
  sectionOrder: ["summary", "experience", "skills", "projects"]
}
```

**Example Bullet:**
> "Owned backend architecture for 5M+ users, leading team of 4 engineers, improving system uptime from 95% to 99.9%"

### Lever (Developer-Focused)
```typescript
{
  bulletStyle: "concise technical + GitHub links",
  keywordDensity: "2-3%",
  maxBulletWords: 20,
  requireMetrics: true,
  sectionOrder: ["projects", "experience", "skills"]
}
```

**Example Bullet:**
> "Built real-time chat using WebSockets, Redis pub/sub, handling 10K concurrent users"

---

## 🔧 **Implementation Files**

### 1. Schema Definition (`/types/resumeSchema.ts`)
- **Purpose**: Zod schemas for validation
- **Exports**: 
  - `AIGeneratedResumeSchema`
  - `validateAIResume()`
  - `ATSGenerationRules`

### 2. Prompt Builder (`/utils/promptBuilder.ts`)
- **Purpose**: Build structured prompts
- **Functions**:
  - `buildSchemaPrompt()` - Full resume generation
  - `buildBulletOptimizationPrompt()` - Single bullet
  - `buildSummaryPrompt()` - Professional summary
  - `buildSkillExtractionPrompt()` - Skill extraction

### 3. API Endpoint (`/api/generate-resume/route.ts`)
- **Purpose**: Schema-first generation endpoint
- **Flow**:
  1. Validate inputs
  2. Build prompt
  3. Call LLaMA 3.3-70B
  4. Parse JSON
  5. Validate schema
  6. Calculate metrics
  7. Return structured data

---

## 📊 **Quality Metrics**

The system calculates these metrics for every generated resume:

| Metric | Description | Target |
|--------|-------------|--------|
| **total_bullets** | Number of bullet points | 8-15 |
| **bullets_with_metrics** | Bullets containing numbers/% | 80%+ |
| **avg_bullet_length** | Average words per bullet | 15-25 |
| **total_skills** | Number of skills listed | 15-30 |
| **summary_word_count** | Words in summary | 40-60 |
| **schema_compliance** | Validation score | 100% |

---

## 🚀 **API Usage**

### Request
```typescript
POST /api/generate-resume

{
  "job_description": "We're looking for a Senior Backend Engineer...",
  "user_data": {
    "name": "John Doe",
    "current_role": "Software Engineer",
    "years_experience": 5,
    "existing_experience": [...],  // Optional
    "existing_projects": [...],    // Optional
    "existing_skills": [...]       // Optional
  },
  "ats_type": "greenhouse",        // or workday, zoho, darwinbox, lever
  "target_role": "Senior Backend Engineer"
}
```

### Response (Success)
```typescript
{
  "success": true,
  "resume": {
    "summary": "Senior Software Engineer with 5 years...",
    "experience": [...],
    "projects": [...],
    "skills": [...]
  },
  "metadata": {
    "ats_type": "greenhouse",
    "target_role": "Senior Backend Engineer",
    "generation_timestamp": "2026-02-10T03:53:10Z",
    "model": "llama-3.3-70b-instruct",
    "quality_metrics": {
      "total_bullets": 12,
      "bullets_with_metrics": 10,
      "avg_bullet_length": 22,
      "total_skills": 24,
      "summary_word_count": 58,
      "schema_compliance": 100
    }
  }
}
```

### Response (Validation Error)
```typescript
{
  "error": "Generated resume does not meet quality standards",
  "validation_errors": [
    "experience.0.bullets.2: Bullet must be ≤ 25 words",
    "summary: Summary must be ≤ 60 words"
  ],
  "generated_data": {...}  // For debugging
}
```

---

## 🎬 **Demo Flow for Judges**

### Step 1: Show the Problem
> "Traditional resume builders generate free-form text. This leads to inconsistent quality and poor ATS optimization."

### Step 2: Introduce Schema-First Approach
> "We enforce a strict JSON schema that guarantees structure and quality. The AI can't generate bad content—it's validated before reaching the user."

### Step 3: Show ATS-Specific Rules
> "Each ATS has different preferences. Greenhouse wants metrics, Workday wants exact matches, Zoho wants comprehensive skills. We apply the right rules automatically."

### Step 4: Live Demo
1. Paste job description
2. Select ATS type (Greenhouse)
3. Click "Generate Resume"
4. Show validation passing
5. Show quality metrics (10/12 bullets have metrics, avg 22 words)
6. Show rendered resume

### Step 5: Explain Architecture
> "We separate intelligence from presentation. AI generates structured data, Reactive Resume handles rendering. This guarantees both ATS compatibility and visual quality."

---

## 🏆 **Competitive Advantages**

| Feature | ATSense | Resume.io | Jobscan | Rezi |
|---------|---------|-----------|---------|------|
| **Schema Validation** | ✅ Zod | ❌ No | ❌ No | ❌ No |
| **ATS-Specific Rules** | ✅ 6 profiles | ❌ Generic | ⚠️ Basic | ❌ Generic |
| **Quality Metrics** | ✅ 6 metrics | ❌ No | ⚠️ Basic | ❌ No |
| **JSON Mode** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Validation Errors** | ✅ Detailed | ❌ No | ❌ No | ❌ No |

---

## 📝 **Key Talking Points for Judges**

### ✅ **DO SAY:**
- "Schema-first architecture"
- "Strict validation with Zod"
- "ATS-specific generation rules"
- "Separation of intelligence and presentation"
- "Quality metrics for every resume"

### ❌ **DON'T SAY:**
- "AI magically generates perfect resumes"
- "100% guaranteed quality"
- "No human review needed"

---

## 🔮 **Future Enhancements**

### High Priority
1. **Iterative Refinement**: If validation fails, auto-retry with stricter prompt
2. **Bullet Scoring**: Score each bullet individually (0-100)
3. **Keyword Highlighting**: Show which keywords were successfully integrated
4. **A/B Testing**: Generate 2 versions, let user choose

### Medium Priority
5. **Custom Templates**: User-defined bullet styles
6. **Industry-Specific Rules**: Finance vs Tech vs Healthcare
7. **Multi-Language Support**: Generate in Spanish, French, etc.
8. **Export to JSON Resume**: jsonresume.org format

---

## 🎓 **Educational Value**

This implementation demonstrates:
- **Prompt Engineering**: Schema-enforcing prompts
- **Data Validation**: Zod for runtime type safety
- **Quality Assurance**: Automated metrics calculation
- **Separation of Concerns**: Intelligence vs Presentation
- **Error Handling**: Graceful degradation with detailed errors

---

## 📈 **Success Metrics**

### Technical
- ✅ 100% schema compliance (enforced by Zod)
- ✅ 350+ lines of schema/prompt code
- ✅ 6 ATS-specific rule sets
- ✅ 6 quality metrics calculated

### Business
- ✅ Consistent quality across all generations
- ✅ Defensible architecture (schema-first)
- ✅ Scalable (add new ATS profiles easily)
- ✅ Enterprise-grade (validation + metrics)

### User Experience
- ✅ Predictable output quality
- ✅ Transparent validation errors
- ✅ ATS-specific optimization
- ✅ Metric-driven improvements

---

**Built by Solomon @ Y Hackathon 2026**  
*This is how enterprise AI systems are built.*
