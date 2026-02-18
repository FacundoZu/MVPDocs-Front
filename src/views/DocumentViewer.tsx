import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../API/documents';
import { quoteApi } from '../API/quotes';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';

export function DocumentViewer() {
    const { documentId } = useParams<{ documentId: string }>();

    const { data: document, isLoading: isLoadingDoc, error } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentApi.getById(documentId!),
        enabled: !!documentId,
    });

    const { data: quotes = [] } = useQuery({
        queryKey: ['quotes', documentId],
        queryFn: () => quoteApi.list(documentId!),
        enabled: !!documentId,
    });

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
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">{document.title}</h1>
                    <div className="prose prose-gray max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                            {document.markdownContent}
                        </pre>
                    </div>
                </div>
            </div>

            <aside className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Quotes ({quotes.length})
                </h3>
                {quotes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                        Selecciona texto en el documento para crear un quote
                    </p>
                ) : (
                    <div className="space-y-3">
                        {quotes.map((quote) => (
                            <div
                                key={quote._id}
                                className="p-3 rounded-lg border-l-4 bg-gray-50 text-sm"
                                style={{ borderColor: quote.color }}
                            >
                                <p className="text-gray-700 line-clamp-3">
                                    "{quote.position.selectedText}"
                                </p>
                                {quote.memo && (
                                    <p className="text-gray-500 text-xs mt-1">{quote.memo}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </aside>
        </div>
    );
}
