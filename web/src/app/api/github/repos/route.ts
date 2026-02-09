import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const accessToken = req.cookies.get('github_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Not authenticated with GitHub' }, { status: 401 });
    }

    try {
        const reposRes = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `token ${accessToken}` },
            params: {
                sort: 'updated',
                per_page: 50,
                type: 'owner'
            }
        });

        const cleanRepos = reposRes.data
            .filter((repo: any) => !repo.fork && !repo.archived)
            .map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                updated_at: repo.updated_at,
                url: repo.html_url
            }));

        return NextResponse.json(cleanRepos);
    } catch (error: any) {
        console.error('Fetch Repos Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}
