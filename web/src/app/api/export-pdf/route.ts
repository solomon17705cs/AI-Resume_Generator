import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    try {
        const { html } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport for standard A4
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            }
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdf), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="ATSense_Resume.pdf"'
            }
        });
    } catch (error: any) {
        console.error('PDF Error:', error);
        return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
    }
}
