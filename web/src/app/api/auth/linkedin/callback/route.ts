import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', req.url));
    }

    try {
        // Exchange code for token
        const tokenRes = await axios.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: process.env.LINKEDIN_CLIENT_ID as string,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET as string,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI as string,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenRes.data;

        // Fetch profile
        const userRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { name, picture } = userRes.data;

        const response = NextResponse.redirect(
            new URL(`/dashboard?github_linked=true&username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(picture)}`, req.url)
        );

        response.cookies.set('github_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
        return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
    }
}
