# 🚀 Schema-First Integration Guide

## Quick Start (5 Minutes)

### 1. Test the New Endpoint

```bash
curl -X POST http://localhost:3000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "We are looking for a Senior Backend Engineer with 5+ years of experience in Node.js, Python, and AWS. You will design scalable microservices and lead a team of 3-5 engineers.",
    "user_data": {
      "name": "John Doe",
      "current_role": "Software Engineer",
      "years_experience": 5
    },
    "ats_type": "greenhouse",
    "target_role": "Senior Backend Engineer"
  }'
```

### 2. Expected Response

```json
{
  "success": true,
  "resume": {
    "summary": "Senior Software Engineer with 5 years of experience specializing in Node.js, Python, and AWS cloud architecture...",
    "experience": [...],
    "projects": [...],
    "skills": [...]
  },
  "metadata": {
    "quality_metrics": {
      "total_bullets": 12,
      "bullets_with_metrics": 10,
      "avg_bullet_length": 22
    }
  }
}
```

---

## Integration with Existing Editor

### Option 1: Replace Current Generation

**File**: `/web/src/app/editor/page.tsx`

```typescript
// Add import
import { AIGeneratedResume } from '@/types/resumeSchema';

// Replace handleNeuralOptimize function
const handleSchemaGenerate = async () => {
  setOptimizing(true);
  
  try {
    const response = await fetch('/api/generate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_description: jobDescription,
        user_data: {
          name: resume.personalInfo.fullName,
          current_role: resume.experience[0]?.role,
          years_experience: calculateYearsExperience(resume.experience),
          existing_experience: resume.experience,
          existing_projects: resume.projects,
          existing_skills: resume.skills
        },
        ats_type: analysis?.ats_profile?.id || 'generic',
        target_role: targetRole
      })
    });

    const data = await response.json();

    if (data.success) {
      // Merge generated content with existing resume
      updateResume({
        summary: data.resume.summary,
        experience: mergeExperience(resume.experience, data.resume.experience),
        projects: data.resume.projects,
        skills: data.resume.skills
      });

      // Show quality metrics
      console.log('Quality Metrics:', data.metadata.quality_metrics);
    }
  } catch (error) {
    console.error('Generation failed:', error);
  } finally {
    setOptimizing(false);
  }
};
```

### Option 2: Add as New Feature

Add a new button in the editor:

```tsx
<button
  onClick={handleSchemaGenerate}
  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg"
>
  <Sparkles className="w-5 h-5 mr-2" />
  Generate with Schema AI
</button>
```

---

## Integration with Reactive Resume

### Step 1: Install Reactive Resume (if not already)

```bash
cd web
npm install @reactive-resume/schema @reactive-resume/utils
```

### Step 2: Convert Schema to Reactive Resume Format

**File**: `/web/src/utils/resumeConverter.ts`

```typescript
import { AIGeneratedResume } from '@/types/resumeSchema';

export function convertToReactiveResume(aiResume: AIGeneratedResume, personalInfo: any) {
  return {
    basics: {
      name: personalInfo.fullName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      url: personalInfo.website,
      summary: aiResume.summary
    },
    work: aiResume.experience.map(exp => ({
      name: exp.company,
      position: exp.title,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      summary: exp.bullets.join('\n')
    })),
    projects: aiResume.projects.map(proj => ({
      name: proj.name,
      description: proj.description,
      keywords: proj.technologies,
      url: proj.link,
      highlights: proj.bullets
    })),
    skills: aiResume.skills.map(cat => ({
      name: cat.name,
      keywords: cat.skills
    }))
  };
}
```

### Step 3: Render with Reactive Resume

```typescript
import { Resume } from '@reactive-resume/schema';
import { renderResume } from '@reactive-resume/utils';

const reactiveResumeData = convertToReactiveResume(aiResume, personalInfo);
const html = renderResume(reactiveResumeData, 'indeed-template');

// Send to PDF export
await fetch('/api/export-pdf', {
  method: 'POST',
  body: JSON.stringify({ html })
});
```

---

## Testing Checklist

### ✅ Schema Validation
- [ ] Test with valid data → Should return success
- [ ] Test with missing fields → Should return validation errors
- [ ] Test with bullets > 25 words → Should fail validation
- [ ] Test with summary > 60 words → Should fail validation

### ✅ ATS-Specific Generation
- [ ] Test Greenhouse → Should have metrics in bullets
- [ ] Test Workday → Should have formal language
- [ ] Test Zoho → Should have comprehensive skills
- [ ] Test Darwinbox → Should have ownership verbs

### ✅ Quality Metrics
- [ ] Check bullets_with_metrics → Should be 80%+
- [ ] Check avg_bullet_length → Should be 15-25
- [ ] Check total_skills → Should be 15-30

---

## Troubleshooting

### Issue: "AI generated invalid JSON"
**Solution**: Check the raw response in the error. The AI might be adding markdown formatting. Increase temperature if too rigid.

### Issue: "Schema validation failed"
**Solution**: Review validation_errors in response. Common issues:
- Bullets too long (> 25 words)
- Summary too long (> 60 words)
- Missing required fields

### Issue: "Rate limit exceeded"
**Solution**: Add retry logic with exponential backoff:

```typescript
async function generateWithRetry(data: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

---

## Performance Optimization

### 1. Cache Generated Resumes

```typescript
// Store in localStorage
const cacheKey = `resume_${jobDescriptionHash}_${atsType}`;
localStorage.setItem(cacheKey, JSON.stringify(generatedResume));

// Retrieve from cache
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

### 2. Stream Responses (Future)

```typescript
// Use streaming for real-time generation
const response = await fetch('/api/generate-resume', {
  method: 'POST',
  body: JSON.stringify(data)
});

const reader = response.body.getReader();
// Process chunks as they arrive
```

### 3. Parallel Generation

```typescript
// Generate summary and skills in parallel
const [summary, skills] = await Promise.all([
  fetch('/api/generate-summary', {...}),
  fetch('/api/extract-skills', {...})
]);
```

---

## Monitoring & Analytics

### Track Generation Success Rate

```typescript
// In /api/generate-resume/route.ts
const metrics = {
  total_requests: 0,
  successful_generations: 0,
  validation_failures: 0,
  ai_failures: 0
};

// Log to analytics service
analytics.track('resume_generated', {
  ats_type,
  quality_score: qualityMetrics.bullets_with_metrics / qualityMetrics.total_bullets,
  generation_time_ms: Date.now() - startTime
});
```

---

## Next Steps

1. **Test the endpoint** with the curl command above
2. **Integrate into editor** using Option 1 or 2
3. **Add quality metrics display** in the UI
4. **Connect to Reactive Resume** for rendering
5. **Deploy and monitor** success rates

---

**Need Help?**
- Check `SCHEMA_FIRST_ARCHITECTURE.md` for detailed docs
- Review `/types/resumeSchema.ts` for schema definitions
- See `/utils/promptBuilder.ts` for prompt examples

**Built by Solomon @ Y Hackathon 2026**
