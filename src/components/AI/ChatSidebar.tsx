import { useLocation, useParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Loader from "../ui/Loader";
import { getMessages, sendMessage } from "../../API/CharAPI";
import { useNavigate } from "react-router";
import { IoClose, IoSend } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import { generateIAMessageStream } from "../../API/AIAPI";
import ReactMarkdown from "react-markdown";

interface ChatSidebarProps {
    context: string;
}

export default function ChatSidebar({ context }: ChatSidebarProps) {
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

    if (isLoading) return <Loader />

    if (!sideBarOpen) return null

    if (data) return (
        <div className="flex flex-col bg-gray-100 p-6 min-h-full max-h-screen relative min-w-1/4 max-w-1/4">
            <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Habla con el asistente de IA</h2>
                    <button onClick={() => navigate(location.pathname, { replace: true })} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer duration-300">
                        <IoClose size={24} />
                    </button>
                </div>
                <div className="flex flex-col gap-2 grow overflow-y-auto">
                    {data.map((message) => (
                        <div
                            key={message._id}
                            className="flex items-center gap-2"
                        >
                            <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600">
                                <ReactMarkdown>
                                    {message.content}
                                </ReactMarkdown>
                            </article>
                        </div>
                    ))}

                    {/* Mostrar el stream actual mientras se genera */}
                    {isStreaming && (
                        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600">
                            <ReactMarkdown>
                                {currentStreamText}
                            </ReactMarkdown>
                        </article>
                    )}
                </div>
                <form action="" onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" {...register('content')} />
                    <button type="submit">
                        <IoSend size={24} />
                    </button>
                </form>
            </div>
        </div >
    )
}
