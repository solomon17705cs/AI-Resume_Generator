import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ResumeData } from '@/types/resume';

/**
 * Renders a fully self-contained HTML document that exactly mirrors the
 * Preview component layout. All styles are inlined — Puppeteer never
 * needs external CSS or fonts from the running dev server.
 */
function buildResumeHTML(resume: ResumeData): string {
    const { personalInfo, summary, experience, projects, achievements, skills, education } = resume;

    const hasProjects = (projects || []).some(p => p.name?.trim() && !p.name.includes('['));
    const hasExperience = (experience || []).some(e => e.company?.trim() && !e.company.includes('['));
    const isFresher = !hasProjects;
    const isEntryLevel = !hasExperience;

    const esc = (s: string | undefined | null) =>
        (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const sectionTitle = (title: string) => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;margin-top:0;">
            <h2 style="font-size:9.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.18em;color:#0f172a;white-space:nowrap;margin:0;padding:0;">${esc(title)}</h2>
            <div style="height:1.5px;flex:1;background:#e2e8f0;"></div>
        </div>`;

    const header = `
        <header style="text-align:center;margin-bottom:22px;">
            <h1 style="font-size:26pt;font-weight:900;text-transform:uppercase;letter-spacing:-0.03em;color:#020617;margin:0 0 6px;padding:0;">${esc(personalInfo.fullName) || 'YOUR NAME'}</h1>
            <div style="font-size:9pt;display:flex;flex-wrap:wrap;justify-content:center;gap:3px 18px;color:#475569;font-weight:600;letter-spacing:0.05em;margin-bottom:4px;">
                ${personalInfo.email ? `<span style="text-transform:lowercase;font-weight:500;">${esc(personalInfo.email)}</span>` : ''}
                ${personalInfo.phone ? `<span>${esc(personalInfo.phone)}</span>` : ''}
                ${personalInfo.location ? `<span>${esc(personalInfo.location)}</span>` : ''}
            </div>
            <div style="font-size:8.5pt;display:flex;flex-wrap:wrap;justify-content:center;gap:3px 14px;color:#1d4ed8;font-weight:700;">
                ${personalInfo.linkedin ? `<span>${esc(personalInfo.linkedin)}</span>` : ''}
                ${personalInfo.github ? `<span>${esc(personalInfo.github)}</span>` : ''}
                ${personalInfo.website ? `<span>${esc(personalInfo.website)}</span>` : ''}
            </div>
        </header>`;

    const summarySection = `
        <section style="margin-bottom:18px;">
            ${sectionTitle('Executive Summary')}
            <p style="font-size:${isEntryLevel ? '10pt' : '9.5pt'};line-height:${isEntryLevel ? '1.75' : '1.6'};text-align:justify;font-weight:500;color:${summary ? '#1e293b' : '#94a3b8'};margin:0;${summary ? '' : 'font-style:italic;'}">
                ${esc(summary) || '[Write a brief high-impact summary here.]'}
            </p>
        </section>`;

    const educationSection = `
        <section style="margin-bottom:18px;">
            ${sectionTitle('Education')}
            <div style="display:flex;flex-direction:column;gap:7px;">
                ${(education || []).map(edu => `
                    <div style="display:flex;justify-content:space-between;align-items:baseline;">
                        <div style="font-size:9.5pt;">
                            <span style="font-weight:900;color:#0f172a;">${esc(edu.institution)}</span>
                            <span style="margin:0 5px;color:#94a3b8;">|</span>
                            <span style="font-weight:700;font-style:italic;color:#334155;">${esc(edu.degree)}</span>
                            ${edu.location ? `<span style="margin:0 5px;color:#94a3b8;">·</span><span style="color:#64748b;font-size:8.5pt;">${esc(edu.location)}</span>` : ''}
                        </div>
                        <span style="font-size:8.5pt;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;">${esc(edu.graduationDate)}</span>
                    </div>`).join('')}
            </div>
        </section>`;

    const experienceSection = `
        <section style="margin-bottom:18px;">
            ${sectionTitle(isFresher ? 'Academic & Professional Experience' : 'Professional Experience')}
            <div style="display:flex;flex-direction:column;gap:16px;">
                ${(experience || []).filter(e => e.company?.trim() && !e.company.includes('[')).map(exp => `
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
                            <h3 style="font-size:10.5pt;font-weight:900;color:#0f172a;letter-spacing:-0.01em;margin:0;padding:0;">${esc(exp.company)}</h3>
                            <span style="font-size:8.5pt;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">${esc(exp.location)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;">
                            <span style="font-size:9.5pt;font-weight:700;color:#1d4ed8;font-style:italic;">${esc(exp.role)}</span>
                            <span style="font-size:8.5pt;font-weight:700;color:#334155;">${esc(exp.startDate)} – ${esc(exp.endDate)}</span>
                        </div>
                        <ul style="margin:0;padding-left:14px;">
                            ${(exp.bullets || []).filter(b => b?.trim()).map(b =>
                                `<li style="font-size:9pt;line-height:1.45;font-weight:500;color:#1e293b;padding-left:3px;margin-bottom:3px;">${esc(b)}</li>`
                            ).join('')}
                        </ul>
                    </div>`).join('')}
            </div>
        </section>`;

    const projectsSection = `
        <section style="margin-bottom:18px;">
            ${sectionTitle('Technical Projects')}
            <div style="display:flex;flex-direction:column;gap:13px;">
                ${(projects || []).filter(p => p.name?.trim() && !p.name.includes('[')).map(proj => `
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
                            <h3 style="font-size:9.5pt;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;margin:0;padding:0;">${esc(proj.name)}</h3>
                            ${proj.link ? `<span style="font-size:8pt;font-weight:700;color:#1d4ed8;font-style:italic;">${esc(proj.link)}</span>` : ''}
                        </div>
                        ${(proj.technologies || []).length > 0 ? `
                        <div style="margin-bottom:4px;">
                            <span style="font-size:8.5pt;color:#64748b;font-weight:600;">${proj.technologies.map(esc).join(' · ')}</span>
                        </div>` : ''}
                        <ul style="margin:0;padding-left:14px;">
                            ${(proj.bullets || []).filter(b => b?.trim()).map(b =>
                                `<li style="font-size:9pt;line-height:1.4;font-weight:500;color:#334155;padding-left:3px;margin-bottom:3px;">${esc(b)}</li>`
                            ).join('')}
                        </ul>
                    </div>`).join('')}
            </div>
        </section>`;

    const achievementsSection = `
        <section style="margin-bottom:18px;">
            ${sectionTitle('Achievements & Awards')}
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${(achievements || []).filter(a => a.title?.trim()).map(ach => `
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                        <div style="flex:1;">
                            <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-bottom:2px;">
                                <span style="font-size:9.5pt;font-weight:900;color:#0f172a;">${esc(ach.title)}</span>
                                ${ach.issuer ? `<span style="color:#94a3b8;font-size:8.5pt;">·</span><span style="font-size:8.5pt;font-weight:700;color:#1d4ed8;font-style:italic;">${esc(ach.issuer)}</span>` : ''}
                            </div>
                            ${ach.description ? `<p style="font-size:8.5pt;font-weight:500;color:#334155;line-height:1.5;margin:0;">${esc(ach.description)}</p>` : ''}
                        </div>
                        ${ach.date ? `<span style="font-size:8.5pt;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;">${esc(ach.date)}</span>` : ''}
                    </div>`).join('')}
            </div>
        </section>`;

    const skillsSection = `
        <section style="margin-bottom:18px;">
            ${sectionTitle('Technical Matrix')}
            <div style="display:flex;flex-direction:column;gap:5px;">
                ${(skills || []).filter(c => (c.skills || []).some(s => s?.trim())).map(cat => `
                    <div style="font-size:9pt;line-height:1.5;">
                        <span style="font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:#0f172a;margin-right:5px;">${esc(cat.name)}:</span>
                        <span style="font-weight:500;color:#1e293b;">${(cat.skills || []).filter(s => s?.trim()).map(esc).join(', ')}</span>
                    </div>`).join('')}
            </div>
        </section>`;

    /* Mirror Preview.tsx section ordering */
    let bodySections = '';
    if (isEntryLevel) {
        bodySections = summarySection + educationSection +
            (hasProjects ? projectsSection : '') +
            (achievements && achievements.some(a => a.title?.trim()) ? achievementsSection : '') +
            skillsSection;
    } else if (isFresher) {
        bodySections = summarySection + educationSection + experienceSection +
            (hasProjects ? projectsSection : '') +
            (achievements && achievements.some(a => a.title?.trim()) ? achievementsSection : '') +
            skillsSection;
    } else {
        bodySections = summarySection + experienceSection +
            (hasProjects ? projectsSection : '') +
            (achievements && achievements.some(a => a.title?.trim()) ? achievementsSection : '') +
            skillsSection + educationSection;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Resume – ${esc(personalInfo.fullName)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10pt;
    color: #1e293b;
    background: #fff;
    padding: 0;
    margin: 0;
  }
  ul { list-style: disc outside; }
  a { color: inherit; text-decoration: none; }
  @page { size: A4; margin: 18mm 18mm 18mm 18mm; }
  @media print {
    body { margin: 0; padding: 0; }
  }
</style>
</head>
<body>
<div style="padding: 0;">
    ${header}
    <div style="display:flex;flex-direction:column;">
        ${bodySections}
    </div>
</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        /* Support both old HTML-string mode and new resume-data mode */
        const resumeData: ResumeData | null = body.resumeData || null;

        if (!resumeData && !body.html) {
            return NextResponse.json({ error: 'resumeData or html is required' }, { status: 400 });
        }

        const htmlDoc = resumeData
            ? buildResumeHTML(resumeData)
            : `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
               <style>*{box-sizing:border-box;font-family:Helvetica,Arial,sans-serif;}
               @page{size:A4;margin:18mm;}
               </style></head><body>${body.html}</body></html>`;

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
        await page.setContent(htmlDoc, { waitUntil: 'domcontentloaded' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '18mm', bottom: '18mm', left: '18mm', right: '18mm' }
        });

        await browser.close();

        const name = resumeData?.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume';

        return new NextResponse(Buffer.from(pdf), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${name}_Resume.pdf"`
            }
        });
    } catch (error: any) {
        console.error('PDF Error:', error);
        return NextResponse.json({ error: 'Failed to generate document', details: error.message }, { status: 500 });
    }
}
