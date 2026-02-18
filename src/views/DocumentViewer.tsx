import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../API/documents';
import { quoteApi } from '../API/quotes';
import { tagApi } from '../API/tags';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import MarkdownWithHighlights from '../components/viewer/MarkdownWithHighlights';
import TagPanel from '../components/viewer/TagPanel';

export function DocumentViewer() {
    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
    const queryClient = useQueryClient();

    const [tagPanelOpen, setTagPanelOpen] = useState(true);
    const [tagPanelAutoForm, setTagPanelAutoForm] = useState(false);

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
        queryFn: () => tagApi.list(projectId!),
        enabled: !!projectId,
    });

    const createQuoteMutation = useMutation({
        mutationFn: quoteApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes', documentId] });
        },
    });

    const handleCreateQuote = ({
        tagId,
        color,
        plainStart,
        plainEnd,
        selectedText,
        contextBefore,
        contextAfter,
    }: {
        tagId: string;
        color: string;
        plainStart: number;
        plainEnd: number;
        selectedText: string;
        contextBefore: string;
        contextAfter: string;
    }) => {
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

    // Abre el panel de tags y activa el formulario de creación automáticamente
    const handleOpenTagPanelForCreate = () => {
        setTagPanelAutoForm(true);
        setTagPanelOpen(true);
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

    return (
        <div className="flex h-full overflow-hidden">
            {/* Contenido del documento */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">{document.title}</h1>
                    <MarkdownWithHighlights
                        content={document.markdownContent}
                        quotes={quotes}
                        tags={tags}
                        onCreateQuote={handleCreateQuote}
                        onOpenTagPanel={handleOpenTagPanelForCreate}
                    />
                </div>
            </div>

            {/* Panel lateral de tags (colapsable) */}
            <TagPanel
                projectId={projectId!}
                tags={tags}
                quotes={quotes}
                isOpen={tagPanelOpen}
                onToggle={() => {
                    setTagPanelOpen((v) => !v);
                    if (tagPanelOpen) setTagPanelAutoForm(false);
                }}
                autoOpenForm={tagPanelAutoForm}
            />
        </div>
    );
}
