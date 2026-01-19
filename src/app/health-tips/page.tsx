'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/store';
import {
    Lightbulb,
    RefreshCw,
    Loader2,
    Sparkles,
    Utensils,
    Dumbbell,
    Moon,
    Brain,
    Pill,
    ShieldCheck,
    Star,
    ChevronRight,
    Target,
    Heart,
} from 'lucide-react';

interface HealthTip {
    id: string;
    title: string;
    content: string;
    category: 'nutrition' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'prevention';
    priority: 'high' | 'medium' | 'low';
}

interface DailyTip {
    title: string;
    content: string;
    category: string;
}

interface HealthTipsData {
    dailyTip: DailyTip;
    tips: HealthTip[];
    focusAreas: string[];
}

const categoryConfig = {
    nutrition: { icon: Utensils, color: 'var(--success)', bg: 'var(--success)' },
    exercise: { icon: Dumbbell, color: 'var(--spital-gold)', bg: 'var(--spital-gold)' },
    sleep: { icon: Moon, color: '#8B5CF6', bg: '#8B5CF6' },
    stress: { icon: Brain, color: '#EC4899', bg: '#EC4899' },
    medication: { icon: Pill, color: 'var(--spital-green)', bg: 'var(--spital-green)' },
    prevention: { icon: ShieldCheck, color: '#06B6D4', bg: '#06B6D4' },
};

export default function HealthTipsPage() {
    const { profile, medications, labReports } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [tipsData, setTipsData] = useState<HealthTipsData | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const activeMedications = medications.filter((m) => m.status === 'active');
    const abnormalValues = labReports.flatMap((report) =>
        report.values.filter((v) => v.trend !== 'normal')
    );

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

    const fetchTips = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/health-tips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null,
                    gender: profile.gender,
                    bloodGroup: profile.bloodGroup,
                    allergies: profile.allergies,
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
                            trend: v.trend,
                        }))
                    ),
                    hasAbnormalValues: abnormalValues.length > 0,
                }),
            });

            const data = await response.json();
            setTipsData(data);
        } catch (err) {
            console.error('Error fetching health tips:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTips();
    }, []);

    const filteredTips = selectedCategory
        ? tipsData?.tips.filter((tip) => tip.category === selectedCategory)
        : tipsData?.tips;

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <span className="tag tag-danger text-[10px]">Priority</span>;
            case 'medium':
                return <span className="tag tag-warning text-[10px]">Suggested</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4 sm:space-y-8">
            <Header
                title="Health Tips"
                subtitle="AI-curated wellness recommendations based on your health profile"
            />

            {/* Daily Featured Tip */}
            {tipsData?.dailyTip && (
                <div className="ai-summary-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--spital-gold)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--spital-gold)] flex items-center justify-center float-animation">
                                    <Lightbulb size={32} className="text-[var(--spital-green)]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="ai-badge">Today's Tip</span>
                                        <Star size={14} className="text-[var(--spital-gold)]" fill="currentColor" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                        {tipsData.dailyTip.title}
                                    </h2>
                                    <p className="text-[var(--text-secondary)] max-w-xl">
                                        {tipsData.dailyTip.content}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={fetchTips}
                                disabled={isLoading}
                                className="btn-secondary flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={18} />
                                )}
                                Refresh Tips
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Focus Areas */}
            {tipsData?.focusAreas && tipsData.focusAreas.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <Target size={18} className="text-[var(--spital-gold)]" />
                        Your Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tipsData.focusAreas.map((area, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 rounded-full bg-[var(--spital-gold)]/15 text-[var(--spital-gold-dark)] font-medium text-sm"
                            >
                                {area}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory
                            ? 'bg-[var(--spital-green)] text-white'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--spital-gold)]'
                        }`}
                >
                    All Tips
                </button>
                {Object.entries(categoryConfig).map(([category, config]) => {
                    const Icon = config.icon;
                    return (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 capitalize ${selectedCategory === category
                                    ? 'bg-[var(--spital-green)] text-white'
                                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--spital-gold)]'
                                }`}
                        >
                            <Icon size={16} />
                            {category}
                        </button>
                    );
                })}
            </div>

            {/* Tips Grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card p-6">
                            <div className="skeleton h-12 w-12 rounded-xl mb-4" />
                            <div className="skeleton h-5 w-3/4 mb-2" />
                            <div className="skeleton h-4 w-full mb-1" />
                            <div className="skeleton h-4 w-5/6" />
                        </div>
                    ))}
                </div>
            ) : filteredTips && filteredTips.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTips.map((tip) => {
                        const config = categoryConfig[tip.category];
                        const Icon = config?.icon || Heart;
                        const color = config?.color || 'var(--spital-gold)';

                        return (
                            <div
                                key={tip.id}
                                className="glass-card p-6 group cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${color}20` }}
                                    >
                                        <Icon size={24} style={{ color }} />
                                    </div>
                                    {getPriorityBadge(tip.priority)}
                                </div>

                                <h3 className="font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--spital-gold)] transition-colors">
                                    {tip.title}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {tip.content}
                                </p>

                                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                                    <span
                                        className="text-xs font-medium capitalize px-2 py-1 rounded-md"
                                        style={{ backgroundColor: `${color}15`, color }}
                                    >
                                        {tip.category}
                                    </span>
                                    <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--spital-gold)] transition-colors" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--spital-slate)] flex items-center justify-center mx-auto mb-4">
                        <Lightbulb size={40} className="text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                        No Tips Available
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                        Click "Refresh Tips" to get personalized health recommendations.
                    </p>
                    <button onClick={fetchTips} className="btn-primary">
                        <Sparkles size={18} className="mr-2 inline" />
                        Get Health Tips
                    </button>
                </div>
            )}

            {/* Info Card */}
            <div className="glass-card p-5">
                <div className="flex items-start gap-3">
                    <Sparkles size={20} className="text-[var(--spital-gold)] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Personalized for You</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            These tips are generated based on your health profile, medications, and lab results.
                            Add more health data to receive more personalized recommendations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
