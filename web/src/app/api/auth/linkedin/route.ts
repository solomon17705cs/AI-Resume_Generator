import { NextResponse } from 'next/server';

export async function GET() {
    const rootUrl = 'https://www.linkedin.com/oauth/v2/authorization';
    const options = {
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID as string,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI as string,
        scope: 'openid profile email',
    };

    const qs = new URLSearchParams(options);
    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
