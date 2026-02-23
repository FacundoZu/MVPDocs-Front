import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LuPlus, LuSparkles } from 'react-icons/lu';

interface QuotePopoverProps {
    x: number;
    y: number;
    onClose: () => void;
    onAddTagWithAI: () => void;
    onSelectTag: () => void;
}

export default function QuotePopover({ x, y, onSelectTag, onClose, onAddTagWithAI }: QuotePopoverProps) {
    const navigate = useNavigate();
    const location = useLocation();

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
            className="fixed z-10 flex items-center justify-center bg-white rounded-full shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 text-sm p-4 font-semibold"
        >
            <button
                onClick={handleCreateQuote}
                className="group flex items-center gap-2 text-gray-700 cursor-pointer px-2 border-r border-gray-300 hover:text-indigo-600 transition-colors duration-300"
            >
                <LuPlus className='text-indigo-600' />
                <span>Crear Código</span>
            </button>

            <button
                onClick={onAddTagWithAI}
                className="group flex items-center gap-2 text-indigo-600 cursor-pointer px-2 hover:text-gray-700 transition-colors duration-300"
            >
                <LuSparkles className='text-indigo-600' />
                <span>IA Sugerir</span>
            </button>
        </div>
    );
}
