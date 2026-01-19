'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/store';
import {
    Stethoscope,
    Send,
    Loader2,
    ClipboardList,
    MessageCircleQuestion,
    AlertCircle,
    Heart,
    Sparkles,
    Clock,
    Activity,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';

interface SymptomResult {
    acknowledgment: string;
    thingsToTrack: string[];
    questionsForDoctor: string[];
    careLevel: 'self-care' | 'schedule-appointment' | 'seek-immediate-care';
    careLevelExplanation: string;
    wellnessSuggestions: string[];
    disclaimer: string;
}

export default function SymptomCheckerPage() {
    const { profile, medications } = useStore();
    const [symptoms, setSymptoms] = useState('');
    const [duration, setDuration] = useState('');
    const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SymptomResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const activeMedications = medications.filter((m) => m.status === 'active');

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

    const analyzeSymptoms = async () => {
        if (!symptoms.trim()) {
            setError('Please describe your symptoms');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/symptom-checker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms,
                    duration,
                    severity,
                    profile: {
                        age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null,
                        gender: profile.gender,
                        allergies: profile.allergies,
                        medications: activeMedications.map((m) => ({
                            name: m.name,
                            dosage: m.dosage,
                        })),
                    },
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('Error analyzing symptoms:', err);
            setError('Unable to analyze symptoms. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getCareLevelBadge = (level: string) => {
        switch (level) {
            case 'seek-immediate-care':
                return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--signal-red)]/15 border border-[var(--signal-red)]/30">
                        <AlertCircle size={18} className="text-[var(--signal-red)] flex-shrink-0" />
                        <span className="font-semibold text-[var(--signal-red)] text-sm">Seek Immediate Care</span>
                    </div>
                );
            case 'schedule-appointment':
                return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--warning)]/15 border border-[var(--warning)]/30">
                        <Clock size={18} className="text-[var(--warning)] flex-shrink-0" />
                        <span className="font-semibold text-[var(--warning)] text-sm">Schedule Appointment</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/30">
                        <ShieldCheck size={18} className="text-[var(--success)] flex-shrink-0" />
                        <span className="font-semibold text-[var(--success)] text-sm">Self-Care Appropriate</span>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4 sm:space-y-8">
            <Header
                title="Symptom Checker"
                subtitle="AI-powered symptom analysis with guidance on what to track and discuss with your doctor"
            />

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="ai-summary-card">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--spital-gold)] flex items-center justify-center">
                                <Stethoscope size={28} className="text-[var(--spital-green)]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="ai-badge">AI Powered</span>
                                    <Sparkles size={14} className="text-[var(--spital-gold)]" />
                                </div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Describe Your Symptoms</h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Tell us how you're feeling and get guidance on what to track
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="input-label">What symptoms are you experiencing?</label>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Describe your symptoms in detail... e.g., I've been having a mild headache and feeling tired"
                                    className="input-field min-h-[120px] resize-none"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">How long have you had these symptoms?</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select duration</option>
                                        <option value="a few hours">A few hours</option>
                                        <option value="1-2 days">1-2 days</option>
                                        <option value="3-7 days">3-7 days</option>
                                        <option value="1-2 weeks">1-2 weeks</option>
                                        <option value="more than 2 weeks">More than 2 weeks</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Severity level</label>
                                    <div className="flex gap-2">
                                        {(['mild', 'moderate', 'severe'] as const).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setSeverity(level)}
                                                className={`flex-1 py-3 px-3 rounded-xl border transition-all capitalize text-sm font-medium ${severity === level
                                                    ? level === 'severe'
                                                        ? 'bg-[var(--signal-red)]/10 border-[var(--signal-red)] text-[var(--signal-red)]'
                                                        : level === 'moderate'
                                                            ? 'bg-[var(--warning)]/10 border-[var(--warning)] text-[var(--warning)]'
                                                            : 'bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--spital-gold)]'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-[var(--signal-red)]/10 border border-[var(--signal-red)]/30">
                                    <p className="text-sm text-[var(--signal-red)]">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={analyzeSymptoms}
                                disabled={isAnalyzing || !symptoms.trim()}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Analyzing Symptoms...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Analyze Symptoms
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-[var(--warning)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">Important Disclaimer</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    This tool provides general guidance and is not a substitute for professional medical advice.
                                    If you're experiencing severe symptoms, chest pain, difficulty breathing, or other emergencies,
                                    please call emergency services immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {result ? (
                        <>
                            <div className="glass-card p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                        <Activity size={20} className="text-[var(--spital-gold)]" />
                                        Analysis Results
                                    </h3>
                                    {getCareLevelBadge(result.careLevel)}
                                </div>

                                <p className="text-[var(--text-secondary)] mb-4">{result.acknowledgment}</p>
                                <p className="text-sm text-[var(--text-muted)] bg-[var(--spital-slate)] p-3 rounded-lg">
                                    {result.careLevelExplanation}
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <ClipboardList size={18} className="text-[var(--spital-gold)]" />
                                    Things to Track
                                </h3>
                                <ul className="space-y-2">
                                    {result.thingsToTrack.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-[var(--text-secondary)]">
                                            <span className="w-6 h-6 rounded-full bg-[var(--spital-gold)]/20 flex items-center justify-center flex-shrink-0 text-xs text-[var(--spital-gold)] font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <MessageCircleQuestion size={18} className="text-[var(--spital-green)]" />
                                    Questions for Your Doctor
                                </h3>
                                <ul className="space-y-2">
                                    {result.questionsForDoctor.map((question, index) => (
                                        <li key={index} className="flex items-start gap-3 text-[var(--text-secondary)]">
                                            <CheckCircle2 size={16} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{question}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <Heart size={18} className="text-[var(--signal-red)]" />
                                    Wellness Suggestions
                                </h3>
                                <ul className="space-y-2">
                                    {result.wellnessSuggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-3 text-[var(--text-secondary)]">
                                            <span className="w-2 h-2 rounded-full bg-[var(--spital-gold)] flex-shrink-0 mt-2" />
                                            <span className="text-sm">{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card p-8 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--spital-slate)] flex items-center justify-center mx-auto mb-4">
                                <Stethoscope size={40} className="text-[var(--text-muted)]" />
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                                Ready to Help
                            </h3>
                            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                                Describe your symptoms on the left and our AI will provide guidance on what to track and questions to ask your doctor.
                            </p>

                            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 text-center">
                                <div className="p-3 rounded-xl bg-[var(--spital-slate)]">
                                    <ClipboardList size={24} className="mx-auto text-[var(--spital-gold)] mb-2" />
                                    <p className="text-xs text-[var(--text-muted)]">What to Track</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--spital-slate)]">
                                    <MessageCircleQuestion size={24} className="mx-auto text-[var(--spital-green)] mb-2" />
                                    <p className="text-xs text-[var(--text-muted)]">Doctor Questions</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--spital-slate)]">
                                    <Heart size={24} className="mx-auto text-[var(--signal-red)] mb-2" />
                                    <p className="text-xs text-[var(--text-muted)]">Wellness Tips</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
