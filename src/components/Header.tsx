'use client';

import { useStore } from '@/store';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const profile = useStore((state) => state.profile);

    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--spital-green)]">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[var(--text-secondary)] mt-1">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 bg-white border border-[var(--border-color)] rounded-xl px-4 py-2">
                    <Search size={18} className="text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-40 text-[var(--text-primary)]"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-3 rounded-xl bg-white border border-[var(--border-color)] hover:border-[var(--spital-gold)] transition-colors">
                    <Bell size={20} className="text-[var(--text-secondary)]" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--signal-red)] rounded-full text-xs flex items-center justify-center text-white font-medium">
                        3
                    </span>
                </button>

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
