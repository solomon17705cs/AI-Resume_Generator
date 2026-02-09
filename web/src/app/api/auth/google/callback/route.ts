import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', req.url));
    }

    try {
        // Exchange code for tokens
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenRes.data;

        // Fetch user info
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { name, picture, email } = userRes.data;

        // Redirect to dashboard with data
        const response = NextResponse.redirect(
            new URL(`/dashboard?github_linked=true&username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(picture)}`, req.url)
        );

        // Standard session cookie (mocking github one for compatibility with current store logic)
        response.cookies.set('github_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Google OAuth Error:', error.response?.data || error.message);
        return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
    }
}
