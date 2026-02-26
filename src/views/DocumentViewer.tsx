import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../API/documents';
import { quoteApi, type CreateQuoteRequest2 } from '../API/quotes';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import MarkdownWithHighlights from '../components/viewer/MarkdownWithHighlights';
import { getTags } from '../API/TagAPI';
import { TagManager } from '../components/tags/TagManager';
import { useState } from 'react';
import type { Tag } from '../types/tagTypes';
import { useNavigate } from 'react-router';
import ChatSidebar from '../components/AI/ChatSidebar';

export function DocumentViewer() {
    const navigate = useNavigate();
    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();
    const queryClient = useQueryClient();

    const [selectedQuote, setSelectedQuote] = useState<CreateQuoteRequest2 | null>(null);

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

    const handleCreateQuote = ({ tagId, color }: { tagId: Tag['_id'], color: Tag['color'] }) => {
        if (!documentId) return;
        if (!selectedQuote) return;
        createQuoteMutation.mutate({
            documentId,
            plainStart: selectedQuote?.plainStart,
            plainEnd: selectedQuote?.plainEnd,
            selectedText: selectedQuote?.selectedText,
            color,
            tags: [tagId],
            contextBefore: selectedQuote?.contextBefore,
            contextAfter: selectedQuote?.contextAfter,
        });
        navigate(location.pathname);
        setSelectedQuote(null);
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
            <div className="grow overflow-y-auto p-8 scroll-bar-hide">
                <div className="max-w-3xl mx-auto">
                    <MarkdownWithHighlights
                        content={document.markdownContent}
                        quotes={quotes}
                        onSelectQuote={setSelectedQuote}
                        selectedQuote={selectedQuote}
                    />
                </div>
            </div>

            <TagManager projectId={projectId!} tags={tags} handleCreateQuote={handleCreateQuote} />
            <ChatSidebar context={document.markdownContent} />
        </div>
    );
}
