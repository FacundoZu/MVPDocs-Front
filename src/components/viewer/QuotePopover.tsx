import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LuPlus, LuSparkles, LuChevronLeft } from 'react-icons/lu';
import type { Tag } from '../../types/tagTypes';

interface QuotePopoverProps {
    x: number;
    y: number;
    yTop: number;
    tags: Tag[];
    onClose: () => void;
    onAddTagWithAI: () => void;
    onSelectTag: (tag: Tag) => void;
}

export default function QuotePopover({ x, y, yTop, tags, onSelectTag, onClose, onAddTagWithAI }: QuotePopoverProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [showTags, setShowTags] = useState(false);
    const [top, setTop] = useState(y + 8);

    // Flip hacia arriba si el popover se sale de la pantalla por abajo
    useLayoutEffect(() => {
        if (!ref.current) return;
        const popoverBottom = y + 8 + ref.current.offsetHeight;
        if (popoverBottom > window.innerHeight) {
            setTop(yTop - ref.current.offsetHeight - 8);
        } else {
            setTop(y + 8);
        }
    }, [y, yTop, showTags]); // recalcular también cuando cambia el tamaño del popover

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div
            ref={ref}
            style={{ top, left: x }}
            className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        >
            {!showTags && (
                <div className="flex items-center text-sm font-semibold p-3 gap-2">
                    <button
                        onClick={() => setShowTags(true)}
                        className="flex items-center gap-2 text-gray-700 cursor-pointer px-3 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors duration-200 border-r border-gray-200 mr-1"
                    >
                        <LuPlus className="text-primary shrink-0" />
                        <span>Crear Código</span>
                    </button>

                    <button
                        onClick={onAddTagWithAI}
                        className="flex items-center gap-2 text-primary cursor-pointer px-3 py-1.5 rounded-xl hover:bg-primary/10 hover:text-gray-700 transition-colors duration-200"
                    >
                        <LuSparkles className="text-primary shrink-0" />
                        <span>IA Sugerir</span>
                    </button>
                </div>
            )}

            {showTags && (
                <div className="items-center text-sm font-semibold gap-1 p-3">
                    <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowTags(false)}
                                className="cursor-pointer rounded-xl px-2 py-2 hover:bg-primary/10 transition-colors duration-200"
                            >
                                <LuChevronLeft className="w-4 h-4 text-primary" />
                            </button>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Elege un código
                            </span>
                        </div>
                        <button
                            className="cursor-pointer rounded-xl px-2 py-2 hover:bg-primary/10 transition-colors duration-200"
                        >
                            <LuPlus className="text-primary w-4 h-4" />
                        </button>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="py-1.5 max-h-52 overflow-y-auto">
                        {tags.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-4 px-3">
                                No hay códigos en este proyecto
                            </p>
                        ) : (
                            tags.map((tag) => (
                                <button
                                    key={tag._id}
                                    onClick={() => {
                                        onSelectTag(tag);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-primary/10 transition-colors text-left rounded-xl"
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="text-sm text-gray-700 truncate">{tag.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
