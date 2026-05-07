import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildSchemaPrompt } from '@/utils/promptBuilder';
import { validateAIResume, ATSType } from '@/types/resumeSchema';
import { determineExperienceLevel } from '@/utils/userProfileAnalyzer';
import { performControlledExpansion } from '@/utils/jdIntelligence';
import { ResumeData } from '@/types/resume';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

/**
 * Schema-First Resume Generation Endpoint
 * 
 * This endpoint uses strict JSON schema prompting to generate
 * high-quality, ATS-optimized resume content.
 */
export async function POST(req: NextRequest) {
    try {
        const {
            job_description,
            user_data,
            ats_type = 'generic',
            target_role
        } = await req.json();

        // Validate inputs
        if (!job_description) {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
        }

        if (!user_data || !user_data.name) {
            return NextResponse.json({ error: 'User data with name is required' }, { status: 400 });
        }

        if (!API_KEY || API_KEY === 'your_key_here' || API_KEY === '') {
            return NextResponse.json({
                error: 'API service not configured',
                details: 'Please set OPENROUTER_API_KEY (Requesty key) in your environment.'
            }, { status: 500 });
        }

        // 2. Structured JD Intelligence Layer (Role-First Architecture)
        let jdIntelligence = {
            role: target_role || "Software Engineer",
            domain: "Full Stack Engineer",
            stack: { languages: [], frameworks: [], databases: [], cloud: [], tools: [], concepts: [] },
            seniority: "Mid",
            industry: "Tech"
        };

        if (API_KEY && API_KEY !== 'your_key_here') {
            try {
                const extractionPrompt = `
                    Extract the primary technical elements from this job description.
                    Ignore general phrases, soft skills, and marketing fluff.

                    [TARGET DOMAINS]: Frontend Engineer, Backend Engineer, Full Stack Engineer, DevOps Engineer, ML Engineer, Data Engineer.

                    JOB DESCRIPTION:
                    "${job_description.substring(0, 2000)}"

                    OUTPUT JSON SCHEMA:
                    {
                      "role": "Specific Job Title",
                      "domain": "One of the [TARGET DOMAINS]",
                      "languages": [],
                      "frameworks": [],
                      "databases": [],
                      "cloud_platform": [],
                      "tools": [],
                      "concepts": ["Strictly technical like 'Microservices', 'REST APIs'"],
                      "seniority": "Junior/Mid/Senior/Lead"
                    }
                `;

                // Try Requesty extraction with fallback
                const extractModels = [...REQUESTY_CONFIG.models];
                let extractionRes = null;
                
                for (const model of extractModels) {
                    try {
                        extractionRes = await axios.post(
                            `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                            {
                                model: model,
                                messages: [{ role: 'user', content: extractionPrompt }],
                                response_format: { type: 'json_object' }
                            },
                            {
                                headers: getOpenRouterHeaders(API_KEY)
                            }
                        );
                        break;
                    } catch {
                        continue;
                    }
                }

                const rawIntel = extractionRes ? JSON.parse(extractionRes.data.choices[0].message.content) : {};
                jdIntelligence = {
                    role: rawIntel?.role || target_role || "Software Engineer",
                    domain: rawIntel?.domain || "Full Stack Engineer",
                    stack: {
                        languages: rawIntel.languages || [],
                        frameworks: rawIntel.frameworks || [],
                        databases: rawIntel.databases || [],
                        cloud: rawIntel.cloud_platform || [],
                        tools: rawIntel.tools || [],
                        concepts: rawIntel.concepts || []
                    },
                    seniority: rawIntel.seniority || "Mid",
                    industry: "Tech"
                };
            } catch (err) {
                console.error("Structured Extraction failed during generation:", err);
            }
        }

        // 3. Controlled Semantic Expansion
        const allStackElements = [
            ...jdIntelligence.stack.languages,
            ...jdIntelligence.stack.frameworks,
            ...jdIntelligence.stack.databases,
            ...jdIntelligence.stack.cloud,
            ...jdIntelligence.stack.tools,
            ...jdIntelligence.stack.concepts
        ];

        const expandedKeywords = performControlledExpansion(allStackElements, jdIntelligence.domain);

        // 4. Determine experience level
        const experienceLevel = determineExperienceLevel({
            experience: user_data.existing_experience || [],
            education: user_data.existing_education || [],
            projects: user_data.existing_projects || []
        } as any);

        // 5. Build schema-enforcing prompt
        const prompt = buildSchemaPrompt({
            jobDescription: job_description,
            userData: {
                name: user_data.name,
                currentRole: user_data.current_role,
                yearsExperience: user_data.years_experience,
                existingExperience: user_data.existing_experience,
                existingProjects: user_data.existing_projects,
                existingSkills: user_data.existing_skills,
                existingEducation: user_data.existing_education
            },
            experienceLevel,
            atsType: ats_type as ATSType,
            targetRole: jdIntelligence.role,
            jdIntelligence, // Pass structured data
            expandedKeywords // Pass expanded keywords
        });

        console.log('🎯 Generating schema-based resume for ATS:', ats_type);

        // Call Requesty with fallback models
        const models = [...REQUESTY_CONFIG.models];
        let aiResponse;
        let lastError;
        
        for (const model of models) {
            try {
                aiResponse = await axios.post(
                    `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                    {
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an ATS optimization engine that generates strictly valid JSON resume data.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.3,
                        max_tokens: 3500
                    },
                    {
                        headers: {
                            ...getOpenRouterHeaders(API_KEY),
                            'HTTP-Referer': 'https://atsense.ai',
                            'X-Title': 'ATSense Schema-First Resume Generator'
                        },
                        timeout: 60000
                    }
                );
                break;
            } catch (err: any) {
                console.warn(`Requesty model ${model} failed:`, err.message);
                lastError = err;
                continue;
            }
        }
        
        if (!aiResponse) {
            throw lastError || new Error('All Requesty models failed');
        }

        if (!aiResponse.data || !aiResponse.data.choices || !aiResponse.data.choices[0]) {
            throw new Error('Invalid response structure from OpenRouter');
        }

        const rawContent = aiResponse.data.choices[0].message.content;
        console.log('📄 Raw AI response length:', rawContent.length);

        // Parse JSON
        let generatedResume;
        try {
            generatedResume = JSON.parse(rawContent);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            return NextResponse.json({
                error: 'AI generated invalid JSON',
                details: 'The AI response could not be parsed. Please try again.',
                raw: rawContent.substring(0, 500)
            }, { status: 500 });
        }

        // Validate against schema
        const validation = validateAIResume(generatedResume);

        if (!validation.success) {
            console.error('❌ Schema validation failed:', validation.errors);
            return NextResponse.json({
                error: 'Generated resume does not meet quality standards',
                validation_errors: validation.errors,
                generated_data: generatedResume // Return for debugging
            }, { status: 422 });
        }

        console.log('✅ Schema validation passed');

        // Calculate quality metrics
        const qualityMetrics = calculateQualityMetrics(validation.data, ats_type as ATSType);

        return NextResponse.json({
            success: true,
            resume: validation.data,
            metadata: {
                ats_type,
                target_role,
                generation_timestamp: new Date().toISOString(),
                model: 'llama-3.3-70b-instruct',
                quality_metrics: qualityMetrics
            }
        });

    } catch (error: any) {
        console.error('❌ Resume generation error:', error.message);

        if (error.response?.status === 429) {
            return NextResponse.json({
                error: 'Rate limit exceeded. Please try again in a moment.'
            }, { status: 429 });
        }

        return NextResponse.json({
            error: 'Resume generation failed',
            details: error.response?.data?.error?.message || error.message
        }, { status: 500 });
    }
}

/**
 * Calculate quality metrics for generated resume
 */
function calculateQualityMetrics(resume: any, atsType: ATSType) {
    const metrics = {
        total_bullets: 0,
        bullets_with_metrics: 0,
        avg_bullet_length: 0,
        total_skills: 0,
        summary_word_count: 0,
        schema_compliance: 100
    };

    // Count bullets and check for metrics
    resume.experience?.forEach((exp: any) => {
        exp.bullets?.forEach((bullet: string) => {
            metrics.total_bullets++;
            const wordCount = bullet.trim().split(/\s+/).length;
            metrics.avg_bullet_length += wordCount;

            // Check for metrics (numbers, %, $)
            if (/\d+/.test(bullet) || /%|\$/.test(bullet)) {
                metrics.bullets_with_metrics++;
            }
        });
    });

    resume.projects?.forEach((proj: any) => {
        proj.bullets?.forEach((bullet: string) => {
            metrics.total_bullets++;
            const wordCount = bullet.trim().split(/\s+/).length;
            metrics.avg_bullet_length += wordCount;

            if (/\d+/.test(bullet) || /%|\$/.test(bullet)) {
                metrics.bullets_with_metrics++;
            }
        });
    });

    if (metrics.total_bullets > 0) {
        metrics.avg_bullet_length = Math.round(metrics.avg_bullet_length / metrics.total_bullets);
    }

    // Count skills
    resume.skills?.forEach((category: any) => {
        metrics.total_skills += category.skills?.length || 0;
    });

    // Summary word count
    if (resume.summary) {
        metrics.summary_word_count = resume.summary.trim().split(/\s+/).length;
    }

    return metrics;
}
