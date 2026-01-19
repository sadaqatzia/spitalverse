'use client';

import { useStore } from '@/store';
import { Bell, Menu, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSidebar } from './SidebarContext';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const profile = useStore((state) => state.profile);
    const appointments = useStore((state) => state.appointments);
    const medications = useStore((state) => state.medications);
    const { toggle, isOpen } = useSidebar();

    const [showNotifications, setShowNotifications] = useState(false);
    const [upcomingItems, setUpcomingItems] = useState<{ type: 'appointment' | 'medication'; title: string; time: string; id: string }[]>([]);

    useEffect(() => {
        const checkUpcoming = () => {
            const now = new Date();
            const items: { type: 'appointment' | 'medication'; title: string; time: string; id: string }[] = [];

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

            medications.forEach(med => {
                if (med.status === 'active' && med.reminderEnabled) {
                    items.push({
                        type: 'medication',
                        title: `Take: ${med.name} (${med.dosage})`,
                        time: 'Due Now',
                        id: med.id
                    });
                }
            });

            setUpcomingItems(items);
        };

        checkUpcoming();
        const interval = setInterval(checkUpcoming, 60000);
        return () => clearInterval(interval);
    }, [appointments, medications]);

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[var(--border-color)] px-3 py-2 flex items-center justify-between">
                <button
                    onClick={toggle}
                    className={`p-2 rounded-lg bg-[var(--spital-slate)] transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <Menu size={22} className="text-[var(--spital-green)]" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--spital-gold)] flex items-center justify-center">
                        <Heart className="text-[var(--spital-green)]" size={16} />
                    </div>
                    <span className="text-base font-bold text-[var(--spital-green)]">Spitalverse</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg bg-[var(--spital-slate)]"
                    >
                        <Bell size={18} className="text-[var(--spital-green)]" />
                        {upcomingItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--signal-red)] rounded-full text-[10px] flex items-center justify-center text-white font-medium">
                                {upcomingItems.length}
                            </span>
                        )}
                    </button>

                    <Link href="/" className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--spital-gold)] flex items-center justify-center">
                        {profile.photo ? (
                            <Image
                                src={profile.photo}
                                alt={profile.fullName}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm text-[var(--spital-green)] font-semibold">
                                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <header className="hidden lg:flex items-center justify-between mb-8 relative">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-[var(--spital-green)] truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">{subtitle}</p>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
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
                    </div>

                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                                <span className="text-base text-[var(--spital-green)] font-semibold">
                                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                {profile.fullName || 'Guest User'}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                                {profile.bloodGroup || 'Not set'}
                            </p>
                        </div>
                    </Link>
                </div>
            </header>

            <div className="lg:hidden mb-4">
                <h1 className="text-xl font-bold text-[var(--spital-green)]">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
                )}
            </div>

            {showNotifications && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowNotifications(false)}
                    />
                    <div className="fixed left-2 right-2 top-14 lg:left-auto lg:right-8 lg:top-20 lg:w-80 bg-white rounded-xl shadow-xl border border-[var(--border-color)] z-50 overflow-hidden">
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
                                            <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'appointment' ? 'bg-[var(--spital-gold)]' : 'bg-[var(--spital-green)]'}`} />
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
        </>
    );
}
