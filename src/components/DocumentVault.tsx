'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { FileText, Image as ImageIcon, Download, Trash2, Eye, Plus, Filter, File } from 'lucide-react';
import Modal from './Modal';
import FileUpload from './FileUpload';
import { MedicalDocument, DocumentCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const categoryLabels: Record<DocumentCategory, string> = {
    labs: 'Lab Reports',
    prescriptions: 'Prescriptions',
    imaging: 'Imaging (X-ray, MRI, CT)',
    discharge: 'Discharge Summaries',
};

const categoryColors: Record<DocumentCategory, string> = {
    labs: 'bg-[var(--spital-green)]',
    prescriptions: 'bg-[var(--spital-gold)]',
    imaging: 'bg-[var(--spital-green-light)]',
    discharge: 'bg-[var(--success)]',
};

export default function DocumentVault() {
    const { documents, addDocument, deleteDocument } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<MedicalDocument | null>(null);
    const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'labs' as DocumentCategory,
    });

    const filteredDocuments = filterCategory === 'all'
        ? documents
        : documents.filter((d) => d.category === filterCategory);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newDocument: MedicalDocument = {
                id: uuidv4(),
                name: formData.name || selectedFile.name,
                category: formData.category,
                fileType: selectedFile.type.includes('pdf') ? 'pdf' : 'image',
                fileUrl: reader.result as string,
                uploadDate: new Date().toISOString(),
                fileSize: selectedFile.size,
            };
            addDocument(newDocument);
            handleCloseModal();
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setFormData({ name: '', category: 'labs' });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            deleteDocument(id);
        }
    };

    const handleDownload = (doc: MedicalDocument) => {
        const a = window.document.createElement('a');
        a.href = doc.fileUrl;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getDocumentIcon = (doc: MedicalDocument) => {
        if (doc.fileType === 'image') {
            return <ImageIcon size={24} className="text-white" />;
        }
        return <FileText size={24} className="text-white" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Medical Documents</h2>
                    <p className="text-sm text-[var(--text-muted)]">{documents.length} documents</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter */}
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2">
                        <Filter size={18} className="text-[var(--text-muted)]" />
                        <select
                            className="bg-transparent border-none outline-none text-sm"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | 'all')}
                        >
                            <option value="all">All Categories</option>
                            {(Object.keys(categoryLabels) as DocumentCategory[]).map((cat) => (
                                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        Upload
                    </button>
                </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(categoryLabels) as DocumentCategory[]).map((cat) => {
                    const count = documents.filter((d) => d.category === cat).length;
                    return (
                        <div
                            key={cat}
                            className="glass-card p-4 cursor-pointer"
                            onClick={() => setFilterCategory(cat)}
                        >
                            <div className={`w-10 h-10 rounded-xl ${categoryColors[cat]} flex items-center justify-center mb-3`}>
                                <File size={20} className="text-white" />
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{count}</p>
                            <p className="text-xs text-[var(--text-muted)]">{categoryLabels[cat]}</p>
                        </div>
                    );
                })}
            </div>

            {/* Documents List */}
            <div className="space-y-3">
                {filteredDocuments.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                        <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                        <p className="text-[var(--text-secondary)]">No documents found</p>
                        <p className="text-sm text-[var(--text-muted)]">Upload your medical documents to keep them safe</p>
                    </div>
                ) : (
                    filteredDocuments.map((doc) => (
                        <div key={doc.id} className="document-card">
                            <div className={`w-12 h-12 rounded-xl ${categoryColors[doc.category]} flex items-center justify-center flex-shrink-0`}>
                                {getDocumentIcon(doc)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-[var(--text-primary)] truncate">{doc.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                    <span className="tag">{categoryLabels[doc.category]}</span>
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                    <span>{format(new Date(doc.uploadDate), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPreviewDocument(doc)}
                                    className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    title="Preview"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    title="Download"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--danger-500)] hover:bg-[var(--danger-500)] hover:text-white transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Upload Document"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FileUpload onFileSelect={(file) => setSelectedFile(file)} />

                    {selectedFile && (
                        <>
                            <div>
                                <label className="input-label">Document Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={selectedFile.name}
                                />
                            </div>

                            <div>
                                <label className="input-label">Category *</label>
                                <select
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DocumentCategory })}
                                >
                                    {(Object.keys(categoryLabels) as DocumentCategory[]).map((cat) => (
                                        <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={!selectedFile}>
                            Upload Document
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Preview Modal */}
            <Modal
                isOpen={!!previewDocument}
                onClose={() => setPreviewDocument(null)}
                title={previewDocument?.name || 'Document Preview'}
                size="lg"
            >
                {previewDocument && (
                    <div className="space-y-4">
                        {previewDocument.fileType === 'image' ? (
                            <img
                                src={previewDocument.fileUrl}
                                alt={previewDocument.name}
                                className="w-full rounded-xl"
                            />
                        ) : (
                            <iframe
                                src={previewDocument.fileUrl}
                                className="w-full h-[500px] rounded-xl"
                                title={previewDocument.name}
                            />
                        )}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-[var(--text-muted)]">
                                <p>Uploaded: {format(new Date(previewDocument.uploadDate), 'MMMM d, yyyy')}</p>
                                <p>Size: {formatFileSize(previewDocument.fileSize)}</p>
                            </div>
                            <button
                                onClick={() => handleDownload(previewDocument)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
