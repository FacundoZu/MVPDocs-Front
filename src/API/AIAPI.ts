import { openRouter } from "../lib/ia";
import type { SummarizeParams } from "../types";
import { streamText } from "ai"

interface StreamTextParams {
    content: string;
    system: string;
    model?: string;
}

export const generateSummary = async ({ content, maxWords = 100 }: SummarizeParams): Promise<AsyncIterable<string>> => {
    const system = `Eres un asistente de análisis cualitativo de datos.
        Tu tarea es generar un resumen ejecutivo conciso y profesional.

        DOCUMENTO:
        ${content}

        INSTRUCCIONES:
        - Máximo ${maxWords} palabras
        - Identifica los temas principales
        - Mantén un tono objetivo y académico
        - No inventes información que no esté en el documento

        RESUMEN:`;

    return streamTextFunction({ content, system })
}

const streamTextFunction = async ({ content, system, model }: StreamTextParams) => {
    const result = streamText({
        model: openRouter(model || 'arcee-ai/trinity-large-preview:free'),
        system,
        messages: [
            {
                role: 'user',
                content
            }
        ]
    })

    return result.textStream
}