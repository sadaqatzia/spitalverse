'use client';

import { useStore } from '@/store';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const profile = useStore((state) => state.profile);
    const appointments = useStore((state) => state.appointments);
    const medications = useStore((state) => state.medications);

    const [showNotifications, setShowNotifications] = useState(false);
    const [upcomingItems, setUpcomingItems] = useState<{ type: 'appointment' | 'medication'; title: string; time: string; id: string }[]>([]);

    useEffect(() => {
        const checkUpcoming = () => {
            const now = new Date();
            const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

            const items: { type: 'appointment' | 'medication'; title: string; time: string; id: string }[] = [];

            // Check appointments - show all upcoming appointments
            appointments.forEach(apt => {
                const aptDate = new Date(`${apt.date}T${apt.time}`);
                if (aptDate > now) {
                    const day = aptDate.getDate();
                    const month = aptDate.toLocaleString('en-US', { month: 'short' });
                    const formattedDate = `${day} ${month} at ${apt.time}`;
                    items.push({
                        type: 'appointment',
                        title: `Appt: ${apt.doctorName}`,
                        time: formattedDate,
                        id: apt.id
                    });
                }
            });

            // For MVP, we'll suggest active medications are "due" if they are active
            // In a real app, we'd parse the frequency and last taken time
            medications.forEach(med => {
                if (med.status === 'active' && med.reminderEnabled) {
                    items.push({
                        type: 'medication',
                        title: `Take: ${med.name} (${med.dosage})`,
                        time: 'Due Now', // Placeholder logic for MVP
                        id: med.id
                    });
                }
            });

            setUpcomingItems(items);
        };

        checkUpcoming();
        const interval = setInterval(checkUpcoming, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [appointments, medications]);

    return (
        <header className="flex items-center justify-between mb-8 relative">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--spital-green)]">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[var(--text-secondary)] mt-1">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-3 rounded-xl bg-white border border-[var(--border-color)] hover:border-[var(--spital-gold)] transition-colors"
                    >
                        <Bell size={20} className="text-[var(--text-secondary)]" />
                        {upcomingItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--signal-red)] rounded-full text-xs flex items-center justify-center text-white font-medium">
                                {upcomingItems.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[var(--border-color)] z-50 overflow-hidden">
                                <div className="p-3 border-b border-[var(--border-color)] bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                                    <span className="text-xs text-[var(--text-muted)]">{upcomingItems.length} New</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {upcomingItems.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                                            No upcoming reminders
                                        </div>
                                    ) : (
                                        upcomingItems.map((item) => (
                                            <div key={item.id} className="p-3 border-b border-[var(--border-color)] last:border-0 hover:bg-gray-50">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'appointment' ? 'bg-[var(--spital-gold)]' : 'bg-[var(--spital-green)]'
                                                        }`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{item.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--spital-gold)] flex items-center justify-center">
                        {profile.photo ? (
                            <Image
                                src={profile.photo}
                                alt={profile.fullName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-[var(--spital-green)] font-semibold">
                                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                            {profile.fullName || 'Guest User'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {profile.bloodGroup || 'Not set'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
