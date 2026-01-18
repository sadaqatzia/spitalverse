'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/store';
import { Shield, Download, Trash2, Lock, Eye, FileJson, AlertTriangle, CheckCircle, Database, UserX } from 'lucide-react';
import Modal from '@/components/Modal';

export default function PrivacyPage() {
    const { exportData, clearAllData, profile, documents, medications, labReports, appointments, healthSummaries } = useStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spitalverse-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmation.toLowerCase() === 'delete my data') {
            clearAllData();
            setShowDeleteModal(false);
            setDeleteConfirmation('');
        }
    };

    const dataStats = [
        { label: 'Profile Data', value: profile.fullName ? 'Complete' : 'Incomplete', icon: Eye },
        { label: 'Documents', value: documents.length, icon: Database },
        { label: 'Medications', value: medications.length, icon: Database },
        { label: 'Lab Reports', value: labReports.length, icon: Database },
        { label: 'Appointments', value: appointments.length, icon: Database },
        { label: 'AI Summaries', value: healthSummaries.length, icon: Database },
    ];

    return (
        <div className="space-y-8">
            <Header
                title="Privacy & My Data"
                subtitle="You own your data. Export, view, or delete it anytime."
            />

            {/* Privacy Promise Banner */}
            <div className="glass-card p-6 border-l-4 border-[var(--success)]">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--spital-green)] flex items-center justify-center flex-shrink-0">
                        <Shield size={28} className="text-[var(--spital-gold)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your Data Belongs to You</h2>
                        <p className="text-[var(--text-secondary)]">
                            At Spitalverse, we believe in complete transparency. Your health data is stored locally on your device and never shared without your explicit consent. You have full control over your information.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                                <Lock size={16} />
                                <span>Local Storage Only</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                                <CheckCircle size={16} />
                                <span>No Data Selling</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                                <Eye size={16} />
                                <span>Full Transparency</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Overview */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Database size={20} className="text-[var(--spital-gold)]" />
                    Your Data Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {dataStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="bg-[var(--spital-slate)] rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--spital-gold)]/20 flex items-center justify-center">
                                        <Icon size={16} className="text-[var(--spital-gold)]" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Export Data */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center">
                            <FileJson size={24} className="text-[var(--spital-green)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Export Your Data</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                Download all your health data in JSON format. This includes your profile, documents, medications, lab reports, appointments, and AI summaries.
                            </p>
                        </div>
                    </div>
                    <button onClick={handleExport} className="btn-primary w-full flex items-center justify-center gap-2">
                        <Download size={20} />
                        Export All Data (JSON)
                    </button>
                    {exportSuccess && (
                        <div className="mt-3 p-3 bg-[var(--success)]/20 rounded-lg flex items-center gap-2 text-[var(--success)]">
                            <CheckCircle size={18} />
                            <span className="text-sm">Data exported successfully!</span>
                        </div>
                    )}
                </div>

                {/* Delete Account */}
                <div className="glass-card p-6 border border-[var(--signal-red)]/30">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[var(--signal-red)] flex items-center justify-center">
                            <UserX size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete All Data</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                Permanently delete all your health data from this device. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="btn-danger w-full flex items-center justify-center gap-2">
                        <Trash2 size={20} />
                        Delete All My Data
                    </button>
                </div>
            </div>

            {/* Privacy Features */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-[var(--spital-gold)]" />
                    Privacy Features
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-[var(--success)]" />
                        </div>
                        <div>
                            <h4 className="font-medium text-[var(--text-primary)]">Local-First Storage</h4>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                All your data is stored directly in your browser's local storage, ensuring it never leaves your device without your permission.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-[var(--success)]" />
                        </div>
                        <div>
                            <h4 className="font-medium text-[var(--text-primary)]">No Account Required</h4>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Use Spitalverse without creating an account or providing any personal information to our servers.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-[var(--success)]" />
                        </div>
                        <div>
                            <h4 className="font-medium text-[var(--text-primary)]">Portable Data</h4>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Export your data anytime and take it with you. Your health information is never locked in.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-[var(--success)]" />
                        </div>
                        <div>
                            <h4 className="font-medium text-[var(--text-primary)]">AI Privacy</h4>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                When using AI features, only anonymized and aggregated data is sent for analysis. Full local processing is available.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                }}
                title="Delete All Data"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-[var(--signal-red)]/10 rounded-xl border border-[var(--signal-red)]/30">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={24} className="text-[var(--signal-red)] flex-shrink-0" />
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">This action is irreversible</p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    All your profile data, documents, medications, lab reports, appointments, and AI summaries will be permanently deleted from this device.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">
                            Type "delete my data" to confirm
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="delete my data"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteConfirmation('');
                            }}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation.toLowerCase() !== 'delete my data'}
                            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
