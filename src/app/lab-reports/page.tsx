'use client';

import Header from '@/components/Header';
import LabReportManager from '@/components/LabReportManager';

export default function LabReportsPage() {
    return (
        <div className="space-y-4 sm:space-y-8">
            <Header
                title="Lab Reports & Blood Tests"
                subtitle="Track your health metrics and get AI-powered insights"
            />
            <LabReportManager />
        </div>
    );
}
