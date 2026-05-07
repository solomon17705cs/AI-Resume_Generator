import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';
const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Send to Python for Text Extraction
        const pythonFormData = new FormData();
        pythonFormData.append('file', file);

        const pythonResponse = await axios.post(`${PYTHON_API_URL}/parse`, pythonFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const rawText = pythonResponse.data.text;

        if (!rawText) {
            return NextResponse.json({ error: 'Failed to extract text from resume' }, { status: 500 });
        }

        // 2. Use AI to Structure the Text
        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({
                error: 'AI Structuring unavailable',
                rawText
            }, { status: 200 });
        }

        const prompt = `
            You are an expert Resume Data Architect. 
            Your task is to convert raw extracted text from a resume into a perfectly structured JSON object.

            [STRICT SCHEMA RULES]
            Return ONLY a JSON object that follows this structure:
            {
              "summary": "A professional summary (max 150 words)",
              "experience": [
                {
                  "company": "Company Name",
                  "role": "Job Title",
                  "location": "City, State",
                  "startDate": "YYYY-MM",
                  "endDate": "YYYY-MM or Present",
                  "bullets": ["Bullet point 1", "Bullet point 2"]
                }
              ],
              "projects": [
                {
                  "name": "Project Name",
                  "description": "Short description (max 30 words)",
                  "technologies": ["Tech 1", "Tech 2"],
                  "bullets": ["Bullet showing impact"]
                }
              ],
              "skills": [
                { "name": "Category (e.g. Languages)", "skills": ["Skill 1", "Skill 2"] }
              ],
              "education": [
                {
                  "institution": "University Name",
                  "degree": "Degree Name",
                  "location": "City, State",
                  "graduationDate": "YYYY"
                }
              ],
              "personalInfo": {
                "fullName": "Name",
                "email": "Email",
                "phone": "Phone",
                "location": "City, State",
                "linkedin": "url",
                "github": "url"
              }
            }

            [RULES]
            1. Use third person for bullets.
            2. If dates are missing, use "2020-01" as a placeholder.
            3. Ensure "skills" are categorized logically.
            4. If projects are found, extract them.
            5. Return ONLY the JSON object. No other text.

            RAW RESUME TEXT:
            """
            ${rawText}
            """
        `;

        // Use Requesty for structuring with fallback
        const parseModels = [...REQUESTY_CONFIG.models];
        let structuredData;
        
        for (const model of parseModels) {
            try {
                const aiResponse = await axios.post(
                    `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                    {
                        model: model,
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' },
                        temperature: 0.1
                    },
                    {
                        headers: {
                            ...getOpenRouterHeaders(API_KEY),
                            'HTTP-Referer': 'https://atsense.ai',
                            'X-Title': 'ATSense Resume Parser'
                        }
                    }
                );
                structuredData = JSON.parse(aiResponse.data.choices[0].message.content);
                break;
            } catch {
                continue;
            }
        }

        if (!structuredData) {
            return NextResponse.json({
                error: 'All AI models failed',
                rawText
            }, { status: 503 });
        }

        return NextResponse.json(structuredData);

    } catch (error: any) {
        console.error('Resume Parse Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: 'Failed to parse resume',
            details: error.response?.data || error.message
        }, { status: 500 });
    }
}
