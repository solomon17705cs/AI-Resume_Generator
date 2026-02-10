import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard?error=no_code', req.url));
    }

    try {
        // Exchange code for access token
        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: 'application/json' } }
        );

        const accessToken = tokenRes.data.access_token;

        if (!accessToken) {
            throw new Error('Failed to obtain access token');
        }

        // Fetch GitHub user info
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });

        const githubUsername = userRes.data.login;
        const githubAvatar = userRes.data.avatar_url;

        // Redirect back to dashboard with status
        const response = NextResponse.redirect(new URL(`/dashboard?github_linked=true&username=${githubUsername}&avatar=${encodeURIComponent(githubAvatar)}`, req.url));

        // Store access token in cookie
        console.log('✅ Setting github_access_token cookie');
        response.cookies.set('github_access_token', accessToken, {
            httpOnly: true,
            secure: false,  // Set to false for development, true in production
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30  // 30 days
        });

        return response;
    } catch (error: any) {
        console.error('GitHub OAuth Error:', error.message);
        return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', req.url));
    }
}
