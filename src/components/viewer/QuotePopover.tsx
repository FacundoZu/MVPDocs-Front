import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

interface QuotePopoverProps {
    x: number;
    y: number;
    onClose: () => void;
    onOpenTagPanel: () => void;
    onAddTagWithAI: () => void;
    onSelectTag: () => void;
}

export default function QuotePopover({ x, y, onSelectTag, onClose, onOpenTagPanel, onAddTagWithAI }: QuotePopoverProps) {
    const navigate = useNavigate();

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

    const handleCreateQuote = () => {
        onSelectTag()
        navigate(location.pathname + `?sidebar=true`);
    };

    return (
        <div
            ref={ref}
            style={{ top: y + 8, left: x }}
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 min-w-[200px] max-w-[260px]"
        >
            <div>
                <button onClick={handleCreateQuote} >
                    Crear Código
                </button>
            </div>
        </div>
    );
}
