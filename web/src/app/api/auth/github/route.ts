import { NextResponse } from 'next/server';

export async function GET() {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`;

    console.log("SURGICAL DEBUG - CLIENT ID:", CLIENT_ID);
    console.log("SURGICAL DEBUG - REDIRECT URI:", REDIRECT_URI);

    if (!CLIENT_ID || CLIENT_ID === 'your_actual_client_id_here' || CLIENT_ID === 'GET_FROM_GITHUB') {
        return NextResponse.json({
            error: "GITHUB_CLIENT_ID is not configured correctly in .env.local",
            current_value: CLIENT_ID || "UNDEFINED",
            env_keys_found: Object.keys(process.env).filter(k => k.includes('GITHUB'))
        }, { status: 500 });
    }

    const scope = encodeURIComponent('read:user repo');
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    return NextResponse.redirect(githubUrl);
}
