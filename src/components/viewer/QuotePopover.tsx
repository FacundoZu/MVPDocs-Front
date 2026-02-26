// QuotePopover.tsx
import { useEffect, useRef } from 'react';
import { LuPlus, LuSparkles, LuBookOpen } from 'react-icons/lu';

interface QuotePopoverProps {
    x: number;
    y: number;
    onClose: () => void;
    onSelectTag: () => void;
    onTriggerAI: (actionType: 'SUGGEST_TAGS' | 'SUGGEST_LITERATURE') => void; // Nueva prop simplificada
}

export default function QuotePopover({ x, y, onSelectTag, onClose, onTriggerAI }: QuotePopoverProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div
            ref={ref}
            style={{ top: y + 8, left: x }}
            className="fixed z-10 flex items-center justify-center bg-white rounded-full shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 text-sm p-2 font-semibold"
        >
            <button
                onClick={onSelectTag}
                className="group flex items-center gap-2 text-gray-700 cursor-pointer px-3 border-r border-gray-200 hover:text-indigo-600 transition-colors"
            >
                <LuPlus className='text-indigo-600' />
                <span>Crear Código</span>
            </button>

            <button
                onClick={() => onTriggerAI('SUGGEST_TAGS')}
                className="group flex items-center gap-2 text-indigo-600 cursor-pointer px-3 border-r border-gray-200 hover:text-indigo-800 transition-colors"
            >
                <LuSparkles />
                <span>IA Tags</span>
            </button>

            <button
                onClick={() => onTriggerAI('SUGGEST_LITERATURE')}
                className="group flex items-center gap-2 text-indigo-600 cursor-pointer px-3 hover:text-indigo-800 transition-colors"
            >
                <LuBookOpen />
                <span>IA Literatura</span>
            </button>
        </div>
    );
}