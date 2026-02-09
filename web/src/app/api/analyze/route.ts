import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';

export async function POST(req: NextRequest) {
    try {
        const { resume_text, job_description, jd_url } = await req.json();

        // Detect ATS Profile
        const atsProfile = detectATS(jd_url || job_description);

        const response = await axios.post(`${PYTHON_API_URL}/analyze`, {
            resume_text,
            job_description,
            ats_profile: atsProfile
        });

        return NextResponse.json({
            ...response.data,
            ats_type: atsProfile.name,
            ats_profile: atsProfile
        });
    } catch (error: any) {
        console.error('Python API Error:', error.message);
        return NextResponse.json({ error: 'Deep Analysis Engine offline' }, { status: 503 });
    }
}
