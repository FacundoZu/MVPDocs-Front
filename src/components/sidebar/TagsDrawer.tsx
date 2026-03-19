import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../../API/TagAPI';
import { FiTag, FiX, FiPlus } from 'react-icons/fi';
import { LuHash } from 'react-icons/lu';
import { FaSearch } from 'react-icons/fa';
import { TagFormModal } from '../tags/TagFormModal';
import { TagList } from '../tags/TagList';

interface TagsDrawerProps {
    projectId: string;
    projectName: string;
    formTrigger?: number;  // se incrementa cada vez que se quiere abrir el form
    onClose: () => void;
}

export default function TagsDrawer({ projectId, projectName, formTrigger = 0, onClose }: TagsDrawerProps) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(formTrigger > 0);

    // Abre el formulario cada vez que formTrigger incrementa (incluso si ya era > 0)
    useEffect(() => {
        if (formTrigger > 0) setIsModalOpen(true);
    }, [formTrigger]);

    const { data: tags = [], isLoading } = useQuery({
        queryKey: ['tags', projectId],
        queryFn: () => getTags(projectId),
        enabled: !!projectId,
    });

    // Cerrar con Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const filtered = search.trim()
        ? tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
        : tags;

    return (
        <div className="w-80 shrink-0 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg relative">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <FiTag className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">Códigos</p>
                        <p className="text-xs text-gray-400 truncate">{projectName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        title="Nuevo código"
                        className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <FiPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onClose}
                        title="Cerrar"
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Buscador */}
            <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 bg-gray-50 rounded-lg">
                    <FaSearch className="text-gray-400 w-3 h-3 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filtrar códigos..."
                        className="w-full focus:outline-none text-xs bg-transparent text-gray-700 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Lista de tags */}
            <div className="flex-1 overflow-y-auto py-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <LuHash className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">
                            {search ? 'Sin resultados' : 'Sin códigos todavía'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-2 text-xs text-primary hover:underline"
                            >
                                Crear el primero
                            </button>
                        )}
                    </div>
                ) : (
                    <TagList tags={filtered} />
                )}
            </div>

            {/* Footer */}
            {tags.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        Nuevo código
                        <span className="ml-auto text-xs text-gray-400">{tags.length}</span>
                    </button>
                </div>
            )}

            {/* Modal de creación — overlay relativo al drawer */}
            <TagFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
            />
        </div>
    );
}
