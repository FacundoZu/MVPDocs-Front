import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../API/documents';
import { quoteApi, type CreateQuoteRequest2 } from '../../API/quotes';
import { FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
import MarkdownWithHighlights from './MarkdownWithHighlights';
import type { Tag } from '../../types/tagTypes';

export default function SecondaryDocumentReader({ 
    documentId, 
    tags, 
    onClose 
}: { 
    documentId: string; 
    tags: Tag[];
    onClose: () => void;
}) {
    const queryClient = useQueryClient();

    const { data: document, isLoading, error } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentApi.getById(documentId),
        enabled: !!documentId,
    });

    const { data: quotes = [] } = useQuery({
        queryKey: ['quotes', documentId],
        queryFn: () => quoteApi.listByDocument(documentId),
        enabled: !!documentId,
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full relative w-full border-l border-gray-200">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-md shadow-sm text-gray-500 hover:text-gray-800 z-10"><FiX /></button>
                <FiLoader className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 gap-2 relative w-full border-l border-gray-200">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-md shadow-sm text-gray-500 hover:text-gray-800 z-10"><FiX /></button>
                <FiAlertCircle className="w-5 h-5" />
                <span>Error al cargar el documento secundario</span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-bar-hide h-full relative border-l border-gray-200 shadow-[inset_4px_0_15px_-5px_rgba(0,0,0,0.05)] bg-slate-50/50">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <div className="px-3 py-1 bg-white border border-gray-200 text-xs font-semibold text-gray-500 rounded-md shadow-sm max-w-[200px] truncate" title={document.title}>
                    {document.title}
                </div>
                <button 
                    onClick={onClose} 
                    className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                    title="Cerrar vista dual"
                >
                    <FiX size={16} />
                </button>
            </div>
            
            <div className="max-w-3xl mx-auto pt-6">
                <MarkdownWithHighlights
                    content={document.markdownContent}
                    quotes={quotes}
                    tags={tags}
                    onSelectQuote={handleCreateQuote}
                    selectedQuote={null}
                />
            </div>
        </div>
    );
}
