import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../API/documents';
import { quoteApi, type CreateQuoteRequest2 } from '../API/quotes';
import { FiLoader, FiAlertCircle, FiLayout, FiEdit2, FiEye } from 'react-icons/fi';
import MarkdownWithHighlights from '../components/viewer/MarkdownWithHighlights';
import { getTags } from '../API/TagAPI';
import { projectApi } from '../API/projects';
import RightSidebarLayout from '../layouts/RightSidebarLayout';
import { useTabsStore } from '../stores/useTabsStore';
import SecondaryDocumentReader from '../components/viewer/SecondaryDocumentReader';
import { useLayout } from '../context/LayoutContext';
import RichTextEditor from '../components/editor/RichTextEditor';
import { toast } from 'sonner';

export default function DocumentViewer() {
    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
    const queryClient = useQueryClient();
    const { openTagsDrawer } = useLayout();

    // Modo lectura/edición — se resetea al cambiar de documento
    const [isEditing, setIsEditing] = useState(false);

    // Al cambiar documentId: resetea el modo y auto-activa edición en research_notes
    useEffect(() => {
        setIsEditing(false); // reset primero
    }, [documentId]);

    // Zustand Tabs Store para manejar el Split View
    const activeTabId = useTabsStore((state) => state.activeTabId);
    const activeTab = useTabsStore((state) => state.tabs.find(t => t.id === activeTabId));
    const secondaryDocId = activeTab?.secondaryDocumentId || null;
    const updateTab = useTabsStore((state) => state.updateTab);

    const setSecondaryDocId = (id: string | null) => {
        if (activeTabId) updateTab(activeTabId, { secondaryDocumentId: id || undefined });
    };

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
        enabled: !!projectId,
    });

    const { data: document, isLoading: isLoadingDoc, error } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentApi.getById(documentId!),
        enabled: !!documentId,
    });

    const { data: quotes = [] } = useQuery({
        queryKey: ['quotes', documentId],
        queryFn: () => quoteApi.listByDocument(documentId!),
        enabled: !!documentId,
    });

    const { data: tags = [] } = useQuery({
        queryKey: ['tags', projectId],
        queryFn: () => getTags(projectId!),
        enabled: !!projectId,
    });

    const createQuoteMutation = useMutation({
        mutationFn: quoteApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes', documentId] }),
    });

    const updateContentMutation = useMutation({
        mutationFn: ({ lexicalState, text }: { lexicalState: string; text: string }) =>
            documentApi.updateContent(documentId!, { lexicalState, markdownContent: text }),
        onSuccess: () => {
            toast.success('Guardado', { duration: 1200 });
            queryClient.invalidateQueries({ queryKey: ['document', documentId] });
        },
        onError: () => toast.error('Error al guardar'),
    });

    const handleCreateQuote = ({ tagId, color, plainStart, plainEnd, selectedText, contextBefore, contextAfter }: CreateQuoteRequest2 & { tagId: string; color: string }) => {
        if (!documentId) return;
        createQuoteMutation.mutate({ documentId, plainStart, plainEnd, selectedText, color, tags: [tagId], contextBefore, contextAfter });
    };

    const handleSave = useCallback((lexicalState: string, text: string) => {
        updateContentMutation.mutate({ lexicalState, text });
    }, [updateContentMutation]);

    if (isLoadingDoc) return (
        <div className="flex items-center justify-center h-full">
            <FiLoader className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
    );

    if (error || !document) return (
        <div className="flex items-center justify-center h-full text-red-500 gap-2">
            <FiAlertCircle className="w-5 h-5" />
            <span>Error al cargar el documento</span>
        </div>
    );

    const isNote = document.documentType === 'research_note';
    const otherDocuments = project?.documents.filter(d => d.id !== documentId) || [];

    return (
        <div className="flex h-full overflow-hidden relative">
            <div className="flex flex-1 overflow-hidden transition-all duration-300 ease-in-out">

                {/* ── Panel principal ─────────────────────────────────── */}
                <div className="flex-1 overflow-hidden flex flex-col relative group">

                    {/* Barra de acciones del documento */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Split view (solo source_material) */}
                        {!isNote && !isEditing && !secondaryDocId && otherDocuments.length > 0 && (
                            <div className="relative text-sm">
                                <select
                                    title="Dividir vista"
                                    onChange={(e) => setSecondaryDocId(e.target.value)}
                                    value=""
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-8 pr-4 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm text-xs"
                                >
                                    <option value="" disabled>Dividir vista con...</option>
                                    {otherDocuments.map(d => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                                <FiLayout className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-3.5 h-3.5" />
                            </div>
                        )}

                        {/* Toggle Leer / Editar (todo tipo de documento) */}
                        <button
                            onClick={() => setIsEditing(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm border transition-colors ${isEditing
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                }`}
                            title={isEditing ? 'Cambiar a modo lectura' : 'Editar documento'}
                        >
                            {isEditing
                                ? <><FiEye className="w-3.5 h-3.5" /><span>Leer</span></>
                                : <><FiEdit2 className="w-3.5 h-3.5" /><span>Editar</span></>
                            }
                        </button>
                    </div>

                    {/* ── Modo EDICIÓN ─────────────────────────────────── */}
                    {isEditing ? (
                        <div className="flex-1 overflow-hidden">
                            <RichTextEditor
                                key={documentId} // remonta si cambia el doc
                                lexicalState={document.lexicalState}
                                initialMarkdown={document.markdownContent}
                                onSave={handleSave}
                                autoFocus
                            />
                        </div>
                    ) : (
                        /* ── Modo LECTURA ─────────────────────────────────── */
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-bar-hide">
                            <div className="max-w-3xl mx-auto pt-6">
                                <MarkdownWithHighlights
                                    key={documentId}
                                    content={document.markdownContent}
                                    quotes={quotes}
                                    tags={tags}
                                    onSelectQuote={handleCreateQuote}
                                    selectedQuote={null}
                                    onCreateNewTag={() => openTagsDrawer(projectId!, document.title, true)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Documento secundario (split-screen) ──────────────── */}
                {!isEditing && secondaryDocId && (
                    <SecondaryDocumentReader
                        documentId={secondaryDocId}
                        tags={tags}
                        onClose={() => setSecondaryDocId(null)}
                    />
                )}
            </div>

            <RightSidebarLayout context={document.markdownContent} />
        </div>
    );
}
