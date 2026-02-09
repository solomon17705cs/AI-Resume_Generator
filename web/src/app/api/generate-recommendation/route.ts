import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { adminSummary, studentData, company, purpose } = await req.json();
        const api_key = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

        console.log('🤖 Recommendation Generation Tool triggered for:', studentData?.fullName);

        if (!api_key || api_key === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'AI API Key not configured. Please replace "your_key_here" in .env.local and restart the server.'
            }, { status: 500 });
        }

        if (!studentData?.fullName) {
            return NextResponse.json({
                error: 'Missing Context',
                message: 'Student profile data is incomplete. Please update your profile first.'
            }, { status: 400 });
        }

        const prompt = `
            You are a Career Admin at ATSense. Write a professional and highly credible recommendation letter for a student.
            
            Student Name: ${studentData.fullName}
            Target Company: ${company}
            Purpose: ${purpose}
            
            Admin's Context:
            "${adminSummary || 'The student is a high-performer with strong technical skills.'}"
            
            Student Resume Highlights:
            ${JSON.stringify(studentData, null, 2)}
            
            Guidelines:
            - Formal business tone.
            - Mention verification by ATSense AI Intelligence.
            - Highlight technical strengths.
            - Under 250 words.
            - IMPORTANT: Do NOT include a formal closing (e.g., "Sincerely," or "Regards,") as this will be added by the template automatically.
            - Output ONLY the letter body text.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense Recommendation Writer'
            },
            timeout: 30000 // 30s timeout
        });

        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error('Empty response from AI engine');
        }

        const letter = response.data.choices[0].message.content.trim();

        return NextResponse.json({
            success: true,
            letter
        });

    } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        console.error('❌ Recommendation Generation Error:', errorMessage);
        return NextResponse.json({
            error: 'Generation Failed',
            details: errorMessage
        }, { status: 500 });
    }
}
