import { Card } from '../ui/Card';
import { FaFilePdf, FaFileWord, FaFile, FaFileAlt, FaTrash } from 'react-icons/fa';
import { HiDocumentText } from 'react-icons/hi';

interface Document {
    id: string;
    name: string;
    size: number;
    uploadedAt: Date;
    type: string;
}

interface DocumentListProps {
    documents: Document[];
    onDocumentClick?: (document: Document) => void;
    onDocumentDelete?: (documentId: string) => void;
}

export default function DocumentList({
    documents,
    onDocumentClick,
    onDocumentDelete,
}: DocumentListProps) {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) {
            return <FaFilePdf className="w-8 h-8 text-red-500" />;
        }
        if (type.includes('word') || type.includes('docx')) {
            return <FaFileWord className="w-8 h-8 text-blue-500" />;
        }
        if (type.includes('text')) {
            return <FaFileAlt className="w-8 h-8 text-gray-500" />;
        }
        return <FaFile className="w-8 h-8 text-gray-500" />;
    };

    if (documents.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Comienza subiendo tu primer documento
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => (
                <Card
                    key={doc.id}
                    padding="sm"
                    hover
                    className="cursor-pointer"
                    onClick={() => onDocumentClick?.(doc)}
                >
                    <div className="flex items-center gap-4">
                        <div className="shrink-0">{getFileIcon(doc.type)}</div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                                {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                            </p>
                        </div>

                        {onDocumentDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDocumentDelete(doc.id);
                                }}
                                className="shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
                                aria-label="Eliminar documento"
                            >
                                <FaTrash className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}
