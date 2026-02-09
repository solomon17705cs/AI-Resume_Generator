import { NextResponse } from 'next/server';

export async function GET() {
    const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));

    // Clear the GitHub access token cookie
    response.cookies.set('github_access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0)
    });

    return response;
}
