import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '../../API/tags';
import type { Tag } from '../../API/tags';
import { FiPlus, FiTag, FiTrash2, FiLoader } from 'react-icons/fi';

interface TagManagerProps {
    projectId: string;
}

const PRESET_COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
];

export default function TagManager({ projectId }: TagManagerProps) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3B82F6');

    const { data: tags = [], isLoading } = useQuery({
        queryKey: ['tags', projectId],
        queryFn: () => tagApi.list(projectId),
        enabled: !!projectId,
    });

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

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-gray-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Tags del proyecto</h2>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                    <FiPlus className="w-3.5 h-3.5" />
                    Nuevo tag
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Fatiga Crónica"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
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
                                className="w-6 h-6 rounded cursor-pointer border-0"
                                title="Color personalizado"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || createMutation.isPending}
                            className="flex-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            {createMutation.isPending && <FiLoader className="w-3 h-3 animate-spin" />}
                            Crear
                        </button>
                    </div>
                    {createMutation.isError && (
                        <p className="text-xs text-red-600">
                            {(createMutation.error as any)?.response?.data?.message || 'Error al crear el tag'}
                        </p>
                    )}
                </form>
            )}

            {isLoading ? (
                <div className="flex items-center gap-2 py-2">
                    <FiLoader className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-xs text-gray-400">Cargando tags...</span>
                </div>
            ) : tags.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No hay tags todavía</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag: Tag) => (
                        <div
                            key={tag._id}
                            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                        >
                            <span>{tag.name}</span>
                            <button
                                onClick={() => deleteMutation.mutate(tag._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-200"
                                title="Eliminar tag"
                            >
                                <FiTrash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
