import { Card } from '../ui/Card';
import { FaFilePdf, FaFileWord, FaFile, FaFileAlt, FaEye, FaTrash } from 'react-icons/fa';
import type { ProjectDocument } from '../../API/projects';

interface DocumentTableProps {
    documents: ProjectDocument[];
    onDocumentView?: (document: ProjectDocument) => void;
    onDocumentDelete?: (documentId: string) => void;
}

export default function DocumentTable({
    documents,
    onDocumentView,
    onDocumentDelete,
}: DocumentTableProps) {

    // const formatFileSize = (bytes: number): string => {
    //     if (bytes === 0) return '0 Bytes';
    //     const k = 1024;
    //     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    //     const i = Math.floor(Math.log(bytes) / Math.log(k));
    //     return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    // };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
            {/* <Card padding="sm">
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
            </Card> */}

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
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => onDocumentView?.(doc)} className="flex items-center gap-3 cursor-pointer">
                                            <div className="shrink-0">{getFileIcon(doc.originalFormat)}</div>
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-md">
                                                {doc.title}
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(doc.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex gap-2 justify-end">
                                            {onDocumentView && (
                                                <button
                                                    onClick={() => onDocumentView(doc)}
                                                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors duration-300 cursor-pointer"
                                                    title="Ver documento"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDocumentDelete && (
                                                <button
                                                    onClick={() => onDocumentDelete(doc.id)}
                                                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors duration-300 cursor-pointer"
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
            </Card>
        </div>
    );
}
