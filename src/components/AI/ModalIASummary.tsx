import { useLocation, useNavigate } from "react-router";
import { IoClose, IoReload } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import { generateSummary } from "../../API/AIAPI";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Loader from "../ui/Loader";

interface ModalIASummaryProps {
    content: string;
}

export default function ModalIASummary({ content }: ModalIASummaryProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isOpen = queryParams.get('isOpen');

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<string>('');

    const closeModal = () => {
        navigate(location.pathname, { replace: true });
    };

    const generateAISummary = useCallback(async () => {
        if (!content) return

        setSummary('')
        setLoading(true)

        try {
            if (!content) return
            const streamResponse = await generateSummary({ content })

            for await (const chunk of streamResponse) {
                setSummary((prev) => prev + chunk)
            }

            setLoading(false)
            toast.success('Resumen generado exitosamente')

        } catch (error) {
            console.error(error)
            setLoading(false)
            toast.error('Error al generar el resumen')
        }
    }, [content]);

    useEffect(() => {
        if (isOpen) {
            generateAISummary();
        }
    }, [isOpen, generateAISummary]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(summary)
        toast.success('Resumen copiado al portapapeles')
        navigate(location.pathname, { replace: true });
    }

    if (isOpen) return (
        <section className="w-full h-full fixed flex justify-end left-0 top-0 z-20 bg-black/20">
            <div className="w-1/4 h-full bg-white overflow-y-auto flex flex-col justify-between">
                <div className="border-b border-gray-200 flex items-center justify-between p-6">
                    <h2 className="text-2xl font-bold flex items-center gap-4">
                        <div className="bg-gray-200 text-purple-700 p-2 rounded-2xl flex items-center justify-center">
                            <FaRobot size={24} />
                        </div>
                        Analista de Documentos
                    </h2>
                    <button
                        onClick={closeModal}
                        className="cursor-pointer hover:text-red-500 transition-colors duration-300 text-gray-500"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="space-y-2 p-6 grow">
                    <h3 className="font-semibold text-gray-500 uppercase ">Resumen ejecutivo</h3>

                    <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600">
                        <ReactMarkdown>
                            {summary}
                        </ReactMarkdown>
                    </article>
                    {loading && <Loader isSmall={true} />}
                </div>

                <div className="border-t border-gray-200 p-6 flex gap-2">
                    <button
                        className="flex text-primary items-center gap-2 p-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-default hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                        onClick={copyToClipboard}
                        disabled={loading}
                    >
                        <FaRegCopy />
                    </button>
                    <button
                        className="flex text-primary items-center gap-2 p-2 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-default hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                        onClick={generateAISummary}
                        disabled={loading}
                    >
                        <IoReload />
                    </button>
                </div>
            </div>
        </section>
    )
}
