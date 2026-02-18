import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '../../API/tags';
import type { Tag } from '../../API/tags';
import type { Quote } from '../../API/quotes';
import { FiPlus, FiTag, FiTrash2, FiLoader, FiX, FiChevronRight, FiChevronDown, FiChevronLeft } from 'react-icons/fi';

interface TagPanelProps {
    projectId: string;
    tags: Tag[];
    quotes: Quote[];
    isOpen: boolean;
    onToggle: () => void;
    /** Cuando se monta el panel abierto para crear un tag, auto-abre el form */
    autoOpenForm?: boolean;
}

const PRESET_COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
];

export default function TagPanel({ projectId, tags, quotes, isOpen, onToggle, autoOpenForm }: TagPanelProps) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(autoOpenForm ?? false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3B82F6');
    const [expandedTagId, setExpandedTagId] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: tagApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
            setName('');
            setColor('#3B82F6');
            setShowForm(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (tagId: string) => tagApi.delete(tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        createMutation.mutate({ name: name.trim(), color, projectId });
    };

    // Agrupar citas por tagId
    const quotesByTag = (tagId: string) =>
        quotes.filter((q) => q.tags?.includes(tagId) || q.color === tags.find(t => t._id === tagId)?.color);

    // Panel colapsado: solo muestra el botón de abrir
    if (!isOpen) {
        return (
            <div className="w-10 shrink-0 border-l border-gray-200 bg-white flex flex-col items-center py-4 gap-3">
                <button
                    onClick={onToggle}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Abrir panel de tags"
                >
                    <FiChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center">
                    <span
                        className="text-xs text-gray-400 font-medium"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                        Tags
                    </span>
                </div>
            </div>
        );
    }

    return (
        <aside className="w-64 shrink-0 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
                    <span className="text-xs text-gray-400">({tags.length})</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Nuevo tag"
                    >
                        {showForm ? <FiX className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Colapsar panel"
                    >
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Formulario de creación */}
            {showForm && (
                <form onSubmit={handleCreate} className="p-3 border-b border-gray-100 space-y-3 bg-gray-50">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre del tag..."
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <div>
                        <p className="text-xs text-gray-500 mb-1.5">Color</p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                                    style={{
                                        backgroundColor: c,
                                        outline: color === c ? `2px solid ${c}` : 'none',
                                        outlineOffset: 2,
                                    }}
                                />
                            ))}
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-5 h-5 rounded cursor-pointer border-0"
                            />
                        </div>
                    </div>
                    {createMutation.isError && (
                        <p className="text-xs text-red-600">
                            {(createMutation.error as any)?.response?.data?.message || 'Error al crear'}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={!name.trim() || createMutation.isPending}
                        className="w-full py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                        {createMutation.isPending && <FiLoader className="w-3 h-3 animate-spin" />}
                        Crear tag
                    </button>
                </form>
            )}

            {/* Lista de tags con citas desplegables */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {tags.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-6 px-4">
                        No hay tags en este proyecto. Crea el primero con el botón +
                    </p>
                ) : (
                    tags.map((tag) => {
                        const tagQuotes = quotesByTag(tag._id);
                        const isExpanded = expandedTagId === tag._id;

                        return (
                            <div key={tag._id}>
                                {/* Fila del tag */}
                                <div className="group flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                                    {/* Toggle dropdown */}
                                    <button
                                        onClick={() => setExpandedTagId(isExpanded ? null : tag._id)}
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    >
                                        {tagQuotes.length > 0 ? (
                                            isExpanded
                                                ? <FiChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                : <FiChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        ) : (
                                            <span className="w-3.5 h-3.5 shrink-0" />
                                        )}
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="text-sm text-gray-700 truncate flex-1">{tag.name}</span>
                                        {tagQuotes.length > 0 && (
                                            <span className="text-xs text-gray-400 shrink-0">{tagQuotes.length}</span>
                                        )}
                                    </button>

                                    {/* Eliminar tag */}
                                    <button
                                        onClick={() => deleteMutation.mutate(tag._id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 shrink-0"
                                        title="Eliminar tag"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Citas del tag (desplegable) */}
                                {isExpanded && tagQuotes.length > 0 && (
                                    <div className="bg-gray-50 border-t border-gray-100">
                                        {tagQuotes.map((quote) => (
                                            <div
                                                key={quote._id}
                                                className="px-4 py-2.5 border-b border-gray-100 last:border-0"
                                                style={{ borderLeft: `3px solid ${tag.color}` }}
                                            >
                                                <p className="text-xs text-gray-600 italic line-clamp-3">
                                                    "{quote.position.selectedText}"
                                                </p>
                                                {quote.memo && (
                                                    <p className="text-xs text-gray-400 mt-1">{quote.memo}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
