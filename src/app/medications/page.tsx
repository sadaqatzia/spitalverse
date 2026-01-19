'use client';

import Header from '@/components/Header';
import MedicationList from '@/components/MedicationList';

export default function MedicationsPage() {
    return (
        <div className="space-y-4 sm:space-y-8">
            <Header
                title="Medication Management"
                subtitle="Track your current medications, dosages, and schedules"
            />
            <MedicationList />
        </div>
    );
}
