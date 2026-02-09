import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';

export async function POST(req: NextRequest) {
    try {
        const { resume_text, job_description } = await req.json();

        const response = await axios.post(`${PYTHON_API_URL}/analyze`, {
            resume_text,
            job_description
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Python API Error:', error.message);
        return NextResponse.json({ error: 'Deep Analysis Engine offline' }, { status: 503 });
    }
}
