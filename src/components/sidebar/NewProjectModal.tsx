import { useState } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface NewProjectModalProps {
    onClose: () => void;
    onCreated: (data: { name: string; description?: string }) => Promise<void>;
}

export default function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            await onCreated({ name: name.trim(), description: description.trim() || undefined });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al crear el proyecto');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Nuevo proyecto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Investigación Salta 2025"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción del proyecto..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
                            Crear proyecto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
