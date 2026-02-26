import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IoClose, IoSend } from "react-icons/io5";
import { BsStars } from "react-icons/bs";
import ReactMarkdown from "react-markdown";

import Loader from "../ui/Loader";
import { getMessages, sendMessage } from "../../API/CharAPI";
import { generateIAMessageStream, suggestLiterature, suggestTags } from "../../API/AIAPI";
import { useAIChatStore } from "../../stores/useAIChatStore"; // Importamos nuestro store
import ChatMessageItem from "./ChatMessageItem";

interface ChatSidebarProps {
    context: string;
}

export default function ChatSidebar({ context }: ChatSidebarProps) {
    // 1. Conectamos con Zustand
    const {
        isSidebarOpen,
        closeSidebar,
        pendingAction,
        actionPayload,
        clearPendingAction
    } = useAIChatStore();

    const queryClient = useQueryClient();
    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();

    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStreamText, setCurrentStreamText] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { content: '' } });
    const contentValue = watch("content");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const { data, isLoading } = useQuery({
        queryKey: ['messages', projectId, documentId],
        queryFn: () => getMessages({ projectId: projectId!, documentId: documentId! }),
        enabled: isSidebarOpen // Optimización: Solo carga mensajes si el sidebar está abierto
    });

    // Cambiamos a mutateAsync para poder usar await dentro de nuestras funciones
    const { mutateAsync: saveMessage } = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', projectId, documentId] });
        }
    });

    // 2. EXTRAEMOS LA LÓGICA CORE PARA HACERLA REUTILIZABLE
    const handleSendMessage = async (userContent: string) => {
        if (!userContent.trim()) return;

        try {
            // A. Guardar mensaje del usuario
            await saveMessage({
                content: userContent,
                role: 'user',
                projectId: projectId!,
                documentId: documentId!
            });

            // B. Iniciar generación de IA
            setIsStreaming(true);
            setCurrentStreamText('');
            let fullAIResponse = '';

            const streamResponse = await generateIAMessageStream({
                content: userContent,
                context,
                messages: data || []
            });

            for await (const chunk of streamResponse) {
                fullAIResponse += chunk;
                setCurrentStreamText(fullAIResponse);
            }

            // C. Guardar respuesta de la IA
            await saveMessage({
                content: fullAIResponse,
                role: 'assistant',
                projectId: projectId!,
                documentId: documentId!
            });

        } catch (error) {
            toast.error('Error en la comunicación con la IA');
            console.error(error);
        } finally {
            setIsStreaming(false);
        }
    };

    // 3. ENVÍO MANUAL (Desde el input)
    const onSubmitManual = async (formData: { content: string }) => {
        const content = formData.content;
        reset(); // Limpiamos el input inmediatamente
        await handleSendMessage(content);
    };

    // 4. INTERCEPTOR DE ACCIONES AUTOMÁTICAS (Zustand)
    useEffect(() => {
        if (pendingAction && actionPayload) {
            const executeAutoAction = async () => {
                try {
                    // 2. Preparamos el UI para el stream
                    setIsStreaming(true);
                    setCurrentStreamText('');
                    let fullAIResponse = '';
                    let streamResponse;

                    // 3. Elegimos la función correcta de la API
                    if (pendingAction === 'SUGGEST_TAGS') {
                        streamResponse = await suggestTags({
                            selectedText: actionPayload.selectedText,
                            contextBefore: actionPayload.contextBefore,
                            contextAfter: actionPayload.contextAfter,
                            existingTags: [] // Si tienes los tags en el store o props, pásalos aquí
                        });
                    } else if (pendingAction === 'SUGGEST_LITERATURE') {
                        streamResponse = await suggestLiterature({
                            selectedText: actionPayload.selectedText,
                            contextBefore: actionPayload.contextBefore,
                            contextAfter: actionPayload.contextAfter,
                        });
                    }

                    clearPendingAction(); // Limpiamos el estado de Zustand

                    // 4. Procesamos el stream
                    if (streamResponse) {
                        for await (const chunk of streamResponse) {
                            fullAIResponse += chunk;
                            setCurrentStreamText(fullAIResponse);
                        }

                        // 5. Guardamos la respuesta final de la IA
                        await saveMessage({
                            content: fullAIResponse,
                            role: 'assistant',
                            projectId: projectId!,
                            documentId: documentId!
                        });
                    }

                } catch {
                    toast.error('Error al generar la sugerencia automática');
                } finally {
                    setIsStreaming(false);
                }
            };

            executeAutoAction();
        }
    }, [pendingAction, actionPayload]);

    useEffect(() => {
        scrollToBottom();
    }, [data, currentStreamText, isSidebarOpen]);

    if (!isSidebarOpen) return null;

    return (
        <div className="flex flex-col gap-6 bg-gray-50 border-l border-gray-200 p-6 min-h-full max-h-screen min-w-[380px] w-1/3 shadow-2xl z-20 transition-all duration-300 open-sidebar">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl flex items-center justify-center">
                        <BsStars size={20} />
                    </div>
                    Analista IA
                </h2>
                <button
                    onClick={closeSidebar}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                    <IoClose size={24} />
                </button>
            </div>

            <div className="flex flex-col gap-4 grow overflow-y-auto scroll-bar-hide py-2">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader /></div>
                ) : (
                    data?.map((message) => (
                        <ChatMessageItem key={message._id} message={message} />
                    ))
                )}

                {isStreaming && (
                    <div className="flex w-full justify-start">
                        <div className="max-w-[85%] p-4 rounded-2xl bg-white border border-indigo-100 rounded-tl-none shadow-sm relative overflow-hidden">
                            <article className="prose prose-slate max-w-none text-sm">
                                <ReactMarkdown>{currentStreamText}</ReactMarkdown>
                                <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-1 align-middle" />
                            </article>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSubmit(onSubmitManual)}
                className="w-full bg-white p-2 rounded-2xl flex items-end gap-2 shadow-sm border border-gray-200"
            >
                <textarea
                    {...register('content')}
                    rows={1}
                    className="w-full py-2.5 px-4 focus:outline-none resize-none max-h-[150px] overflow-y-auto scrollbar-hide flex-1 bg-transparent text-sm scroll-bar-hide"
                    placeholder="Escribe tu mensaje..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(onSubmitManual)();
                        }
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                    }}
                />
                <button
                    type="submit"
                    disabled={!contentValue?.trim() || isStreaming}
                    className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${contentValue?.trim() && !isStreaming
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <IoSend size={18} />
                </button>
            </form>
        </div>
    );
}