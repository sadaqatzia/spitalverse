'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/store';
import { Brain, Sparkles, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Pill, TestTube, Calendar, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export default function AISummaryPage() {
    const { profile, medications, labReports, appointments, healthSummaries, addHealthSummary } = useStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeMedications = medications.filter((m) => m.status === 'active');
    const abnormalValues = labReports.flatMap((report) =>
        report.values.filter((v) => v.trend !== 'normal')
    );

    const generateSummary = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile: {
                        age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null,
                        gender: profile.gender,
                        bloodGroup: profile.bloodGroup,
                        allergies: profile.allergies,
                    },
                    medications: activeMedications.map((m) => ({
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                    })),
                    labValues: labReports.flatMap((report) =>
                        report.values.map((v) => ({
                            name: v.name,
                            value: v.value,
                            unit: v.unit,
                            normalRange: v.normalRange,
                            trend: v.trend,
                            date: report.date,
                        }))
                    ),
                }),
            });

            const data = await response.json();

            // Check if API returned fallback message (no API key configured)
            if (data.summary && data.summary.includes('not available')) {
                // Use local AI summary instead
                const fallbackSummary = generateFallbackSummary();
                addHealthSummary(fallbackSummary);
            } else if (!response.ok) {
                throw new Error('Failed to generate summary');
            } else {
                const newSummary = {
                    id: uuidv4(),
                    generatedAt: new Date().toISOString(),
                    summary: data.summary,
                    recommendations: data.recommendations || [],
                    riskLevel: data.riskLevel || 'low',
                };
                addHealthSummary(newSummary);
            }
        } catch (err) {
            console.error('Error generating summary:', err);
            // Fallback summary for demo
            const fallbackSummary = generateFallbackSummary();
            addHealthSummary(fallbackSummary);
        } finally {
            setIsGenerating(false);
        }
    };

    const calculateAge = (dob: string): number => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const generateFallbackSummary = () => {
        const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
        let summary = '';
        const recommendations: string[] = [];
        let riskLevel: 'low' | 'moderate' | 'high' = 'low';

        // Build summary based on available data
        if (profile.fullName) {
            summary += `Health Summary for ${profile.fullName}. `;
        }

        if (age) {
            summary += `You are ${age} years old${profile.gender ? `, ${profile.gender}` : ''}. `;
        }

        if (activeMedications.length > 0) {
            summary += `You are currently on ${activeMedications.length} medication${activeMedications.length > 1 ? 's' : ''}: ${activeMedications.map((m) => m.name).join(', ')}. `;
        } else {
            summary += 'You have no active medications recorded. ';
        }

        if (labReports.length > 0) {
            const latestReport = labReports[0];
            summary += `Your most recent lab report was on ${format(new Date(latestReport.date), 'MMMM d, yyyy')}. `;

            if (abnormalValues.length > 0) {
                riskLevel = abnormalValues.length > 3 ? 'high' : 'moderate';
                const highValues = abnormalValues.filter((v) => v.trend === 'up');
                const lowValues = abnormalValues.filter((v) => v.trend === 'down');

                if (highValues.length > 0) {
                    summary += `You have elevated levels of ${highValues.map((v) => v.name).join(', ')}. `;
                }
                if (lowValues.length > 0) {
                    summary += `You have low levels of ${lowValues.map((v) => v.name).join(', ')}. `;
                }

                // Add recommendations based on abnormal values
                abnormalValues.forEach((value) => {
                    if (value.name === 'Hemoglobin' && value.trend === 'down') {
                        recommendations.push('Consider iron-rich foods like spinach, red meat, and legumes to help increase hemoglobin levels.');
                    }
                    if (value.name.includes('Cholesterol') && value.trend === 'up') {
                        recommendations.push('Focus on a heart-healthy diet low in saturated fats. Consider increasing fiber intake and physical activity.');
                    }
                    if (value.name === 'Fasting Blood Sugar' && value.trend === 'up') {
                        recommendations.push('Monitor your carbohydrate intake and consider speaking with your doctor about blood sugar management.');
                    }
                    if (value.name === 'Vitamin D' && value.trend === 'down') {
                        recommendations.push('Consider vitamin D supplementation or increased sun exposure. Discuss with your doctor.');
                    }
                });
            } else {
                summary += 'All your lab values are within normal range. ';
                recommendations.push('Continue maintaining your healthy lifestyle.');
            }
        } else {
            summary += 'No lab reports recorded yet. Consider adding your recent blood test results for personalized insights. ';
        }

        if (profile.allergies.length > 0) {
            summary += `You have ${profile.allergies.length} known allerg${profile.allergies.length > 1 ? 'ies' : 'y'}: ${profile.allergies.join(', ')}. `;
            recommendations.push('Always inform healthcare providers about your allergies before any treatment.');
        }

        if (riskLevel === 'low') {
            summary += 'No critical health risks detected based on your current data.';
        } else if (riskLevel === 'moderate') {
            summary += 'Some values require attention. Please consult with your healthcare provider.';
        } else {
            summary += 'Multiple values need attention. We recommend scheduling a check-up with your doctor.';
        }

        return {
            id: uuidv4(),
            generatedAt: new Date().toISOString(),
            summary,
            recommendations: recommendations.length > 0 ? recommendations : ['Keep tracking your health metrics regularly.'],
            riskLevel,
        };
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'high':
                return <span className="tag tag-danger">High Risk</span>;
            case 'moderate':
                return <span className="tag tag-warning">Moderate</span>;
            default:
                return <span className="tag tag-success">Low Risk</span>;
        }
    };

    const latestSummary = healthSummaries[0];

    return (
        <div className="space-y-8">
            <Header
                title="AI Health Summary"
                subtitle="Get personalized insights powered by artificial intelligence"
            />

            {/* Generate Summary CTA */}
            <div className="ai-summary-card">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--spital-gold)] flex items-center justify-center float-animation">
                            <Brain size={32} className="text-[var(--spital-green)]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="ai-badge">AI Powered</span>
                                <Sparkles size={16} className="text-[var(--spital-gold)]" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Generate My Health Summary</h2>
                            <p className="text-[var(--text-secondary)] mt-1">
                                Our AI analyzes your medications, lab results, and health history to provide personalized insights.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={generateSummary}
                        disabled={isGenerating}
                        className="btn-primary flex items-center gap-2 min-w-[180px] justify-center"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={20} />
                                Generate Summary
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-card p-4 border-l-4 border-[var(--signal-red)]">
                    <p className="text-[var(--signal-red)]">{error}</p>
                </div>
            )}

            {/* Current Health Data Summary */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--spital-gold)]/20 flex items-center justify-center">
                            <Pill size={20} className="text-[var(--spital-gold)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{activeMedications.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Active Medications</p>
                        </div>
                    </div>
                    {activeMedications.length > 0 && (
                        <div className="space-y-1">
                            {activeMedications.slice(0, 2).map((med) => (
                                <p key={med.id} className="text-sm text-[var(--text-secondary)] truncate">
                                    • {med.name} ({med.dosage})
                                </p>
                            ))}
                            {activeMedications.length > 2 && (
                                <p className="text-xs text-[var(--text-muted)]">+{activeMedications.length - 2} more</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center">
                            <TestTube size={20} className="text-[var(--success)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{labReports.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Lab Reports</p>
                        </div>
                    </div>
                    {abnormalValues.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle size={14} className="text-[var(--warning)]" />
                            <span className="text-[var(--text-secondary)]">{abnormalValues.length} abnormal values</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle size={14} className="text-[var(--success)]" />
                            <span className="text-[var(--text-secondary)]">All values normal</span>
                        </div>
                    )}
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--spital-green)]/20 flex items-center justify-center">
                            <Calendar size={20} className="text-[var(--spital-green)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{appointments.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Appointments</p>
                        </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {healthSummaries.length} summaries generated
                    </p>
                </div>
            </div>

            {/* Latest Summary */}
            {latestSummary && (
                <div className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center">
                                <Sparkles size={24} className="text-[var(--spital-green)]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Latest Health Summary</h3>
                                <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                                    <Clock size={14} />
                                    Generated {format(new Date(latestSummary.generatedAt), 'MMMM d, yyyy \'at\' h:mm a')}
                                </p>
                            </div>
                        </div>
                        {getRiskBadge(latestSummary.riskLevel)}
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-[var(--text-secondary)] leading-relaxed">{latestSummary.summary}</p>
                    </div>

                    {latestSummary.recommendations.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <CheckCircle size={18} className="text-[var(--success)]" />
                                Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {latestSummary.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2 text-[var(--text-secondary)]">
                                        <span className="w-6 h-6 rounded-full bg-[var(--spital-gold)]/20 flex items-center justify-center flex-shrink-0 text-xs text-[var(--spital-gold)]">
                                            {index + 1}
                                        </span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mt-6 p-4 bg-[var(--spital-slate)] rounded-xl border border-[var(--border-color)]">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-[var(--warning)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">Medical Disclaimer</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    This AI-generated summary is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Previous Summaries */}
            {healthSummaries.length > 1 && (
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Previous Summaries</h3>
                    <div className="space-y-3">
                        {healthSummaries.slice(1, 5).map((summary) => (
                            <div key={summary.id} className="glass-card p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--spital-slate)] flex items-center justify-center">
                                            <Sparkles size={16} className="text-[var(--text-muted)]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                                {format(new Date(summary.generatedAt), 'MMMM d, yyyy')}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                                                {summary.summary.substring(0, 100)}...
                                            </p>
                                        </div>
                                    </div>
                                    {getRiskBadge(summary.riskLevel)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No data message */}
            {!latestSummary && (
                <div className="glass-card p-8 text-center">
                    <Brain size={64} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Health Summary Yet</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                        Click "Generate Summary" above to get your personalized AI health insights based on your profile, medications, and lab results.
                    </p>
                </div>
            )}
        </div>
    );
}
