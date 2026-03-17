import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { FaFilePdf, FaFileWord, FaFile, FaFileAlt, FaEye, FaTrash, FaEllipsisV } from 'react-icons/fa';
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
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdownId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

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
                        Comienza subiendo tu primer documento a continuación
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
                <div className="w-full overflow-visible">
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
                                <tr key={doc.id} className="transition-colors">
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
                                        <div className="flex gap-2 justify-end items-center relative">
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
                                                <div className='relative'>
                                                    <button
                                                        onClick={(e) => toggleDropdown(e, doc.id)}
                                                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors duration-300 cursor-pointer"
                                                        title="Opciones"
                                                    >
                                                        <FaEllipsisV className="w-4 h-4" />
                                                    </button>

                                                    {openDropdownId === doc.id && (
                                                        <div className={`absolute right-0 top-full mb-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200`} onClick={(e) => e.stopPropagation()}>
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => {
                                                                        onDocumentDelete(doc.id);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors duration-300"
                                                                >
                                                                    <FaTrash className="w-4 h-4" />
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
