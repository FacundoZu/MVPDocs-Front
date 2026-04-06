import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FiFolder, FiChevronDown, FiChevronRight, FiChevronLeft, FiTag, FiPlus, FiFileText, FiEdit3 } from 'react-icons/fi';
import DocumentItem from './DocumentItem';
import type { ProjectDocument } from '../../API/projects';
import { documentApi } from '../../API/documents';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipo extendido que incluye los documentos embebidos que devuelve GET /projects
export interface ProjectWithDocs {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    documents: ProjectDocument[];
}

interface ProjectItemProps {
    project: ProjectWithDocs;
    onOpenTags: (projectId: string, projectName: string) => void;
    tagsOpen: boolean;
}

export default function ProjectItem({ project, onOpenTags, tagsOpen }: ProjectItemProps) {
    const navigate = useNavigate();
    const { projectId: activeProjectId } = useParams();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(activeProjectId === project._id);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);

    const isActive = activeProjectId === project._id;

    const sourceDocs = project.documents.filter(d => d.documentType === 'source_material');
    const notes = project.documents.filter(d => d.documentType === 'research_note');

    const createNoteMutation = useMutation({
        mutationFn: (title: string) => documentApi.createNote(project._id, title),
        onSuccess: (doc) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', project._id] });
            setNewNoteTitle('');
            setShowNoteInput(false);
            toast.success('Anotación creada');
            navigate(`/app/projects/${project._id}/documents/${doc._id}`);
        },
        onError: () => toast.error('Error al crear la anotación'),
    });

    const handleClick = () => {
        navigate(`/app/projects/${project._id}`);
        setIsOpen((prev) => !prev);
    };

    const handleCreateNote = () => {
        const title = newNoteTitle.trim();
        if (!title) return;
        createNoteMutation.mutate(title);
    };

    return (
        <div>
            {/* ── Fila del proyecto ───────────────────────────────── */}
            <button
                onClick={handleClick}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                {isOpen
                    ? <FiChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                    : <FiChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                }
                <FiFolder className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                <span className="truncate">{project.name}</span>
                {project.documents.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{project.documents.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">

                    {/* ── Botón acceso rápido a códigos ─────────────── */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenTags(project._id, project.name); }}
                        title="Ver códigos del proyecto"
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors mt-1 ${tagsOpen
                            ? 'text-primary bg-primary/10 font-medium'
                            : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                            }`}
                    >
                        <FiTag className="w-3 h-3 shrink-0" />
                        <span>Ver códigos</span>
                        <span className="ml-auto">
                            {tagsOpen ? <FiChevronLeft className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
                        </span>
                    </button>

                    {/* ── Sección: Documentos (source_material) ────────── */}
                    {sourceDocs.length > 0 && (
                        <div className="pt-1">
                            <div className="flex items-center gap-1 px-3 py-1">
                                <FiFileText className="w-3 h-3 text-gray-300 shrink-0" />
                                <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Documentos</span>
                            </div>
                            {sourceDocs.map((doc) => (
                                <DocumentItem
                                    key={doc.id}
                                    documentId={doc.id}
                                    projectId={project._id}
                                    title={doc.title}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Sección: Mis Textos (research_note) ─────────── */}
                    <div className="pt-1">
                        <div className="flex items-center gap-1 px-3 py-1">
                            <FiEdit3 className="w-3 h-3 text-gray-300 shrink-0" />
                            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider flex-1">Mis Textos</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowNoteInput(v => !v); }}
                                title="Nueva anotación"
                                className="p-0.5 text-gray-300 hover:text-primary transition-colors"
                            >
                                <FiPlus className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Input para crear nueva nota */}
                        {showNoteInput && (
                            <div className="px-2 py-1">
                                <input
                                    type="text"
                                    value={newNoteTitle}
                                    onChange={e => setNewNoteTitle(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleCreateNote();
                                        if (e.key === 'Escape') { setShowNoteInput(false); setNewNoteTitle(''); }
                                    }}
                                    placeholder="Nombre de la anotación..."
                                    className="w-full text-xs px-2 py-1.5 border border-primary/40 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                    autoFocus
                                />
                                <div className="flex gap-1 mt-1">
                                    <button
                                        onClick={handleCreateNote}
                                        disabled={!newNoteTitle.trim() || createNoteMutation.isPending}
                                        className="flex-1 text-xs py-1 bg-primary text-white rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        {createNoteMutation.isPending ? '...' : 'Crear'}
                                    </button>
                                    <button
                                        onClick={() => { setShowNoteInput(false); setNewNoteTitle(''); }}
                                        className="px-2 text-xs py-1 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {notes.length === 0 && !showNoteInput ? (
                            <p className="text-xs text-gray-300 px-3 py-1 italic">Sin anotaciones</p>
                        ) : (
                            notes.map((doc) => (
                                <DocumentItem
                                    key={doc.id}
                                    documentId={doc.id}
                                    projectId={project._id}
                                    title={doc.title}
                                />
                            ))
                        )}
                    </div>

                    {/* Sin documentos de ningún tipo */}
                    {sourceDocs.length === 0 && notes.length === 0 && !showNoteInput && (
                        <p className="text-xs text-gray-400 px-3 py-1.5 italic">Sin documentos aún</p>
                    )}
                </div>
            )}
        </div>
    );
}
