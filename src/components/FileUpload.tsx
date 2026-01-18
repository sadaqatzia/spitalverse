'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, File, Image as ImageIcon, X } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // in MB
}

export default function FileUpload({
    onFileSelect,
    accept = '.pdf,.jpg,.jpeg,.png,.webp',
    maxSize = 10
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon size={24} className="text-[var(--primary-400)]" />;
        }
        return <File size={24} className="text-[var(--accent-400)]" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            {!selectedFile ? (
                <div
                    className={`upload-zone ${isDragging ? 'dragover' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        className="hidden"
                    />
                    <Upload size={48} className="mx-auto text-[var(--primary-400)] mb-4" />
                    <p className="text-[var(--text-primary)] font-medium mb-2">
                        Click or drag file to upload
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                        Supports PDF, JPG, PNG, WEBP (Max {maxSize}MB)
                    </p>
                </div>
            ) : (
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getFileIcon(selectedFile)}
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearSelection}
                            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <X size={18} className="text-[var(--text-secondary)]" />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-[var(--danger-500)] text-center">{error}</p>
            )}
        </div>
    );
}
