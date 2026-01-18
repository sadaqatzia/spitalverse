import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface LabValue {
    name: string;
    value: number;
    unit: string;
    normalRange: { min: number; max: number };
    trend: string;
    date: string;
}

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
}

interface HealthData {
    profile: {
        age: number | null;
        gender: string;
        bloodGroup: string;
        allergies: string[];
    };
    medications: Medication[];
    labValues: LabValue[];
}

export async function POST(request: NextRequest) {
    try {
        // Check for API key at runtime
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Return fallback response if no API key is configured
            return NextResponse.json({
                summary: 'AI summary is not available. Please configure your OpenAI API key to enable this feature.',
                recommendations: ['Continue monitoring your health metrics regularly.'],
                riskLevel: 'low',
            });
        }

        const openai = new OpenAI({ apiKey });
        const data: HealthData = await request.json();

        // Build a comprehensive prompt
        const prompt = buildPrompt(data);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful health assistant that provides personalized health summaries. 
                    You analyze health data including medications, lab values, and patient profile to provide insights.
                    Always be supportive and informative, but remind users to consult healthcare professionals.
                    Format your response as JSON with the following structure:
                    {
                        "summary": "A comprehensive paragraph summarizing the patient's health status",
                        "recommendations": ["Array of specific, actionable recommendations"],
                        "riskLevel": "low|moderate|high based on the data"
                    }`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            throw new Error('No response from OpenAI');
        }

        const result = JSON.parse(responseText);

        return NextResponse.json(result);
    } catch (error) {
        console.error('OpenAI API Error:', error);

        // Return a fallback response if OpenAI fails
        return NextResponse.json({
            summary: 'Unable to generate AI summary at this time. Please try again later.',
            recommendations: ['Continue monitoring your health metrics regularly.'],
            riskLevel: 'low',
        }, { status: 500 });
    }
}

function buildPrompt(data: HealthData): string {
    let prompt = 'Please analyze the following health data and provide a comprehensive health summary:\n\n';

    // Profile information
    prompt += '## Patient Profile:\n';
    if (data.profile.age) {
        prompt += `- Age: ${data.profile.age} years old\n`;
    }
    if (data.profile.gender) {
        prompt += `- Gender: ${data.profile.gender}\n`;
    }
    if (data.profile.bloodGroup) {
        prompt += `- Blood Group: ${data.profile.bloodGroup}\n`;
    }
    if (data.profile.allergies && data.profile.allergies.length > 0) {
        prompt += `- Known Allergies: ${data.profile.allergies.join(', ')}\n`;
    }
    prompt += '\n';

    // Medications
    prompt += '## Current Medications:\n';
    if (data.medications && data.medications.length > 0) {
        data.medications.forEach((med) => {
            prompt += `- ${med.name} (${med.dosage}, ${med.frequency})\n`;
        });
    } else {
        prompt += '- No active medications\n';
    }
    prompt += '\n';

    // Lab values
    prompt += '## Recent Lab Values:\n';
    if (data.labValues && data.labValues.length > 0) {
        data.labValues.forEach((lab) => {
            const status = lab.trend === 'normal' ? '✓ Normal' : lab.trend === 'up' ? '↑ Elevated' : '↓ Low';
            prompt += `- ${lab.name}: ${lab.value} ${lab.unit} (Normal: ${lab.normalRange.min}-${lab.normalRange.max}) - ${status}\n`;
        });
    } else {
        prompt += '- No lab values recorded\n';
    }
    prompt += '\n';

    prompt += 'Based on this data, please provide:\n';
    prompt += '1. A comprehensive health summary\n';
    prompt += '2. Specific, actionable recommendations\n';
    prompt += '3. An overall risk assessment (low, moderate, or high)\n';

    return prompt;
}
