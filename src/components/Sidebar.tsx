'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    FileText,
    Pill,
    TestTube,
    Calendar,
    Brain,
    Shield,
    Heart,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/', icon: User, label: 'Dashboard' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/medications', icon: Pill, label: 'Medications' },
    { href: '/lab-reports', icon: TestTube, label: 'Lab Reports' },
    { href: '/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/ai-summary', icon: Brain, label: 'AI Summary' },
    { href: '/privacy', icon: Shield, label: 'My Data' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white border border-[var(--border-color)] shadow-md"
            >
                {isMobileOpen ? <X size={24} className="text-[var(--spital-green)]" /> : <Menu size={24} className="text-[var(--spital-green)]" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-[var(--spital-green)]/50 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-72 bg-[var(--spital-green)] 
          flex flex-col z-40 transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                        <div className="w-12 h-12 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center pulse-glow">
                            <Heart className="text-[var(--spital-green)]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Spitalverse</h1>
                            <p className="text-xs text-[var(--light-gold)]">Executive Wellness</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                        <p className="text-xs text-[var(--light-gold)] mb-1">Version 1.0 MVP</p>
                        <p className="text-[10px] text-white/60">
                            © 2024 Spitalverse
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
