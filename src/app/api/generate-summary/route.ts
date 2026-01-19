import { NextRequest, NextResponse } from 'next/server';

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

interface Appointment {
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    notes?: string;
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
    appointments: Appointment[];
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                summary: 'AI summary is not available. Please configure your API key to enable this feature.',
                recommendations: ['Continue monitoring your health metrics regularly.'],
                riskLevel: 'low',
            });
        }

        const data: HealthData = await request.json();
        const prompt = buildPrompt(data);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://spitalverse.app',
                'X-Title': 'Spitalverse Health App',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful health assistant that provides personalized health summaries. 
                        You analyze health data including medications, lab values, upcoming appointments, and patient profile to provide insights.
                        Always be supportive and informative, but remind users to consult healthcare professionals.
                        
                        Provide a detailed but concise summary that mentions:
                        - Overall health status based on lab values
                        - Current medication management
                        - Upcoming doctor appointments and what to discuss/prepare
                        - Any concerning trends or values that need attention
                        
                        Format your response as JSON with the following structure:
                        {
                            "summary": "A comprehensive 3-4 paragraph summary of the patient's health status, including medication overview, lab value analysis, and upcoming appointment reminders",
                            "recommendations": ["Array of 5-7 specific, actionable recommendations covering lifestyle, medication adherence, appointment preparation, and health monitoring"],
                            "riskLevel": "low|moderate|high based on the data"
                        }`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1500,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            throw new Error('OpenRouter API request failed');
        }

        const completion = await response.json();
        const responseText = completion.choices?.[0]?.message?.content;

        if (!responseText) {
            throw new Error('No response from OpenRouter');
        }

        const result = JSON.parse(responseText);

        return NextResponse.json(result);
    } catch (error) {
        console.error('OpenRouter API Error:', error);

        return NextResponse.json({
            summary: 'Unable to generate AI summary at this time. Please try again later.',
            recommendations: ['Continue monitoring your health metrics regularly.'],
            riskLevel: 'low',
        }, { status: 500 });
    }
}

function buildPrompt(data: HealthData): string {
    let prompt = 'Please analyze the following health data and provide a comprehensive, detailed health summary:\n\n';

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

    prompt += '## Current Medications:\n';
    if (data.medications && data.medications.length > 0) {
        data.medications.forEach((med) => {
            prompt += `- ${med.name} (${med.dosage}, ${med.frequency})\n`;
        });
    } else {
        prompt += '- No active medications\n';
    }
    prompt += '\n';

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

    prompt += '## Upcoming Doctor Appointments:\n';
    if (data.appointments && data.appointments.length > 0) {
        data.appointments.forEach((apt) => {
            prompt += `- ${apt.doctorName} (${apt.specialty}) on ${apt.date} at ${apt.time}`;
            if (apt.notes) {
                prompt += ` - Notes: ${apt.notes}`;
            }
            prompt += '\n';
        });
    } else {
        prompt += '- No upcoming appointments scheduled\n';
    }
    prompt += '\n';

    prompt += 'Based on this data, please provide:\n';
    prompt += '1. A comprehensive health summary (3-4 paragraphs) covering:\n';
    prompt += '   - Overall health status and any concerning values\n';
    prompt += '   - Medication management overview\n';
    prompt += '   - Upcoming appointments and what to prepare/discuss with each doctor\n';
    prompt += '2. 5-7 specific, actionable recommendations for:\n';
    prompt += '   - Lifestyle improvements\n';
    prompt += '   - Medication adherence tips\n';
    prompt += '   - Questions to ask at upcoming appointments\n';
    prompt += '   - Health monitoring suggestions\n';
    prompt += '3. An overall risk assessment (low, moderate, or high)\n';

    return prompt;
}
