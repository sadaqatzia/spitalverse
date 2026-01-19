'use client';

import Header from '@/components/Header';
import DocumentVault from '@/components/DocumentVault';

export default function DocumentsPage() {
    return (
        <div className="space-y-4 sm:space-y-8">
            <Header
                title="Medical Documents"
                subtitle="Store and organize your prescriptions, lab reports, and imaging files"
            />
            <DocumentVault />
        </div>
    );
}
