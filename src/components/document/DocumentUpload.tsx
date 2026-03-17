import { useState, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { FiUploadCloud, FiChevronDown } from 'react-icons/fi';
import { documentApi } from '../../API';

interface DocumentUploadProps {
    projectId: string;
    onUploadSuccess?: () => void;
}

export default function DocumentUpload({ onUploadSuccess, projectId }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const validateFile = useCallback((file: File): string | null => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!validTypes.includes(file.type)) {
            return 'Tipo de archivo no soportado. Solo se permiten archivos DOCX.';
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return 'El archivo es demasiado grande. Máximo 10MB.';
        }

        return null;
    }, []);

    const uploadFile = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        try {
            await documentApi.upload(selectedFile, projectId);
            onUploadSuccess?.();
            setSelectedFile(null);
        } catch {
            const errorMessage = 'Error al subir el archivo. Inténtalo de nuevo.';
            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback(
        async (e: DragEvent<HTMLLabelElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            setError(null);

            const files = Array.from(e.dataTransfer.files);
            const file = files[0];

            if (!file) return;

            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            setSelectedFile(file);
        },
        [validateFile]
    );

    const handleFileInput = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
    }, [validateFile]);

    const handleCancelFile = () => {
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button 
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <FiUploadCloud className="text-primary size-5" />
                    <span className="font-semibold text-gray-700">Subir nuevo documento</span>
                </div>
                <FiChevronDown className={`text-gray-500 size-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <div 
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-200">
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileInput}
                        disabled={isUploading}
                    />

                    <label
                        htmlFor="file-upload"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
          block relative border-2 border-dashed rounded-lg p-14 text-center transition-all ${!selectedFile && 'cursor-pointer'}
          ${isDragging ? 'border-primary bg-white' : 'border-gray-300 bg-white'}
          ${isUploading || selectedFile ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/10'}
        `}
                    >
                        {isUploading ? (
                            <div className="py-8">
                                <Spinner size="lg" text="Subiendo documento..." />
                            </div>
                        ) : selectedFile ? (
                            <div className="py-4">
                                <div className="mb-4">
                                    <FiUploadCloud className="mx-auto h-12 w-12 text-indigo-600" />
                                </div>
                                <div className="mb-4">
                                    <p className="text-lg font-semibold text-gray-900 mb-1">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-center pointer-events-auto">
                                    <Button variant="primary" onClick={uploadFile}>
                                        Subir archivo
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelFile}>
                                        Cambiar archivo
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <FiUploadCloud className="mx-auto size-14 text-primary" />
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold text-gray-700 mb-1">
                                        Arrastra tu archivo .docx aquí
                                    </h3>
                                    <p className="text-sm text-gray-400 font-semibold">
                                        o haz clic para seleccionar un archivo desde tu ordenador
                                    </p>
                                </div>

                                <p className="text-xs text-gray-400">
                                    Tamaño máximo: 10MB | Formato: .docx
                                </p>
                            </>
                        )}
                    </label>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}
