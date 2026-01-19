'use client';

import Header from '@/components/Header';
import AppointmentManager from '@/components/AppointmentManager';

export default function AppointmentsPage() {
    return (
        <div className="space-y-4 sm:space-y-8">
            <Header
                title="Doctor Appointments"
                subtitle="Schedule and manage your healthcare appointments"
            />
            <AppointmentManager />
        </div>
    );
}
