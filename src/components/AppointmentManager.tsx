'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Calendar, Clock, MapPin, User, Stethoscope, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { Appointment } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, parseISO } from 'date-fns';

const specialties = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Orthopedist',
    'Neurologist',
    'Pediatrician',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Dentist',
    'Psychiatrist',
    'Endocrinologist',
];

export default function AppointmentManager() {
    const { appointments, addAppointment, updateAppointment, deleteAppointment } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [formData, setFormData] = useState({
        doctorName: '',
        specialty: 'General Physician',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        location: '',
        notes: '',
    });

    // Separate upcoming and past appointments
    const now = new Date();
    const upcomingAppointments = appointments
        .filter((apt) => isAfter(parseISO(`${apt.date}T${apt.time}`), now))
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    const pastAppointments = appointments
        .filter((apt) => !isAfter(parseISO(`${apt.date}T${apt.time}`), now))
        .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isUpcoming = isAfter(parseISO(`${formData.date}T${formData.time}`), now);

        if (editingAppointment) {
            updateAppointment(editingAppointment.id, { ...formData, isUpcoming });
        } else {
            addAppointment({ ...formData, id: uuidv4(), isUpcoming });
        }

        handleCloseModal();
    };

    const handleOpenModal = (appointment?: Appointment) => {
        if (appointment) {
            setEditingAppointment(appointment);
            setFormData({
                doctorName: appointment.doctorName,
                specialty: appointment.specialty,
                date: appointment.date,
                time: appointment.time,
                location: appointment.location,
                notes: appointment.notes || '',
            });
        } else {
            setEditingAppointment(null);
            setFormData({
                doctorName: '',
                specialty: 'General Physician',
                date: format(new Date(), 'yyyy-MM-dd'),
                time: '10:00',
                location: '',
                notes: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAppointment(null);
        setFormData({
            doctorName: '',
            specialty: 'General Physician',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '10:00',
            location: '',
            notes: '',
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            deleteAppointment(id);
        }
    };

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Appointments</h2>
                    <p className="text-sm text-[var(--text-muted)]">{upcomingAppointments.length} upcoming</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Book Appointment
                </button>
            </div>

            {/* Upcoming Appointments */}
            <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-[var(--primary-400)]" />
                    Upcoming Appointments
                </h3>
                {upcomingAppointments.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <Calendar size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                        <p className="text-[var(--text-secondary)]">No upcoming appointments</p>
                        <p className="text-sm text-[var(--text-muted)]">Book an appointment with your doctor</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingAppointments.map((apt) => (
                            <div key={apt.id} className="appointment-card">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center flex-shrink-0">
                                            <Stethoscope size={28} className="text-[var(--spital-green)]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[var(--text-primary)] text-lg">{apt.doctorName}</h4>
                                            <p className="text-[var(--spital-gold)] font-medium">{apt.specialty}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <Calendar size={14} />
                                                    {format(new Date(apt.date), 'EEEE, MMMM d, yyyy')}
                                                </span>
                                                <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <Clock size={14} />
                                                    {formatTime(apt.time)}
                                                </span>
                                                {apt.location && (
                                                    <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                        <MapPin size={14} />
                                                        {apt.location}
                                                    </span>
                                                )}
                                            </div>
                                            {apt.notes && (
                                                <p className="text-sm text-[var(--text-muted)] mt-2">{apt.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenModal(apt)}
                                            className="p-2 rounded-lg bg-[var(--spital-slate-dark)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(apt.id)}
                                            className="p-2 rounded-lg bg-[var(--spital-slate-dark)] text-[var(--signal-red)] hover:bg-[var(--signal-red)] hover:text-white transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                        Past Appointments ({pastAppointments.length})
                    </h3>
                    <div className="space-y-3 opacity-70">
                        {pastAppointments.slice(0, 5).map((apt) => (
                            <div key={apt.id} className="glass-card p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                                            <User size={20} className="text-[var(--text-muted)]" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-secondary)]">{apt.doctorName}</p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {apt.specialty} • {format(new Date(apt.date), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(apt.id)}
                                        className="p-2 rounded-lg text-[var(--danger-500)] hover:bg-[var(--danger-500)]/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingAppointment ? 'Edit Appointment' : 'Book Appointment'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Doctor Name *</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.doctorName}
                            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                            placeholder="Dr. John Smith"
                            required
                        />
                    </div>

                    <div>
                        <label className="input-label">Specialty *</label>
                        <select
                            className="input-field"
                            value={formData.specialty}
                            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        >
                            {specialties.map((spec) => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Date *</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Time *</label>
                            <input
                                type="time"
                                className="input-field"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Location</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., City Hospital, Room 302"
                        />
                    </div>

                    <div>
                        <label className="input-label">Notes</label>
                        <textarea
                            className="input-field min-h-[80px]"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Any additional notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingAppointment ? 'Update' : 'Book'} Appointment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
