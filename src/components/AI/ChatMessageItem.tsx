import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { FiCopy } from "react-icons/fi";
import { toast } from 'sonner';
import type { ChatMessage } from '../../types/chatTypes';

interface ChatMessageItemProps {
    message: ChatMessage
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
    const [isCopied, setIsCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            toast.success('Texto copiado al portapapeles');

            // Volver al ícono original después de 2 segundos
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            toast.error('Error al copiar el texto');
            console.error(err);
        }
    };

    return (
        // Añadimos 'group' para que el hover afecte a los elementos hijos
        <div className={`flex w-full group ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className="max-w-[85%] flex flex-col gap-1">

                {/* Burbuja de chat */}
                <div className={`p-4 rounded-2xl shadow-sm ${isUser
                    ? 'bg-white/80 rounded-tr-none' // Ajusté el color a tu diseño previo
                    : 'bg-white border border-gray-200 rounded-tl-none text-slate-700'
                    }`}>
                    <article className={`prose max-w-none text-sm prose-slate`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </article>
                </div>


                <div className="flex justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer p-2 hover:bg-indigo-50 rounded-full duration-300"
                        title="Copiar mensaje"
                    >
                        {isCopied ? (
                            <>
                                <IoCheckmarkOutline size={16} className="text-green-500" />
                            </>
                        ) : (
                            <>
                                <FiCopy size={16} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}