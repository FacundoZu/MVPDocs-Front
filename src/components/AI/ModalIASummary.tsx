import { useLocation, useNavigate } from "react-router";
import { IoClose } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { generateSummary } from "../../API/AIAPI";

interface ModalIASummaryProps {
    content: string;
}

export default function ModalIASummary({ content }: ModalIASummaryProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isOpen = queryParams.get('isOpen');

    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<string>('');

    const closeModal = () => {
        navigate(location.pathname, { replace: true });
    };

    const generateAISummary = useCallback(async () => {
        if (!content) return

        setSummary('')
        setIsGenerating(true)
        setLoading(true)

        try {
            if (!content) return
            const streamResponse = await generateSummary({ content })

            for await (const chunk of streamResponse) {
                setSummary((prev) => prev + chunk)
            }

            setLoading(false)

        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }, [content]);

    useEffect(() => {
        if (isOpen) {
            generateAISummary();
        }
    }, [isOpen, generateAISummary]);

    if (isOpen) return (
        <section className="w-full h-full fixed flex justify-end left-0 top-0 z-20 bg-black/20 backdrop-blur-lg">
            <div className="w-1/3 h-full bg-white overflow-y-auto p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold my-4">Analista de Documentos</h2>
                    <button
                        onClick={closeModal}
                        className="cursor-pointer hover:text-red-500 transition-colors duration-300"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {isGenerating && (
                    <div>
                        {loading ? (
                            <p>Cargando...</p>
                        ) : (
                            <h3 className="text-xl text-gray-500">Resumen generado por IA</h3>
                        )}
                        <p className="my-4">{summary}</p>
                    </div>
                )}

            </div>
        </section>
    )
}
