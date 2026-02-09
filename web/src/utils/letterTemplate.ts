export const generateLetterHTML = (letterContent: string, studentName: string, company: string, date: string) => {
    // Process the letter content to preserve line breaks, bold text, and strip redundant closings
    const formattedContent = letterContent
        .replace(/(Sincerely|Regards|Yours truly|Best|Thank you),?\s*$/i, '') // Strip common closings at the end
        .trim()
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                    line-height: 1.6;
                    color: #1a1a1a;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    border-bottom: 2px solid #2563eb;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .logo {
                    font-size: 24px;
                    font-weight: 900;
                    color: #2563eb;
                    letter-spacing: -1px;
                }
                .date {
                    font-size: 14px;
                    color: #666;
                }
                .meta {
                    margin-bottom: 40px;
                }
                .meta p {
                    margin: 2px 0;
                    font-size: 14px;
                }
                .content {
                    font-size: 15px;
                    text-align: justify;
                }
                .closing {
                    margin-top: 60px;
                }
                .signature-line {
                    margin-top: 40px;
                    border-top: 1px solid #ddd;
                    width: 200px;
                    padding-top: 8px;
                    font-size: 14px;
                    color: #666;
                }
                .badge {
                    margin-top: 40px;
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    display: inline-block;
                    font-size: 12px;
                    color: #475569;
                }
                .badge strong {
                    color: #2563eb;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">ATSense Intelligence</div>
                <div class="date">${date}</div>
            </div>
            
            <div class="meta">
                <p><strong>To:</strong> Hiring Committee</p>
                <p><strong>Target:</strong> ${company}</p>
                <p><strong>Subject:</strong> Verification & Recommendation for ${studentName}</p>
            </div>

            <div class="content">
                ${formattedContent}
            </div>

            <div class="closing">
                <p>Sincerely,</p>
                <div class="signature-line">
                    <strong>ATSense Career Administration</strong><br/>
                    Verified Referral Desk
                </div>
            </div>

            <div class="badge">
                🛡️ This candidate has been verified by the <strong>ATSense AI Forensic Engine</strong>.<br/>
                All claims and projects are cross-referenced with GitHub and technical documentation.
            </div>
        </body>
        </html>
    `;
};
