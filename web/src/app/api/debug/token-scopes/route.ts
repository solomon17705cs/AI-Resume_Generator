import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const accessToken = req.cookies.get('github_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({
            status: 'error',
            isAuthenticated: false,
            isFullyAuthorized: false,
            grantedScopes: [],
            missingScopes: ['repo', 'read:user']
        }, { status: 200 }); // Return 200 to avoid Axios throwing in background diagnostic
    }

    try {
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        const grantedScopes = response.headers['x-oauth-scopes'];
        const requiredScopes = ['repo', 'read:user'];
        const currentScopes = grantedScopes ? grantedScopes.split(',').map((s: string) => s.trim()) : [];

        const missingScopes = requiredScopes.filter(s => !currentScopes.includes(s));

        return NextResponse.json({
            status: 'success',
            isAuthenticated: true,
            username: response.data.login,
            grantedScopes: currentScopes,
            missingScopes,
            isFullyAuthorized: missingScopes.length === 0,
            rawHeader: grantedScopes
        });
    } catch (error: any) {
        console.error('Debug Scopes Error:', error.message);
        return NextResponse.json({
            status: 'error',
            isAuthenticated: false, // Assume invalid token
            isFullyAuthorized: false,
            grantedScopes: [],
            missingScopes: ['repo', 'read:user'],
            error: error.message
        }, { status: 200 });
    }
}
