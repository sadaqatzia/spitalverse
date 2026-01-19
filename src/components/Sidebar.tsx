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
    X,
} from 'lucide-react';
import { useSidebar } from './SidebarContext';

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
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <>
            <div
                className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-[var(--spital-green)] flex flex-col z-40 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className={`lg:hidden absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
                >
                    <X size={24} className="text-white" />
                </button>

                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                        <div className="w-12 h-12 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center pulse-glow">
                            <Heart className="text-[var(--spital-green)]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Spitalverse</h1>
                            <p className="text-xs text-[var(--light-gold)]">Executive Wellness</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-white/10">
                    <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                        <p className="text-[10px] text-[var(--light-gold)]">Version 1.0 MVP</p>
                        <p className="text-[10px] text-slate-500">
                            © 2026 Spitalverse. All rights reserved.
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
