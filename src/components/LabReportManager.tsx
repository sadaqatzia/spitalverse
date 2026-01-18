'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { TestTube, Plus, TrendingUp, TrendingDown, Minus, Trash2, AlertCircle, Sparkles, Search, X, Check } from 'lucide-react';
import Modal from './Modal';
import { LabReport, LabValue, TrendDirection } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// German/EU Standard Lab Values
const labCategories = {
    cbc: {
        name: 'Complete Blood Count (CBC)',
        emoji: '🩸',
        tests: [
            { name: 'Hemoglobin', unit: 'g/dL', normalRange: { min: 12.0, max: 17.5 } },
            { name: 'RBC Count', unit: '10⁶/µL', normalRange: { min: 4.3, max: 5.9 } },
            { name: 'WBC Count', unit: '10³/µL', normalRange: { min: 4.0, max: 10.0 } },
            { name: 'Platelets', unit: '10³/µL', normalRange: { min: 150, max: 400 } },
            { name: 'Hematocrit', unit: '%', normalRange: { min: 40, max: 52 } },
            { name: 'MCV', unit: 'fL', normalRange: { min: 80, max: 96 } },
            { name: 'MCH', unit: 'pg', normalRange: { min: 27, max: 33 } },
            { name: 'MCHC', unit: 'g/dL', normalRange: { min: 32, max: 36 } },
        ],
    },
    diabetes: {
        name: 'Blood Sugar Profile',
        emoji: '🍬',
        tests: [
            { name: 'Fasting Blood Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 99 } },
            { name: 'Random Blood Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 140 } },
            { name: 'HbA1c', unit: '%', normalRange: { min: 4.0, max: 5.6 } },
            { name: 'HbA1c (IFCC)', unit: 'mmol/mol', normalRange: { min: 20, max: 38 } },
        ],
    },
    lipid: {
        name: 'Lipid Profile',
        emoji: '❤️',
        tests: [
            { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: { min: 0, max: 200 } },
            { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: { min: 40, max: 100 } },
            { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: { min: 0, max: 130 } },
            { name: 'Triglycerides', unit: 'mg/dL', normalRange: { min: 0, max: 150 } },
        ],
    },
    thyroid: {
        name: 'Thyroid Profile',
        emoji: '🧠',
        tests: [
            { name: 'TSH', unit: 'mIU/L', normalRange: { min: 0.4, max: 4.0 } },
            { name: 'Free T3 (fT3)', unit: 'pg/mL', normalRange: { min: 2.0, max: 4.4 } },
            { name: 'Free T4 (fT4)', unit: 'ng/dL', normalRange: { min: 0.9, max: 1.7 } },
        ],
    },
    vitamins: {
        name: 'Vitamins & Minerals',
        emoji: '🦴',
        tests: [
            { name: 'Vitamin D (25-OH)', unit: 'ng/mL', normalRange: { min: 30, max: 100 } },
            { name: 'Vitamin B12', unit: 'pg/mL', normalRange: { min: 200, max: 900 } },
            { name: 'Calcium', unit: 'mmol/L', normalRange: { min: 2.2, max: 2.6 } },
            { name: 'Iron (Serum)', unit: 'µg/dL', normalRange: { min: 60, max: 170 } },
            { name: 'Ferritin', unit: 'ng/mL', normalRange: { min: 15, max: 400 } },
        ],
    },
    kidney: {
        name: 'Kidney Function (KFT)',
        emoji: '🧂',
        tests: [
            { name: 'Creatinine', unit: 'mg/dL', normalRange: { min: 0.6, max: 1.2 } },
            { name: 'Urea', unit: 'mg/dL', normalRange: { min: 10, max: 50 } },
            { name: 'Uric Acid', unit: 'mg/dL', normalRange: { min: 2.4, max: 7.0 } },
            { name: 'Sodium (Na⁺)', unit: 'mmol/L', normalRange: { min: 135, max: 145 } },
            { name: 'Potassium (K⁺)', unit: 'mmol/L', normalRange: { min: 3.5, max: 5.1 } },
        ],
    },
    liver: {
        name: 'Liver Function (LFT)',
        emoji: '🫀',
        tests: [
            { name: 'ALT (GPT)', unit: 'U/L', normalRange: { min: 0, max: 50 } },
            { name: 'AST (GOT)', unit: 'U/L', normalRange: { min: 0, max: 50 } },
            { name: 'Alkaline Phosphatase', unit: 'U/L', normalRange: { min: 40, max: 130 } },
            { name: 'Total Bilirubin', unit: 'mg/dL', normalRange: { min: 0.2, max: 1.2 } },
            { name: 'Albumin', unit: 'g/dL', normalRange: { min: 3.5, max: 5.0 } },
        ],
    },
    inflammation: {
        name: 'Inflammation Markers',
        emoji: '🦠',
        tests: [
            { name: 'CRP', unit: 'mg/L', normalRange: { min: 0, max: 5 } },
            { name: 'ESR', unit: 'mm/hr', normalRange: { min: 0, max: 20 } },
        ],
    },
};

// Quick add popular tests
const popularTests = [
    { name: 'Hemoglobin', unit: 'g/dL', normalRange: { min: 12.0, max: 17.5 } },
    { name: 'Fasting Blood Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 99 } },
    { name: 'HbA1c', unit: '%', normalRange: { min: 4.0, max: 5.6 } },
    { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: { min: 0, max: 200 } },
    { name: 'TSH', unit: 'mIU/L', normalRange: { min: 0.4, max: 4.0 } },
    { name: 'Vitamin D (25-OH)', unit: 'ng/mL', normalRange: { min: 30, max: 100 } },
    { name: 'Creatinine', unit: 'mg/dL', normalRange: { min: 0.6, max: 1.2 } },
    { name: 'ALT (GPT)', unit: 'U/L', normalRange: { min: 0, max: 50 } },
];

const aiSuggestions: Record<string, { low: string; high: string }> = {
    'Hemoglobin': {
        low: 'Low hemoglobin may indicate anemia. Consider iron-rich foods like spinach and red meat.',
        high: 'Elevated hemoglobin. Stay hydrated and consult your physician.',
    },
    'Fasting Blood Glucose': {
        low: 'Blood sugar is low. Ensure regular meals and monitor for hypoglycemia symptoms.',
        high: 'Elevated blood sugar (prediabetic range). Consider dietary changes and consult your doctor.',
    },
    'HbA1c': {
        low: 'Low HbA1c is generally not a concern.',
        high: 'Elevated HbA1c indicates poor blood sugar control. Discuss diabetes management with your doctor.',
    },
    'Total Cholesterol': {
        low: 'Low cholesterol is generally not a concern.',
        high: 'Elevated cholesterol. Consider a heart-healthy diet low in saturated fats.',
    },
    'LDL Cholesterol': {
        low: 'Low LDL cholesterol is desirable.',
        high: 'High LDL ("bad" cholesterol). Increase fiber intake and consider statin therapy consultation.',
    },
    'HDL Cholesterol': {
        low: 'Low HDL ("good" cholesterol). Increase physical activity and omega-3 fatty acids.',
        high: 'High HDL is generally protective for heart health.',
    },
    'Triglycerides': {
        low: 'Low triglycerides are not usually a concern.',
        high: 'Elevated triglycerides. Reduce sugar and refined carbohydrate intake.',
    },
    'Vitamin D (25-OH)': {
        low: 'Vitamin D deficiency. Consider supplementation (60,000 IU weekly) or increased sun exposure.',
        high: 'High Vitamin D levels. Review any supplements with your doctor.',
    },
    'Vitamin B12': {
        low: 'Vitamin B12 deficiency. Consider B12 supplements or fortified foods.',
        high: 'High B12 is usually not harmful. Discuss with your doctor if concerned.',
    },
    'TSH': {
        low: 'Low TSH may indicate hyperthyroidism. Consult an endocrinologist for evaluation.',
        high: 'Elevated TSH may indicate hypothyroidism. Thyroid hormone replacement may be needed.',
    },
    'Creatinine': {
        low: 'Low creatinine is usually not a concern.',
        high: 'Elevated creatinine may indicate kidney function issues. Stay hydrated and consult your doctor.',
    },
    'ALT (GPT)': {
        low: 'Low ALT is not usually a concern.',
        high: 'Elevated ALT may indicate liver stress. Limit alcohol and consult your doctor.',
    },
    'AST (GOT)': {
        low: 'Low AST is not usually a concern.',
        high: 'Elevated AST may indicate liver or muscle damage. Medical evaluation recommended.',
    },
    'CRP': {
        low: 'Low CRP indicates minimal inflammation.',
        high: 'Elevated CRP indicates inflammation in the body. Further investigation may be needed.',
    },
    'Iron (Serum)': {
        low: 'Low iron may indicate iron deficiency. Consider iron-rich foods or supplements.',
        high: 'High iron levels. May need further testing for hemochromatosis.',
    },
    'Ferritin': {
        low: 'Low ferritin indicates depleted iron stores. Iron supplementation may be needed.',
        high: 'Elevated ferritin may indicate iron overload or inflammation.',
    },
};

export default function LabReportManager() {
    const { labReports, addLabReport, deleteLabReport } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportName, setReportName] = useState('');
    const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [labValues, setLabValues] = useState<Omit<LabValue, 'id' | 'trend'>[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const getTrendIcon = (trend: TrendDirection) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={16} className="text-[var(--signal-red)]" />;
            case 'down':
                return <TrendingDown size={16} className="text-[var(--spital-gold)]" />;
            default:
                return <Minus size={16} className="text-[var(--success)]" />;
        }
    };

    const getStatusBadge = (trend: TrendDirection) => {
        switch (trend) {
            case 'up':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--signal-red)]/15 text-[var(--signal-red)]">🔴 High</span>;
            case 'down':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--spital-gold)]/15 text-[var(--spital-gold)]">🟡 Low</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success)]/15 text-[var(--success)]">🟢 Normal</span>;
        }
    };

    const calculateTrend = (value: number, normalRange: { min: number; max: number }): TrendDirection => {
        if (value < normalRange.min) return 'down';
        if (value > normalRange.max) return 'up';
        return 'normal';
    };

    const handleAddLabValue = (test: { name: string; unit: string; normalRange: { min: number; max: number } }) => {
        if (!labValues.find((v) => v.name === test.name)) {
            setLabValues([
                ...labValues,
                {
                    name: test.name,
                    value: 0,
                    unit: test.unit,
                    normalRange: test.normalRange,
                    date: reportDate,
                },
            ]);
        }
    };

    const handleUpdateValue = (index: number, value: number) => {
        const updated = [...labValues];
        updated[index].value = value;
        setLabValues(updated);
    };

    const handleRemoveValue = (index: number) => {
        setLabValues(labValues.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!reportName || labValues.length === 0) return;

        const valuesWithTrends: LabValue[] = labValues.map((v) => ({
            ...v,
            id: uuidv4(),
            trend: calculateTrend(v.value, v.normalRange),
        }));

        const newReport: LabReport = {
            id: uuidv4(),
            name: reportName,
            date: reportDate,
            values: valuesWithTrends,
        };

        addLabReport(newReport);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setReportName('');
        setReportDate(format(new Date(), 'yyyy-MM-dd'));
        setLabValues([]);
        setSearchQuery('');
        setSelectedCategory(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this lab report?')) {
            deleteLabReport(id);
        }
    };

    const getAISuggestion = (value: LabValue): string | null => {
        const suggestions = aiSuggestions[value.name];
        if (!suggestions) return null;
        if (value.trend === 'down') return suggestions.low;
        if (value.trend === 'up') return suggestions.high;
        return null;
    };

    // Get all tests for search
    const allTests = Object.values(labCategories).flatMap((cat) => cat.tests);
    const filteredTests = searchQuery
        ? allTests.filter((test) => test.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    // Abnormal values for AI insights
    const abnormalValues = labReports.flatMap((report) =>
        report.values.filter((v) => v.trend !== 'normal')
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-[var(--text-secondary)]">
                    {labReports.length} report{labReports.length !== 1 ? 's' : ''} recorded
                </p>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add Report
                </button>
            </div>

            {/* AI Insights */}
            {abnormalValues.length > 0 && (
                <div className="ai-summary-card">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center flex-shrink-0">
                            <Sparkles size={20} className="text-[var(--spital-green)]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="ai-badge">AI Insight</span>
                            </div>
                            <p className="text-[var(--text-primary)]">
                                {abnormalValues.length} value{abnormalValues.length > 1 ? 's' : ''} outside normal range require attention.
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                ⚕️ Values are for informational purposes and do not replace medical consultation.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reports List */}
            <div className="space-y-4">
                {labReports.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <TestTube size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                        <p className="text-[var(--text-secondary)]">No lab reports yet</p>
                        <p className="text-sm text-[var(--text-muted)]">Add your blood test results to track your health</p>
                    </div>
                ) : (
                    labReports.map((report) => (
                        <div key={report.id} className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">{report.name}</h3>
                                    <p className="text-sm text-[var(--text-muted)]">{format(new Date(report.date), 'dd MMMM yyyy')}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(report.id)}
                                    className="p-2 rounded-lg bg-[var(--spital-slate)] text-[var(--signal-red)] hover:bg-[var(--signal-red)] hover:text-white transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {report.values.map((value) => {
                                    const suggestion = getAISuggestion(value);
                                    return (
                                        <div key={value.id} className="bg-[var(--spital-slate)] rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${value.trend === 'normal'
                                                        ? 'bg-[var(--success)]/20'
                                                        : value.trend === 'up'
                                                            ? 'bg-[var(--signal-red)]/20'
                                                            : 'bg-[var(--spital-gold)]/20'
                                                        }`}>
                                                        {getTrendIcon(value.trend)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--text-primary)]">{value.name}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">
                                                            Ref: {value.normalRange.min} – {value.normalRange.max} {value.unit}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-3">
                                                    <div>
                                                        <p className={`text-xl font-bold ${value.trend === 'normal'
                                                            ? 'text-[var(--success)]'
                                                            : value.trend === 'up'
                                                                ? 'text-[var(--signal-red)]'
                                                                : 'text-[var(--spital-gold)]'
                                                            }`}>
                                                            {value.value}
                                                            <span className="text-sm font-normal ml-1">{value.unit}</span>
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(value.trend)}
                                                </div>
                                            </div>
                                            {suggestion && (
                                                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-[var(--border-color)]">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle size={14} className="text-[var(--spital-gold)] mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm text-[var(--text-secondary)]">{suggestion}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* EU Disclaimer */}
                            <p className="text-xs text-[var(--text-muted)] mt-4 text-center italic">
                                Values are provided for informational purposes and do not replace medical consultation.
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Simplified Add Lab Report Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Lab Report" size="lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Step 1: Report Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Report Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                placeholder="e.g., Annual Checkup"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Step 2: Quick Search */}
                    <div>
                        <label className="input-label">Search Tests</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search tests (e.g., Hemoglobin, TSH, Cholesterol)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && filteredTests.length > 0 && (
                            <div className="mt-2 bg-white border border-[var(--border-color)] rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                {filteredTests.slice(0, 6).map((test) => (
                                    <button
                                        key={test.name}
                                        type="button"
                                        onClick={() => {
                                            handleAddLabValue(test);
                                            setSearchQuery('');
                                        }}
                                        disabled={labValues.some((v) => v.name === test.name)}
                                        className="w-full text-left px-4 py-2 hover:bg-[var(--spital-slate)] flex justify-between items-center disabled:opacity-50 disabled:bg-gray-100"
                                    >
                                        <span className="text-[var(--text-primary)]">{test.name}</span>
                                        <span className="text-xs text-[var(--text-muted)]">{test.unit}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Quick Add Popular Tests */}
                    {!searchQuery && (
                        <div>
                            <label className="input-label flex items-center gap-2">
                                ⭐ Popular Tests
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {popularTests.map((test) => {
                                    const isAdded = labValues.some((v) => v.name === test.name);
                                    return (
                                        <button
                                            key={test.name}
                                            type="button"
                                            onClick={() => handleAddLabValue(test)}
                                            disabled={isAdded}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${isAdded
                                                ? 'bg-[var(--success)] text-white'
                                                : 'border border-[var(--spital-gold)] text-[var(--spital-gold)] hover:bg-[var(--spital-gold)] hover:text-[var(--spital-green)]'
                                                }`}
                                        >
                                            {isAdded ? <Check size={14} className="inline mr-1" /> : '+ '}
                                            {test.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Browse by Category */}
                    {!searchQuery && (
                        <div>
                            <label className="input-label">Browse by Category</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(labCategories).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedCategory === key
                                            ? 'bg-[var(--spital-green)] text-white'
                                            : 'bg-[var(--spital-slate)] text-[var(--text-primary)] hover:bg-[var(--spital-slate-dark)]'
                                            }`}
                                    >
                                        {cat.emoji} {cat.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>

                            {selectedCategory && (
                                <div className="bg-[var(--spital-slate)] rounded-xl p-3 grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                                    {labCategories[selectedCategory as keyof typeof labCategories].tests.map((test) => {
                                        const isAdded = labValues.some((v) => v.name === test.name);
                                        return (
                                            <button
                                                key={test.name}
                                                type="button"
                                                onClick={() => handleAddLabValue(test)}
                                                disabled={isAdded}
                                                className={`text-left p-2 rounded-lg transition-colors ${isAdded
                                                    ? 'bg-[var(--success)]/20 border border-[var(--success)]'
                                                    : 'bg-white hover:bg-[var(--spital-slate-dark)]'
                                                    }`}
                                            >
                                                <p className="text-sm text-[var(--text-primary)] flex items-center gap-1">
                                                    {isAdded && <Check size={12} className="text-[var(--success)]" />}
                                                    {test.name}
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)]">{test.unit}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Enter Values */}
                    {labValues.length > 0 && (
                        <div>
                            <label className="input-label">Enter Your Values ({labValues.length})</label>
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {labValues.map((value, index) => (
                                    <div key={value.name} className="flex items-center gap-2 bg-[var(--spital-slate)] border border-[var(--border-color)] rounded-xl px-4 py-3">
                                        <span className="flex-1 font-medium text-[var(--text-primary)] text-sm">{value.name}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-24 px-3 py-2 text-center border border-[var(--border-color)] rounded-lg bg-white focus:border-[var(--spital-gold)] focus:outline-none text-[var(--text-primary)] font-medium"
                                            value={value.value || ''}
                                            onChange={(e) => handleUpdateValue(index, parseFloat(e.target.value) || 0)}
                                            placeholder="Value"
                                        />
                                        <span className="text-sm text-[var(--text-muted)] w-20 text-right">{value.unit}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveValue(index)}
                                            className="p-1.5 text-[var(--signal-red)] hover:bg-[var(--signal-red)]/10 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                Ref: Reference range shown after saving
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!reportName || labValues.length === 0 || labValues.some(v => v.value === 0)}
                            className="btn-primary disabled:opacity-50"
                        >
                            Save Report
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
