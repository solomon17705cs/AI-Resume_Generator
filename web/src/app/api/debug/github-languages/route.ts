import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const accessToken = req.cookies.get('github_access_token')?.value;
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!accessToken) {
        return NextResponse.json({ error: 'Not authenticated with GitHub' }, { status: 401 });
    }

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo parameter' }, { status: 400 });
    }

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        return NextResponse.json({
            success: true,
            languages: response.data,
            repo: `${owner}/${repo}`,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            error: "GitHub API error",
            status: error.response?.status,
            body: error.response?.data
        }, { status: error.response?.status || 500 });
    }
}
