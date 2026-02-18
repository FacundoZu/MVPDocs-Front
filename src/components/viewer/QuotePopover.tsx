import { useEffect, useRef } from 'react';
import type { Tag } from '../../API/tags';
import { FiTag } from 'react-icons/fi';

interface QuotePopoverProps {
    x: number;
    y: number;
    tags: Tag[];
    onSelectTag: (tag: Tag) => void;
    onClose: () => void;
    onOpenTagPanel: () => void;
}

export default function QuotePopover({ x, y, tags, onSelectTag, onClose, onOpenTagPanel }: QuotePopoverProps) {
    const ref = useRef<HTMLDivElement>(null);

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
            style={{ top: y + 8, left: x }}
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 min-w-[200px] max-w-[260px]"
        >
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Aplicar tag
            </p>

            {tags.length === 0 ? (
                <p className="text-xs text-gray-400 italic mb-2">
                    No hay tags en este proyecto.
                </p>
            ) : (
                <div className="space-y-1 mb-2">
                    {tags.map((tag) => (
                        <button
                            key={tag._id}
                            onClick={() => onSelectTag(tag)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm text-gray-700 truncate">{tag.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Separador + botón crear tag */}
            <div className="border-t border-gray-100 pt-2">
                <button
                    onClick={() => {
                        onOpenTagPanel();
                        onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors text-left"
                >
                    <FiTag className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-medium">Crear nuevo tag</span>
                </button>
            </div>
        </div>
    );
}
