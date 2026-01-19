import { NextRequest, NextResponse } from 'next/server';

interface SymptomData {
    symptoms: string;
    duration: string;
    severity: 'mild' | 'moderate' | 'severe';
    profile: {
        age: number | null;
        gender: string;
        allergies: string[];
        medications: { name: string; dosage: string }[];
    };
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const data: SymptomData = await request.json();

        if (!apiKey) {
            return NextResponse.json(generateFallbackResponse(data));
        }

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
                        content: `You are a helpful medical assistant that helps users understand their symptoms.
                        You DO NOT diagnose conditions. Instead, you:
                        1. Acknowledge the symptoms described
                        2. Suggest things they might want to track or monitor
                        3. Provide questions they should ask their doctor
                        4. Recommend appropriate care level (self-care, schedule appointment, or seek immediate care)
                        5. Offer general wellness suggestions
                        
                        Always emphasize that you are NOT providing medical diagnosis and users should consult healthcare professionals.
                        
                        Format your response as JSON with the following structure:
                        {
                            "acknowledgment": "Brief acknowledgment of symptoms described",
                            "thingsToTrack": ["Array of 3-5 things to monitor/track"],
                            "questionsForDoctor": ["Array of 3-5 questions to ask a doctor"],
                            "careLevel": "self-care|schedule-appointment|seek-immediate-care",
                            "careLevelExplanation": "Brief explanation of why this care level",
                            "wellnessSuggestions": ["Array of 2-3 general wellness tips relevant to symptoms"],
                            "disclaimer": "Medical disclaimer text"
                        }`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1200,
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
        console.error('Symptom Checker API Error:', error);

        let data: SymptomData;
        try {
            data = await request.json();
        } catch {
            data = {
                symptoms: '',
                duration: '',
                severity: 'mild' as const,
                profile: { age: null, gender: '', allergies: [], medications: [] }
            };
        }

        return NextResponse.json(generateFallbackResponse(data));
    }
}

function buildPrompt(data: SymptomData): string {
    let prompt = 'Please analyze the following symptoms and provide guidance:\n\n';

    prompt += `## Symptoms Described:\n${data.symptoms}\n\n`;
    prompt += `## Duration: ${data.duration || 'Not specified'}\n`;
    prompt += `## Severity: ${data.severity}\n\n`;

    if (data.profile.age) {
        prompt += `## Patient Info:\n- Age: ${data.profile.age} years\n`;
    }
    if (data.profile.gender) {
        prompt += `- Gender: ${data.profile.gender}\n`;
    }
    if (data.profile.allergies && data.profile.allergies.length > 0) {
        prompt += `- Known Allergies: ${data.profile.allergies.join(', ')}\n`;
    }
    if (data.profile.medications && data.profile.medications.length > 0) {
        prompt += `- Current Medications: ${data.profile.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}\n`;
    }

    prompt += '\nBased on these symptoms, provide:\n';
    prompt += '1. Things the patient should track/monitor\n';
    prompt += '2. Questions to ask their doctor\n';
    prompt += '3. Recommended care level\n';
    prompt += '4. General wellness suggestions\n';

    return prompt;
}

function generateFallbackResponse(data: SymptomData) {
    const isSevere = data.severity === 'severe';
    const isModerate = data.severity === 'moderate';

    let careLevel: 'self-care' | 'schedule-appointment' | 'seek-immediate-care' = 'self-care';
    let careLevelExplanation = 'Based on the mild symptoms described, self-care measures may be appropriate while monitoring for changes.';

    if (isSevere) {
        careLevel = 'seek-immediate-care';
        careLevelExplanation = 'Severe symptoms warrant prompt medical attention. Please consult a healthcare provider soon.';
    } else if (isModerate) {
        careLevel = 'schedule-appointment';
        careLevelExplanation = 'Moderate symptoms should be evaluated by a healthcare provider within a few days.';
    }

    return {
        acknowledgment: `You've described symptoms that you've been experiencing${data.duration ? ` for ${data.duration}` : ''}. It's important to pay attention to how you're feeling.`,
        thingsToTrack: [
            'Keep a symptom diary noting when symptoms occur and their intensity',
            'Track any activities or foods that seem to trigger or worsen symptoms',
            'Monitor your temperature if you feel feverish',
            'Note any new symptoms that develop',
            'Record how well you sleep and your energy levels',
        ],
        questionsForDoctor: [
            'What could be causing these symptoms?',
            'Are there any tests you recommend to help identify the cause?',
            'Could any of my current medications be contributing to these symptoms?',
            'What warning signs should I watch for that would require immediate attention?',
            'Are there any lifestyle changes that might help with these symptoms?',
        ],
        careLevel,
        careLevelExplanation,
        wellnessSuggestions: [
            'Ensure you are staying well-hydrated by drinking plenty of water',
            'Get adequate rest to support your body\'s natural healing processes',
            'Avoid strenuous activities until symptoms improve',
        ],
        disclaimer: 'This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
    };
}
