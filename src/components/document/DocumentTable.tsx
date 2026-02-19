import { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FaFilePdf, FaFileWord, FaFile, FaFileAlt, FaEye, FaTrash, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface Document {
    id: string;
    name: string;
    size: number;
    uploadedAt: Date;
    type: string;
}

interface DocumentTableProps {
    documents: Document[];
    onDocumentView?: (document: Document) => void;
    onDocumentDelete?: (documentId: string) => void;
}

export default function DocumentTable({
    documents,
    onDocumentView,
    onDocumentDelete,
}: DocumentTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            return <FaFilePdf className="w-5 h-5 text-red-500" />;
        }
        if (type.includes('word') || type.includes('docx')) {
            return <FaFileWord className="w-5 h-5 text-blue-500" />;
        }
        if (type.includes('text')) {
            return <FaFileAlt className="w-5 h-5 text-gray-500" />;
        }
        return <FaFile className="w-5 h-5 text-gray-500" />;
    };

    const filteredAndSortedDocuments = useMemo(() => {
        const filtered = documents.filter((doc) =>
            doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            const dateA = new Date(a.uploadedAt).getTime();
            const dateB = new Date(b.uploadedAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [documents, searchTerm, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    };

    if (documents.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <FaFile className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                    <p className="text-sm text-gray-500">
                        Comienza subiendo tu primer documento usando el área de arriba
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card padding="sm">
                <div className="flex gap-3 items-center">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar documentos..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            leftIcon={<FaSearch />}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="md"
                        onClick={toggleSortOrder}
                        leftIcon={sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                    >
                        {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
                    </Button>
                </div>
            </Card>

            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Documento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha de subida
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tamaño
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="shrink-0">{getFileIcon(doc.type)}</div>
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-md">
                                                {doc.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(doc.uploadedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatFileSize(doc.size)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex gap-2 justify-end">
                                            {onDocumentView && (
                                                <button
                                                    onClick={() => onDocumentView(doc)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                    title="Ver documento"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDocumentDelete && (
                                                <button
                                                    onClick={() => onDocumentDelete(doc.id)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar documento"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredAndSortedDocuments.length)} de{' '}
                            {filteredAndSortedDocuments.length} documentos
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
