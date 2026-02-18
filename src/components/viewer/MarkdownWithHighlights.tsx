import { useRef, useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Quote } from '../../API/quotes';
import type { Tag } from '../../API/tags';
import QuotePopover from './QuotePopover';

interface SelectionState {
    plainStart: number;
    plainEnd: number;
    selectedText: string;
    contextBefore: string;
    contextAfter: string;
    x: number;
    y: number;
}

interface MarkdownWithHighlightsProps {
    content: string;
    quotes: Quote[];
    tags: Tag[];
    onCreateQuote: (params: {
        tagId: string;
        color: string;
        plainStart: number;
        plainEnd: number;
        selectedText: string;
        contextBefore: string;
        contextAfter: string;
    }) => void;
    onOpenTagPanel: () => void;
}

/**
 * Extrae el texto plano de un elemento del DOM (sin sintaxis markdown).
 * Equivale a lo que el usuario ve en pantalla.
 */
function getPlainText(el: HTMLElement): string {
    return el.innerText ?? el.textContent ?? '';
}

/**
 * Calcula el offset de texto plano (innerText) desde el inicio del contenedor
 * hasta un nodo+offset específico del DOM.
 */
function getPlainOffset(container: HTMLElement, targetNode: Node, targetOffset: number): number {
    let total = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (node === targetNode) {
            return total + targetOffset;
        }
        total += node.length;
    }
    return total;
}

/**
 * Dado un offset de texto plano, devuelve el nodo de texto y el offset local
 * dentro de ese nodo.
 */
function findNodeAtOffset(container: HTMLElement, targetOffset: number): { node: Text; offset: number } | null {
    let total = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (total + node.length >= targetOffset) {
            return { node, offset: targetOffset - total };
        }
        total += node.length;
    }
    return null;
}

const markdownComponents = {
    h1: ({ children }: any) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{children}</h3>,
    p: ({ children }: any) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
    strong: ({ children }: any) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
    li: ({ children }: any) => <li className="text-gray-700">{children}</li>,
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">{children}</blockquote>
    ),
    code: ({ inline, children }: any) =>
        inline ? (
            <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
        ) : (
            <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
                <code className="text-sm font-mono text-gray-800">{children}</code>
            </pre>
        ),
    hr: () => <hr className="border-gray-200 my-6" />,
    a: ({ href, children }: any) => (
        <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    ),
};

interface HighlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    quoteId: string;
}

export default function MarkdownWithHighlights({
    content,
    quotes,
    tags,
    onCreateQuote,
    onOpenTagPanel,
}: MarkdownWithHighlightsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);

    // Recalcular los rects de highlight cuando cambian los quotes o el contenido
    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper || quotes.length === 0) {
            setHighlightRects([]);
            return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const rects: HighlightRect[] = [];

        for (const quote of quotes) {
            const start = findNodeAtOffset(container, quote.position.plainStart);
            const end = findNodeAtOffset(container, quote.position.plainEnd);
            if (!start || !end) continue;

            try {
                const range = document.createRange();
                range.setStart(start.node, start.offset);
                range.setEnd(end.node, end.offset);

                const clientRects = Array.from(range.getClientRects());
                for (const r of clientRects) {
                    if (r.width === 0) continue;
                    rects.push({
                        top: r.top - wrapperRect.top + wrapper.scrollTop,
                        left: r.left - wrapperRect.left,
                        width: r.width,
                        height: r.height,
                        color: quote.color,
                        quoteId: quote._id,
                    });
                }
            } catch {
                // Ignorar errores de rango inválido
            }
        }

        setHighlightRects(rects);
    }, [quotes, content]);

    const handleMouseUp = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;

        const selectedText = sel.toString();
        if (!selectedText.trim()) return;

        const container = containerRef.current;
        if (!container) return;

        const range = sel.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) return;

        // Calcular offsets sobre el texto plano renderizado (innerText)
        const plainStart = getPlainOffset(container, range.startContainer, range.startOffset);
        const plainEnd = getPlainOffset(container, range.endContainer, range.endOffset);

        const plainText = getPlainText(container);
        const contextBefore = plainText.slice(Math.max(0, plainStart - 60), plainStart);
        const contextAfter = plainText.slice(plainEnd, plainEnd + 60);

        const rect = range.getBoundingClientRect();
        setSelection({
            plainStart,
            plainEnd,
            selectedText: selectedText.trim(),
            contextBefore,
            contextAfter,
            x: rect.left + rect.width / 2 - 100,
            y: rect.bottom,
        });
    }, []);

    const handleSelectTag = useCallback((tag: Tag) => {
        if (!selection) return;
        onCreateQuote({
            tagId: tag._id,
            color: tag.color,
            plainStart: selection.plainStart,
            plainEnd: selection.plainEnd,
            selectedText: selection.selectedText,
            contextBefore: selection.contextBefore,
            contextAfter: selection.contextAfter,
        });
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    }, [selection, onCreateQuote]);

    return (
        <div ref={wrapperRef} className="relative">
            {/* Highlights como overlays absolutos */}
            {highlightRects.map((rect, i) => (
                <span
                    key={`${rect.quoteId}-${i}`}
                    aria-hidden
                    style={{
                        position: 'absolute',
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        backgroundColor: rect.color + '30',
                        borderBottom: `2px solid ${rect.color}`,
                        borderRadius: 2,
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                />
            ))}

            {/* Markdown renderizado completo, una sola vez */}
            <div
                ref={containerRef}
                onMouseUp={handleMouseUp}
                className="select-text relative z-0"
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {content}
                </ReactMarkdown>
            </div>

            {selection && (
                <QuotePopover
                    x={selection.x}
                    y={selection.y}
                    tags={tags}
                    onSelectTag={handleSelectTag}
                    onClose={() => setSelection(null)}
                    onOpenTagPanel={() => {
                        setSelection(null);
                        window.getSelection()?.removeAllRanges();
                        onOpenTagPanel();
                    }}
                />
            )}
        </div>
    );
}
