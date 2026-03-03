import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IoSend } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

import Loader from "../ui/Loader";
import { getMessages, sendMessage } from "../../API/CharAPI";
import { generateIAMessageStream, suggestLiterature, suggestTags } from "../../API/AIAPI";
import { useAIChatStore } from "../../stores/useAIChatStore";
import ChatMessageItem from "./ChatMessageItem";

interface ChatSidebarProps {
    context: string;
}

export default function ChatSidebar({ context }: ChatSidebarProps) {
    const { pendingAction, selectionPayload, clearPendingAction } = useAIChatStore();

    const queryClient = useQueryClient();
    const { projectId, documentId } = useParams<{ projectId: string; documentId: string }>();

    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStreamText, setCurrentStreamText] = useState('');

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // NUEVO: Ref para saber si debemos scrollear automáticamente
    const isAutoScrolling = useRef(true);

    const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { content: '' } });
    const contentValue = watch("content");

    // NUEVO: Detecta si el usuario está scrolleando manualmente
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

        // Consideramos que está "al fondo" si la distancia al final es menor a 50px
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        isAutoScrolling.current = isNearBottom;
    };

    const { data, isLoading } = useQuery({
        queryKey: ['messages', projectId, documentId],
        queryFn: () => getMessages({ projectId: projectId!, documentId: documentId! }),
    });

    const { mutateAsync: saveMessage } = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', projectId, documentId] });
        }
    });

    // NUEVO: Efecto de scroll inteligente y suavizado
    useEffect(() => {
        if (isAutoScrolling.current && scrollContainerRef.current) {
            // requestAnimationFrame evita el "layout thrashing" (los saltos raros)
            // sincronizando el scroll con el refresco de la pantalla.
            requestAnimationFrame(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
            });
        }
    }, [data, currentStreamText]);

    const handleSendMessage = async (userContent: string) => {
        if (!userContent.trim()) return;
        isAutoScrolling.current = true; // Forzamos el scroll al enviar mensaje

        try {
            await saveMessage({
                content: userContent,
                role: 'user',
                projectId: projectId!,
                documentId: documentId!
            });

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

    const onSubmitManual = async (formData: { content: string }) => {
        const content = formData.content;
        reset();
        await handleSendMessage(content);
    };

    useEffect(() => {
        if (pendingAction && selectionPayload) {
            const executeAutoAction = async () => {
                isAutoScrolling.current = true; // Forzamos el scroll al accionar la IA
                try {
                    setIsStreaming(true);
                    setCurrentStreamText('');
                    let fullAIResponse = '';
                    let streamResponse;

                    if (pendingAction === 'SUGGEST_TAGS') {
                        streamResponse = await suggestTags({
                            selectedText: selectionPayload.selectedText,
                            contextBefore: selectionPayload.contextBefore,
                            contextAfter: selectionPayload.contextAfter,
                            existingTags: []
                        });
                    } else if (pendingAction === 'SUGGEST_LITERATURE') {
                        streamResponse = await suggestLiterature({
                            selectedText: selectionPayload.selectedText,
                            contextBefore: selectionPayload.contextBefore,
                            contextAfter: selectionPayload.contextAfter,
                        });
                    }

                    clearPendingAction();

                    if (streamResponse) {
                        for await (const chunk of streamResponse) {
                            fullAIResponse += chunk;
                            setCurrentStreamText(fullAIResponse);
                        }

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
    }, [pendingAction, selectionPayload]);

    return (
        <div className="flex flex-col gap-6 bg-gray-50 border-l border-gray-200 p-6 min-h-full max-h-screen shadow-2xl z-20">

            {/* AÑADIDO: onScroll={handleScroll} */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex flex-col grow overflow-y-auto scroll-bar-hide py-2 gap-4"
            >
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
                <div />
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