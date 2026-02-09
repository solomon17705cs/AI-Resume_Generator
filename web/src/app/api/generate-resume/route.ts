import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildSchemaPrompt } from '@/utils/promptBuilder';
import { validateAIResume, ATSType } from '@/types/resumeSchema';

const API_KEY = (process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY || '').trim();

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
                error: 'AI service not configured',
                details: 'Please set OPENROUTER_API_KEY or LLAMA_API_KEY in your environment.'
            }, { status: 500 });
        }

        // Build schema-enforcing prompt
        const prompt = buildSchemaPrompt({
            jobDescription: job_description,
            userData: {
                name: user_data.name,
                currentRole: user_data.current_role,
                yearsExperience: user_data.years_experience,
                existingExperience: user_data.existing_experience,
                existingProjects: user_data.existing_projects,
                existingSkills: user_data.existing_skills
            },
            atsType: ats_type as ATSType,
            targetRole: target_role
        });

        console.log('🎯 Generating schema-based resume for ATS:', ats_type);

        // Call LLaMA 3.3-70B with JSON mode and timeout
        const aiResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'meta-llama/llama-3.3-70b-instruct',
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
                max_tokens: 3500 // Increased slightly
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://atsense.ai',
                    'X-Title': 'ATSense Schema-First Resume Generator'
                },
                timeout: 60000 // 60s timeout for complex generations
            }
        );

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
