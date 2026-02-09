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
                per_page: 20, // Limit to 20 for perf since we fetch languages
                type: 'owner'
            }
        });

        const repos = reposRes.data.filter((repo: any) => !repo.fork && !repo.archived);

        // DEMO MODE Logic
        const DEMO_MODE = process.env.DEMO_MODE === 'true';
        const demoData: Record<string, any[]> = {
            "AI-Resume_Generator": [
                { name: "TypeScript", percentage: 54.5 },
                { name: "SCSS", percentage: 22.4 },
                { name: "HTML", percentage: 14.9 },
                { name: "JavaScript", percentage: 8.2 }
            ],
            "JARVIS": [
                { name: "Python", percentage: 68.2 },
                { name: "JavaScript", percentage: 22.1 },
                { name: "HTML", percentage: 9.7 }
            ]
        };

        // Fetch detailed languages for each repo
        const reposWithLanguages = await Promise.all(repos.map(async (repo: any) => {
            // Check demo data first
            if (DEMO_MODE && demoData[repo.name]) {
                return {
                    id: repo.id,
                    name: repo.name,
                    description: repo.description,
                    languages: demoData[repo.name],
                    topics: repo.topics || [],
                    stars: repo.stargazers_count,
                    updated_at: repo.updated_at,
                    url: repo.html_url
                };
            }

            try {
                const langRes = await axios.get(repo.languages_url, {
                    headers: { Authorization: `token ${accessToken}` }
                });

                // Convert language bytes to percentage
                const totalBytes = Object.values(langRes.data).reduce((a: any, b: any) => a + b, 0) as number;
                const languages = Object.entries(langRes.data)
                    .map(([name, bytes]) => ({
                        name,
                        percentage: totalBytes > 0 ? (bytes as number / totalBytes) * 100 : 0
                    }))
                    .filter(lang => lang.percentage > 0.5) // Filter out noise
                    .sort((a, b) => b.percentage - a.percentage);

                return {
                    id: repo.id,
                    name: repo.name,
                    description: repo.description,
                    languages,
                    topics: repo.topics || [],
                    stars: repo.stargazers_count,
                    updated_at: repo.updated_at,
                    url: repo.html_url
                };
            } catch (err) {
                return {
                    id: repo.id,
                    name: repo.name,
                    description: repo.description,
                    languages: repo.language ? [{ name: repo.language, percentage: 100 }] : [],
                    topics: repo.topics || [],
                    stars: repo.stargazers_count,
                    updated_at: repo.updated_at,
                    url: repo.html_url
                };
            }
        }));

        return NextResponse.json(reposWithLanguages);
    } catch (error: any) {
        console.error('Fetch Repos Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}
