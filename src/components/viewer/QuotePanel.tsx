import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteApi } from '../../API/quotes';
import type { Quote } from '../../API/quotes';
import { FiTrash2 } from 'react-icons/fi';

interface QuotePanelProps {
    quotes: Quote[];
    documentId: string;
}

export default function QuotePanel({ quotes, documentId }: QuotePanelProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: quoteApi.deleteQuote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes', documentId] });
        },
    });

    return (
        <aside className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">
                    Citas <span className="text-gray-400 font-normal">({quotes.length})</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {quotes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-6">
                        Selecciona texto en el documento y aplica un tag para crear una cita
                    </p>
                ) : (
                    quotes.map((quote) => (
                        <QuoteCard
                            key={quote._id}
                            quote={quote}
                            onDelete={() => deleteMutation.mutate(quote._id)}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

function QuoteCard({ quote, onDelete, isDeleting }: { quote: Quote; onDelete: () => void; isDeleting: boolean }) {
    return (
        <div
            className="rounded-lg border bg-gray-50 overflow-hidden"
            style={{ borderLeftColor: quote.color, borderLeftWidth: 4 }}
        >
            <div className="p-3">
                <p className="text-sm text-gray-700 line-clamp-4 italic">
                    "{quote.position.selectedText}"
                </p>
                {quote.memo && (
                    <p className="text-xs text-gray-500 mt-1.5">{quote.memo}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: quote.color }}
                        />
                        <span className="text-xs text-gray-400">
                            pos. {quote.position.plainStart}–{quote.position.plainEnd}
                        </span>
                    </div>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Eliminar cita"
                    >
                        <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
