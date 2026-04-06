import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import DocumentUpload from '../components/document/DocumentUpload';
import DocumentTable from '../components/document/DocumentTable';
import Loader from '../components/ui/Loader';
import { FiFileText, FiEdit3, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

export default function ProjectDocuments() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'documents' | 'notes'>('documents');
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
    });

    const deleteMutation = useMutation({
        mutationFn: documentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const createNoteMutation = useMutation({
        mutationFn: (title: string) => documentApi.createNote(projectId!, title),
        onSuccess: (doc) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setNewNoteTitle('');
            setShowNoteInput(false);
            toast.success('Anotación creada');
            navigate(`/app/projects/${projectId}/documents/${doc._id}`);
        },
        onError: () => toast.error('Error al crear la anotación'),
    });

    if (isLoading) return <Loader />;

    if (!project) return (
        <div className="flex items-center justify-center h-full text-gray-400">
            <p>Selecciona un proyecto desde el sidebar</p>
        </div>
    );

    const sourceDocs = project.documents.filter(d => d.documentType === 'source_material');
    const notes = project.documents.filter(d => d.documentType === 'research_note');

    const tabClass = (tab: typeof activeTab) =>
        `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
        }`;

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* ── Tabs de navegación ───────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 px-8 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{project.name}</h2>
                <div className="flex gap-1">
                    <button className={tabClass('documents')} onClick={() => setActiveTab('documents')}>
                        <FiFileText className="w-4 h-4" />
                        Documentos
                        <span className="ml-1 text-xs text-gray-400">{sourceDocs.length}</span>
                    </button>
                    <button className={tabClass('notes')} onClick={() => setActiveTab('notes')}>
                        <FiEdit3 className="w-4 h-4" />
                        Mis Textos
                        <span className="ml-1 text-xs text-gray-400">{notes.length}</span>
                    </button>
                </div>
            </div>

            {/* ── Contenido ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto w-full space-y-6">

                    {/* Pestaña: Documentos */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <DocumentTable
                                documents={sourceDocs}
                                onDocumentView={(doc) => navigate(`/app/projects/${projectId}/documents/${doc.id}`)}
                                onDocumentDelete={(id) => deleteMutation.mutate(id)}
                            />
                            <DocumentUpload
                                projectId={projectId!}
                                onUploadSuccess={() => {
                                    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                                    queryClient.invalidateQueries({ queryKey: ['projects'] });
                                }}
                            />
                        </div>
                    )}

                    {/* Pestaña: Mis Textos */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {notes.length === 0 ? 'Aún no hay anotaciones.' : `${notes.length} anotación${notes.length !== 1 ? 'es' : ''}`}
                                </p>
                                <button
                                    onClick={() => setShowNoteInput(v => !v)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Nueva anotación
                                </button>
                            </div>

                            {/* Input para nueva nota */}
                            {showNoteInput && (
                                <div className="bg-white border border-primary/20 rounded-xl p-4 shadow-sm">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la anotación</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newNoteTitle}
                                            onChange={e => setNewNoteTitle(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') createNoteMutation.mutate(newNoteTitle.trim());
                                                if (e.key === 'Escape') { setShowNoteInput(false); setNewNoteTitle(''); }
                                            }}
                                            placeholder="Ej: Reflexiones sobre la entrevista 3..."
                                            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => createNoteMutation.mutate(newNoteTitle.trim())}
                                            disabled={!newNoteTitle.trim() || createNoteMutation.isPending}
                                            className="px-4 py-2 bg-primary text-white text-sm rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                        >
                                            {createNoteMutation.isPending ? 'Creando...' : 'Crear'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Lista de anotaciones */}
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => navigate(`/app/projects/${projectId}/documents/${note.id}`)}
                                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <FiEdit3 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary transition-colors">{note.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(note.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <FiEdit3 className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
