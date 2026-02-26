import { useRef, useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { CreateQuoteRequest2, Quote } from '../../API/quotes';
import QuotePopover from './QuotePopover';
import { useAIChatStore } from '../../stores/useAIChatStore';
import type { Tag } from '../../types/tagTypes';

interface SelectionState {
    plainStart: number;
    plainEnd: number;
    selectedText: string;
    contextBefore: string;
    contextAfter: string;
    x: number;
    y: number;
    yTop: number;
}

interface MarkdownWithHighlightsProps {
    content: string;
    quotes: Quote[];
    tags: Tag[];
    onSelectQuote: (quote: CreateQuoteRequest2 & { tagId: string; color: string }) => void;
    selectedQuote: CreateQuoteRequest2 | null;
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
interface HighlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    quoteId?: string;

}

export default function MarkdownWithHighlights({
    content,
    quotes,
    tags,
    onSelectQuote,
    selectedQuote,
}: MarkdownWithHighlightsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [highlightRects, setHighlightRects] = useState<HighlightRect[]>([]);

    // Instanciamos la función de Zustand
    const triggerAIAction = useAIChatStore((state) => state.triggerAIAction);

    // Recalcular los rects de highlight cuando cambian los quotes o el contenido
    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper || quotes.length === 0 && !selection && !selectedQuote) { // Pequeña optimización
            setHighlightRects([]);
            return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const rects: HighlightRect[] = [];

        // Cambiamos "selection" por "activeSelection" para que evalúe ambos estados
        const activeSelection = selection || selectedQuote;

        if (activeSelection) {
            // Usamos "!" porque sabemos que plainStart/plainEnd existen en ambos tipos
            const selectedStart = findNodeAtOffset(container, activeSelection.plainStart!);
            const selectedEnd = findNodeAtOffset(container, activeSelection.plainEnd!);

            if (selectedStart && selectedEnd) {
                const range = document.createRange();
                range.setStart(selectedStart.node, selectedStart.offset);
                range.setEnd(selectedEnd.node, selectedEnd.offset);

                const clientRects = Array.from(range.getClientRects());
                for (const r of clientRects) {
                    if (r.width === 0) continue;
                    rects.push({
                        top: r.top - wrapperRect.top + wrapper.scrollTop,
                        left: r.left - wrapperRect.left,
                        width: r.width,
                        height: r.height,
                        color: '#4f39f6',
                    });
                }
            }
        }

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
    }, [quotes, content, selection, selectedQuote]);

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
            yTop: rect.top,
        });
    }, []);

    // Nueva función manejadora para el popover
    const handleTriggerAI = (actionType: 'SUGGEST_TAGS' | 'SUGGEST_LITERATURE') => {
        if (!selection) return;

        // Enviamos la tarea a Zustand
        triggerAIAction(actionType, {
            selectedText: selection.selectedText,
            contextBefore: selection.contextBefore,
            contextAfter: selection.contextAfter,
        });

        setSelection(null);
        window.getSelection()?.removeAllRanges();
    };

    const handleSelectTag = useCallback((tag: Tag) => {
        if (!selection) return;
        onSelectQuote({
            plainStart: selection.plainStart,
            plainEnd: selection.plainEnd,
            selectedText: selection.selectedText,
            contextBefore: selection.contextBefore,
            contextAfter: selection.contextAfter,
            tagId: tag._id,
            color: tag.color,
        });
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    }, [selection, onSelectQuote]);

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
                <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600">
                    <ReactMarkdown>
                        {content}
                    </ReactMarkdown>
                </article>
            </div>

            {selection && (
                <QuotePopover
                    x={selection.x}
                    y={selection.y}
                    yTop={selection.yTop}
                    tags={tags}
                    onSelectTag={handleSelectTag}
                    onTriggerAI={handleTriggerAI} // Pasamos el nuevo manejador
                    onClose={() => setSelection(null)}
                />
            )}
        </div>
    );
}
