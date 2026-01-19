import { NextRequest, NextResponse } from 'next/server';

interface ProfileData {
    age: number | null;
    gender: string;
    bloodGroup: string;
    allergies: string[];
    medications: { name: string; dosage: string; frequency: string }[];
    labValues: { name: string; value: number; unit: string; trend: string }[];
    hasAbnormalValues: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const data: ProfileData = await request.json();

        if (!apiKey) {
            return NextResponse.json(generateFallbackTips(data));
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
                        content: `You are a wellness advisor providing personalized health tips.
                        Based on the patient's profile, medications, and health data, generate relevant daily health tips.
                        
                        Tips should be:
                        1. Actionable and specific
                        2. Relevant to the patient's health profile
                        3. Encouraging and positive in tone
                        4. Evidence-based when possible
                        5. Categorized for easy understanding
                        
                        Format your response as JSON with the following structure:
                        {
                            "dailyTip": {
                                "title": "Featured tip title",
                                "content": "Detailed tip content (2-3 sentences)",
                                "category": "nutrition|exercise|sleep|stress|medication|prevention"
                            },
                            "tips": [
                                {
                                    "id": "unique-id",
                                    "title": "Tip title",
                                    "content": "Tip content",
                                    "category": "nutrition|exercise|sleep|stress|medication|prevention",
                                    "priority": "high|medium|low"
                                }
                            ],
                            "focusAreas": ["Array of 2-3 health areas to focus on based on profile"]
                        }
                        
                        Generate 5-6 diverse tips covering different categories.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
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
        console.error('Health Tips API Error:', error);

        let data: ProfileData;
        try {
            data = await request.json();
        } catch {
            data = {
                age: null,
                gender: '',
                bloodGroup: '',
                allergies: [],
                medications: [],
                labValues: [],
                hasAbnormalValues: false
            };
        }

        return NextResponse.json(generateFallbackTips(data));
    }
}

function buildPrompt(data: ProfileData): string {
    let prompt = 'Generate personalized health tips based on this patient profile:\n\n';

    if (data.age) {
        prompt += `- Age: ${data.age} years\n`;
    }
    if (data.gender) {
        prompt += `- Gender: ${data.gender}\n`;
    }
    if (data.bloodGroup) {
        prompt += `- Blood Group: ${data.bloodGroup}\n`;
    }
    if (data.allergies && data.allergies.length > 0) {
        prompt += `- Allergies: ${data.allergies.join(', ')}\n`;
    }

    if (data.medications && data.medications.length > 0) {
        prompt += '\nCurrent Medications:\n';
        data.medications.forEach(m => {
            prompt += `- ${m.name} (${m.dosage}, ${m.frequency})\n`;
        });
    }

    if (data.labValues && data.labValues.length > 0) {
        const abnormal = data.labValues.filter(v => v.trend !== 'normal');
        if (abnormal.length > 0) {
            prompt += '\nHealth Indicators Needing Attention:\n';
            abnormal.forEach(v => {
                const direction = v.trend === 'up' ? 'elevated' : 'low';
                prompt += `- ${v.name}: ${v.value} ${v.unit} (${direction})\n`;
            });
        }
    }

    prompt += '\nProvide tips that are:\n';
    prompt += '1. Relevant to any medications they are taking\n';
    prompt += '2. Address any abnormal lab values\n';
    prompt += '3. Age and gender appropriate\n';
    prompt += '4. Consider their allergies when suggesting foods\n';

    return prompt;
}

function generateFallbackTips(data: ProfileData) {
    const tips = [
        {
            id: 'hydration-1',
            title: 'Stay Hydrated',
            content: 'Aim to drink 8-10 glasses of water daily. Proper hydration supports every bodily function, from digestion to brain performance.',
            category: 'nutrition',
            priority: 'high',
        },
        {
            id: 'sleep-1',
            title: 'Prioritize Quality Sleep',
            content: 'Establish a consistent sleep schedule by going to bed and waking up at the same time each day, even on weekends.',
            category: 'sleep',
            priority: 'high',
        },
        {
            id: 'exercise-1',
            title: 'Move Your Body Daily',
            content: 'Aim for at least 30 minutes of moderate activity most days. Even a brisk walk counts toward your daily movement goals.',
            category: 'exercise',
            priority: 'medium',
        },
        {
            id: 'stress-1',
            title: 'Practice Mindful Breathing',
            content: 'Take 5 minutes each day to practice deep breathing. Inhale for 4 counts, hold for 4, exhale for 4. This activates your relaxation response.',
            category: 'stress',
            priority: 'medium',
        },
        {
            id: 'prevention-1',
            title: 'Schedule Regular Check-ups',
            content: 'Stay proactive with your health by scheduling regular check-ups and screenings appropriate for your age and health history.',
            category: 'prevention',
            priority: 'medium',
        },
    ];

    if (data.medications && data.medications.length > 0) {
        tips.unshift({
            id: 'medication-1',
            title: 'Medication Adherence',
            content: `You have ${data.medications.length} active medication(s). Set daily reminders to take your medications at the same time each day for best results.`,
            category: 'medication',
            priority: 'high',
        });
    }

    if (data.hasAbnormalValues) {
        tips.unshift({
            id: 'prevention-2',
            title: 'Monitor Your Health Trends',
            content: 'Some of your lab values are outside normal range. Keep tracking them and discuss trends with your healthcare provider at your next visit.',
            category: 'prevention',
            priority: 'high',
        });
    }

    const focusAreas = ['General Wellness', 'Preventive Care'];
    if (data.medications && data.medications.length > 0) {
        focusAreas.push('Medication Management');
    }
    if (data.hasAbnormalValues) {
        focusAreas.push('Health Monitoring');
    }

    return {
        dailyTip: {
            title: 'Start Your Day with Purpose',
            content: 'Begin each morning with a glass of water and a moment of gratitude. Hydration kickstarts your metabolism and a positive mindset sets the tone for the day.',
            category: 'nutrition',
        },
        tips: tips.slice(0, 6),
        focusAreas: focusAreas.slice(0, 3),
    };
}
