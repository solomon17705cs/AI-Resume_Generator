import { NextRequest, NextResponse } from 'next/server';
import { detectATSWithConfidence, DetectionSignals } from '@/config/atsProfiles';

/**
 * ATS Detection Endpoint with Multi-Signal Inference
 * 
 * Accepts multiple signals (URL, company name, size, region, industry)
 * Returns detected ATS profile with confidence level and reasoning
 */
export async function POST(req: NextRequest) {
    try {
        const signals: DetectionSignals = await req.json();

        // Validate at least one signal is provided
        if (!signals.url && !signals.companyName && !signals.companySize && !signals.region && !signals.industry) {
            return NextResponse.json({
                error: 'At least one detection signal is required (url, companyName, companySize, region, or industry)'
            }, { status: 400 });
        }

        // Perform multi-signal detection
        const detection = detectATSWithConfidence(signals);

        // Return comprehensive detection result
        return NextResponse.json({
            ats: {
                id: detection.profile.id,
                name: detection.profile.name,
                description: detection.profile.description,
                targetScore: detection.profile.targetScore,
                commonCompanies: detection.profile.commonCompanies.slice(0, 10), // First 10 for brevity
                companyTraits: detection.profile.companyTraits,
                optimizationStrategy: detection.profile.optimizationStrategy,
                rules: detection.profile.rules
            },
            detection: {
                confidence: detection.confidence,
                method: detection.detectionMethod,
                reasoning: detection.reasoning
            },
            signals: signals // Echo back what was provided
        });

    } catch (error: any) {
        console.error('ATS Detection Error:', error.message);
        return NextResponse.json({
            error: 'ATS detection service unavailable',
            details: error.message
        }, { status: 500 });
    }
}
