import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../API/documents';
import { quoteApi, type CreateQuoteRequest2 } from '../API/quotes';
import { FiLoader, FiAlertCircle, FiLayout } from 'react-icons/fi';
import MarkdownWithHighlights from '../components/viewer/MarkdownWithHighlights';
import { getTags } from '../API/TagAPI';
import { projectApi } from '../API/projects';
import RightSidebarLayout from '../layouts/RightSidebarLayout';
import { useTabsStore } from '../stores/useTabsStore';
import SecondaryDocumentReader from '../components/viewer/SecondaryDocumentReader';
import { useLayout } from '../context/LayoutContext';

export default function DocumentViewer() {
    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
    const queryClient = useQueryClient();

    // Zustand Tabs Store para manejar el Split View del documento activo
    const activeTabId = useTabsStore((state) => state.activeTabId);
    const activeTab = useTabsStore((state) => state.tabs.find(t => t.id === activeTabId));
    const secondaryDocId = activeTab?.secondaryDocumentId || null;
    const updateTab = useTabsStore((state) => state.updateTab);

    const setSecondaryDocId = (id: string | null) => {
        if (activeTabId) {
            updateTab(activeTabId, { secondaryDocumentId: id || undefined });
        }
    };

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
        enabled: !!projectId,
    });
    const { openTagsDrawer } = useLayout();

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes', documentId] });
        },
    });

    const handleCreateQuote = ({ tagId, color, plainStart, plainEnd, selectedText, contextBefore, contextAfter }: CreateQuoteRequest2 & { tagId: string; color: string }) => {
        if (!documentId) return;
        createQuoteMutation.mutate({
            documentId,
            plainStart,
            plainEnd,
            selectedText,
            color,
            tags: [tagId],
            contextBefore,
            contextAfter,
        });
    };

    if (isLoadingDoc) {
        return (
            <div className="flex items-center justify-center h-full">
                <FiLoader className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 gap-2">
                <FiAlertCircle className="w-5 h-5" />
                <span>Error al cargar el documento</span>
            </div>
        );
    }

    const otherDocuments = project?.documents.filter(d => d.id !== documentId) || [];

    return (
        <div className="flex h-full overflow-hidden relative">
            <div className={`flex flex-1 overflow-hidden transition-all duration-300 ease-in-out`}>
                {/* Lado Primario */}
                <div className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-bar-hide relative group transition-all`}>

                    {/* Select para Split View */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!secondaryDocId && otherDocuments.length > 0 && (
                            <div className="relative group/split text-sm">
                                <select
                                    title="Dividir vista"
                                    onChange={(e) => setSecondaryDocId(e.target.value)}
                                    value=""
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-8 pr-4 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                                >
                                    <option value="" disabled>Dividir vista con...</option>
                                    {otherDocuments.map(d => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                                <FiLayout className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <MarkdownWithHighlights
                            content={document.markdownContent}
                            quotes={quotes}
                            tags={tags}
                            onSelectQuote={handleCreateQuote}
                            selectedQuote={null}
                            onCreateNewTag={() => openTagsDrawer(projectId!, document.title, true)}
                    />
                    </div>
                </div>

                {/* Lado Secundario (si aplica) */}
                {secondaryDocId && (
                    <SecondaryDocumentReader
                        documentId={secondaryDocId}
                        tags={tags}
                        onClose={() => setSecondaryDocId(null)}
                    />
                )}
            </div>

            <RightSidebarLayout
                context={document.markdownContent}
            />
        </div>
    );
}
