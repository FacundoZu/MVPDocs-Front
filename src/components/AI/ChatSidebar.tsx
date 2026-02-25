import { useLocation, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Loader from "../ui/Loader";
import { getMessages, sendMessage } from "../../API/CharAPI";
import { useNavigate } from "react-router";
import { IoClose, IoSend } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { generateIAMessageStream } from "../../API/AIAPI";
import ReactMarkdown from "react-markdown";
import { BsStars } from "react-icons/bs";

interface ChatSidebarProps {
    context: string;
}

export default function ChatSidebar({ context }: ChatSidebarProps) {
    // ... dentro de tu componente ChatSidebar
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    const navigate = useNavigate()

    const location = useLocation()
    const quertParams = new URLSearchParams(location.search)
    const sideBarOpen = quertParams.get('ia-sidebar')

    const queryClient = useQueryClient();
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStreamText, setCurrentStreamText] = useState(''); // Solo para visualización

    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();

    const { data, isLoading } = useQuery({
        queryKey: ['messages', projectId, documentId],
        queryFn: () => getMessages({ projectId: projectId!, documentId: documentId! })
    })

    const { register, handleSubmit, reset } = useForm({ defaultValues: { content: '' } })

    const { mutate } = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            reset()
            queryClient.invalidateQueries({
                queryKey: ['messages', projectId, documentId]
            })
        },
        onError: () => {
            toast.error('Error al enviar el mensaje')
        }
    })

    const onSubmit = async (formData: { content: string }) => {
        const userContent = formData.content;
        reset();

        try {
            // A. Guardar mensaje del usuario
            mutate({
                content: userContent,
                role: 'user',
                projectId: projectId!,
                documentId: documentId!
            });

            // B. Iniciar generación de IA
            setIsStreaming(true);
            setCurrentStreamText('');
            let fullAIResponse = ''; // Acumulador local (Crítico)

            const streamResponse = await generateIAMessageStream({
                content: userContent,
                context,
                messages: data || []
            });

            for await (const chunk of streamResponse) {
                fullAIResponse += chunk;
                setCurrentStreamText(fullAIResponse); // Para que el usuario vea el progreso
            }

            // C. Guardar respuesta de la IA al finalizar el stream
            mutate({
                content: fullAIResponse,
                role: 'assistant',
                projectId: projectId!,
                documentId: documentId!
            });

        } catch {
            toast.error('Error en la comunicación');
        } finally {
            setIsStreaming(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, []);

    // Se activa cuando hay nuevos mensajes de la DB o cuando la IA está escribiendo
    useEffect(() => {
        scrollToBottom();
    }, [data, currentStreamText]);

    if (isLoading) return <Loader />

    if (!sideBarOpen) return null

    return (
        <div className="flex flex-col gap-6 bg-gray-100 p-6 min-h-full max-h-screen relative min-w-1/3 max-w-1/3 open-sidebar">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-4">
                    <div className="text-indigo-600 p-2 rounded-lg flex items-center justify-center">
                        <BsStars size={16} />
                    </div>
                    Analista de Documentos
                </h2>
                <button onClick={() => navigate(location.pathname, { replace: true })} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer duration-300">
                    <IoClose size={24} />
                </button>
            </div>
            <div className="flex flex-col gap-4 grow overflow-y-auto scroll-bar-hide py-2">
                {data?.map((message) => (
                    <div
                        key={message._id}
                        className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${message.role === 'user'
                            ? 'bg-white/80 rounded-tr-none'
                            : 'bg-white border border-gray-200 rounded-tl-none'
                            }`}>
                            <article className={`prose max-w-none text-sm prose-slate`}>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </article>
                        </div>
                    </div>
                ))}

                {/* Stream de la IA (siempre a la izquierda/assistant) */}
                {isStreaming && (
                    <div className="flex w-full justify-start">
                        <div className="max-w-[85%] p-4 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm">
                            <article className="prose prose-slate max-w-none text-sm">
                                <ReactMarkdown>{currentStreamText}</ReactMarkdown>
                            </article>
                        </div>
                    </div>
                )}

                {/* El ancla para el scroll */}
                <div ref={messagesEndRef} />
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full bg-white p-2 rounded-full flex items-center gap-2 shadow-md text-sm"
            >
                <input
                    type="text"
                    {...register('content')}
                    className="w-full py-2 px-4 focus:outline-none"
                    placeholder="Escribe tu mensaje..."
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="p-2 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors duration-300"
                >
                    <IoSend size={16} />
                </button>
            </form>
        </div >
    )
}
