import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../../API/TagAPI';
import { FiX, FiTag } from 'react-icons/fi';
import { LuHash } from 'react-icons/lu';

interface TagsDrawerProps {
    projectId: string;
    projectName: string;
    onClose: () => void;
}

export default function TagsDrawer({ projectId, projectName, onClose }: TagsDrawerProps) {
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

    return (
        <div className="w-56 shrink-0 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <FiTag className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">Códigos</p>
                        <p className="text-xs text-gray-400 truncate">{projectName}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                >
                    <FiX className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Lista de tags */}
            <div className="flex-1 overflow-y-auto py-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tags.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <LuHash className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Sin códigos todavía</p>
                    </div>
                ) : (
                    <ul className="px-2 space-y-0.5">
                        {tags.map((tag) => (
                            <li key={tag._id}>
                                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-default">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="text-sm text-gray-700 truncate flex-1">{tag.name}</span>
                                    {tag.usageCount > 0 && (
                                        <span className="text-xs text-gray-400 shrink-0 group-hover:text-gray-500">
                                            {tag.usageCount}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer con total */}
            {tags.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        {tags.length} código{tags.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}
