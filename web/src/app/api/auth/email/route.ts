import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        // Mock a login: just take the username from email
        const username = email.split('@')[0];
        const dummyAvatar = `https://ui-avatars.com/api/?name=${username}&background=random`;

        const response = NextResponse.json({ success: true, username, avatar: dummyAvatar });

        // Set a dummy cookie
        response.cookies.set('github_access_token', 'mock_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process login' }, { status: 500 });
    }
}
