import { openRouter } from "../lib/ia";
import type { SuggestCategoriesParams, SuggestTagsParams, SummarizeParams } from "../types";
import { streamText, generateText } from "ai"
import type { ChatMessage } from "../types/chatTypes";

const model = 'arcee-ai/trinity-large-preview:free'

interface StreamTextParams {
    content: string;
    system: string;
    model?: string;
}

interface SendIAMessage {
    content: string
    messages: ChatMessage[]
    context: string
}

export const generateSummary = async ({ content, maxWords = 100 }: SummarizeParams): Promise<AsyncIterable<string>> => {
    const system = `Eres un asistente de análisis cualitativo de datos.
        Tu tarea es generar un resumen ejecutivo conciso y profesional.

        INSTRUCCIONES:
        - Máximo ${maxWords} palabras
        - Identifica los temas principales
        - Mantén un tono objetivo y académico
        - No inventes información que no esté en el documento
        - Devuelve el resumen en formato Markdown pero no le agregues un titulo principal

        RESUMEN:`;

    return streamTextFunction({ content, system })
}

export const generateIAMessageStream = async ({ content, context, messages }: SendIAMessage) => {
    const system = `
    Eres un Asistente de Investigación Cualitativa especializado en Análisis de Datos. 
    Tu objetivo es ayudar al investigador a profundizar en los significados, tensiones y categorías de sus documentos.

    ### CONTEXTO DEL DOCUMENTO (EL "TERRENO DE VERDAD"):
    ---
    ${context}
    ---

    ### INSTRUCCIONES DE COMPORTAMIENTO:
    1. **Fidelidad al Texto**: Tus respuestas deben basarse principalmente en el contexto proporcionado arriba. Si el usuario pregunta algo que no está en el texto, indícalo claramente: "Basado exclusivamente en este fragmento, no hay evidencia de..., sin embargo, teóricamente podríamos inferir...".
    2. **Análisis Cualitativo**: No te limites a resumir. Busca contradicciones, patrones latentes o significados subyacentes en la narrativa del documento.
    3. **Rol de Socio de Crítica**: Si el usuario propone una interpretación, actúa como un "abogado del diablo" constructivo, sugiriendo otras posibles lecturas del mismo fragmento.
    4. **Brevedad**: Mantén las respuestas concisas y académicas.

    ### RESTRICCIONES:
    - No inventes datos que no estén en el documento.
    - Si citas el texto, usa comillas "..." para diferenciarlo de tus propias palabras.
    - No saludes en cada mensaje; ve directo al grano del análisis.

    Tu respuesta debe basarse tambien en los mensajes anteriores del usuario.

    ### MENSajes Anteriores:
    ${messages.map((message, index) => `MENSAJE ${index + 1}: ${message}`).join('\n')}
    `

    return streamTextFunction({ content, system })
}

export const suggestTags = async (params: SuggestTagsParams): Promise<string[]> => {
    const { selectedText, contextBefore = '', contextAfter = '', existingTags = [] } = params;

    const existingTagsText = existingTags.length > 0
        ? `\nTags existentes en el proyecto (considera reutilizarlos): ${existingTags.join(', ')}`
        : '';
    const system = `Eres un asistente de análisis cualitativo de datos.
                    Tu tarea es sugerir etiquetas (tags) relevantes para el siguiente fragmento de texto.

                    INSTRUCCIONES:
                    - Sugiere entre 3 y 5 tags
                    - Los tags deben ser palabras clave o frases cortas (máx 3 palabras)
                    - Prioriza reutilizar tags existentes si son aplicables
                    - Si el fragmento menciona emociones, incluye un tag emocional
                    - Si hay conceptos teóricos, inclúyelos
                    - Responde SOLO con un array JSON de strings

                    FORMATO DE RESPUESTA:
                    ["tag1", "tag2", "tag3"]`;
    const content = `
                    CONTEXTO PREVIO: ${contextBefore}

                    TEXTO SELECCIONADO:
                    "${selectedText}"

                    CONTEXTO POSTERIOR: ${contextAfter}
                    ${existingTagsText}
                    `
    try {
        const text = await generateIAText({ content, system })

        if (!text) return []

        // Parsear JSON de forma segura
        const cleanedContent = text.replace(/```json\n?|\n?```/g, '').trim();
        const tags: string[] = JSON.parse(cleanedContent);

        if (!Array.isArray(tags)) {
            console.error('Respuesta inesperada del modelo:', tags);
            return [];
        }

        // Limitar a 5 tags y limpiar
        return tags
            .slice(0, 5)
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.length < 50);

    } catch (error) {
        console.error('Error al sugerir tags:', error);
        return [];
    }
}

export const suggestCategories = async ({ tagNames }: SuggestCategoriesParams) => {

    if (tagNames.length < 3) return []

    const system = `Eres un asistente de análisis cualitativo de datos.
                Tu tarea es agrupar los siguientes tags en categorías lógicas.

                INSTRUCCIONES:
                - Agrupa tags relacionados temáticamente
                - Crea entre 2 y 5 categorías
                - Cada categoría debe tener un nombre descriptivo
                - Cada categoría debe contener al menos 2 tags
                - Responde SOLO con un objeto JSON

                FORMATO DE RESPUESTA:
                {
                "categories": [
                    {
                    "name": "Nombre de categoría",
                    "description": "Breve descripción",
                    "tags": ["tag1", "tag2"]
                    }
                ]
                }`;

    const content = `TAGS A CATEGORIZAR: ${tagNames.map((tag, i) => `${i + 1}. ${tag}`).join('\n')}`;

    try {
        const text = await generateIAText({ content, system })

        if (!text) return []

        // Parsear JSON de forma segura
        const cleanedContent = text.replace(/```json\n?|\n?```/g, '').trim();
        const result = JSON.parse(cleanedContent);

        if (!result.categories || !Array.isArray(result.categories)) {
            console.error('Formato de respuesta inesperado:', result);
            return [];
        }

        return result.categories
    } catch (error) {
        console.error('Error al sugerir categorías:', error);
        return [];
    }
}

const generateIAText = async ({ content, system }: StreamTextParams) => {
    const result = await generateText({
        model: openRouter(model),
        system,
        messages: [
            {
                role: 'user',
                content
            }
        ]
    })

    return result.text
}

const streamTextFunction = async ({ content, system }: StreamTextParams) => {
    const result = streamText({
        model: openRouter(model),
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