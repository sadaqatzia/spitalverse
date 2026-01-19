'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Pill, Plus, Edit2, Trash2, Bell, BellOff, Calendar } from 'lucide-react';
import Modal from './Modal';
import { Medication } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const defaultMedication: Omit<Medication, 'id'> = {
    name: '',
    dosage: '',
    frequency: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: null,
    status: 'active',
    reminderEnabled: false,
    notes: '',
};

export default function MedicationList() {
    const { medications, addMedication, updateMedication, deleteMedication } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
    const [formData, setFormData] = useState<Omit<Medication, 'id'>>(defaultMedication);

    const activeMedications = medications.filter((m) => m.status === 'active');
    const completedMedications = medications.filter((m) => m.status === 'completed');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMedication) {
            updateMedication(editingMedication.id, formData);
        } else {
            addMedication({ ...formData, id: uuidv4() });
        }

        handleCloseModal();
    };

    const handleOpenModal = (medication?: Medication) => {
        if (medication) {
            setEditingMedication(medication);
            setFormData({
                name: medication.name,
                dosage: medication.dosage,
                frequency: medication.frequency,
                startDate: medication.startDate,
                endDate: medication.endDate,
                status: medication.status,
                reminderEnabled: medication.reminderEnabled,
                notes: medication.notes,
            });
        } else {
            setEditingMedication(null);
            setFormData(defaultMedication);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMedication(null);
        setFormData(defaultMedication);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this medication?')) {
            deleteMedication(id);
        }
    };

    const toggleReminder = (medication: Medication) => {
        updateMedication(medication.id, { reminderEnabled: !medication.reminderEnabled });
    };

    const markAsCompleted = (medication: Medication) => {
        updateMedication(medication.id, {
            status: 'completed',
            endDate: format(new Date(), 'yyyy-MM-dd'),
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Current Medications</h2>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">{activeMedications.length} active</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Plus size={18} />
                    Add Medication
                </button>
            </div>

            {/* Active Medications */}
            <div className="space-y-3">
                {activeMedications.length === 0 ? (
                    <div className="glass-card p-6 sm:p-8 text-center">
                        <Pill size={40} className="sm:w-12 sm:h-12 mx-auto text-[var(--text-muted)] mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-[var(--text-secondary)]">No active medications</p>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)]">Add your medications to track them</p>
                    </div>
                ) : (
                    activeMedications.map((medication) => (
                        <div key={medication.id} className="glass-card p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[var(--spital-gold)] flex items-center justify-center flex-shrink-0">
                                        <Pill size={20} className="sm:w-6 sm:h-6 text-[var(--spital-green)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">{medication.name}</h3>
                                        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                                            {medication.dosage} • {medication.frequency}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                                            <span className="status-active">Active</span>
                                            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                <Calendar size={10} className="sm:w-3 sm:h-3" />
                                                Started {format(new Date(medication.startDate), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 justify-end sm:justify-start">
                                    <button
                                        onClick={() => toggleReminder(medication)}
                                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${medication.reminderEnabled
                                            ? 'bg-[var(--spital-gold)] text-[var(--spital-green)]'
                                            : 'bg-[var(--spital-slate-dark)] text-[var(--text-muted)]'
                                            }`}
                                        title={medication.reminderEnabled ? 'Reminder on' : 'Reminder off'}
                                    >
                                        {medication.reminderEnabled ? <Bell size={16} className="sm:w-[18px] sm:h-[18px]" /> : <BellOff size={16} className="sm:w-[18px] sm:h-[18px]" />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(medication)}
                                        className="p-1.5 sm:p-2 rounded-lg bg-[var(--spital-slate-dark)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                    <button
                                        onClick={() => markAsCompleted(medication)}
                                        className="btn-secondary text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3"
                                    >
                                        Complete
                                    </button>
                                    <button
                                        onClick={() => handleDelete(medication.id)}
                                        className="p-1.5 sm:p-2 rounded-lg bg-[var(--spital-slate-dark)] text-[var(--signal-red)] hover:bg-[var(--signal-red)] hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                </div>
                            </div>
                            {medication.notes && (
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 sm:mt-3 pl-0 sm:pl-16">{medication.notes}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Completed Medications */}
            {completedMedications.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-8">
                        Completed ({completedMedications.length})
                    </h3>
                    <div className="space-y-3 opacity-70">
                        {completedMedications.map((medication) => (
                            <div key={medication.id} className="glass-card p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--spital-slate-dark)] flex items-center justify-center flex-shrink-0">
                                            <Pill size={24} className="text-[var(--text-muted)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[var(--text-secondary)]">{medication.name}</h3>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {medication.dosage} • {medication.frequency}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="status-completed">Completed</span>
                                                {medication.endDate && (
                                                    <span className="text-xs text-[var(--text-muted)]">
                                                        Ended {format(new Date(medication.endDate), 'MMM d, yyyy')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(medication.id)}
                                        className="p-2 rounded-lg bg-[var(--spital-slate-dark)] text-[var(--signal-red)] hover:bg-[var(--signal-red)] hover:text-white transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingMedication ? 'Edit Medication' : 'Add Medication'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Medicine Name *</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Metformin"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Dosage *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                placeholder="e.g., 500mg"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Frequency *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                placeholder="e.g., Twice daily"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Start Date *</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">End Date (Optional)</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.endDate || ''}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Notes</label>
                        <textarea
                            className="input-field min-h-[80px]"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Any additional notes..."
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-xl">
                        <div>
                            <p className="font-medium text-[var(--text-primary)]">Reminder</p>
                            <p className="text-sm text-[var(--text-muted)]">Get notified to take your medication</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
                            className={`toggle-switch ${formData.reminderEnabled ? 'active' : ''}`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingMedication ? 'Update' : 'Add'} Medication
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
