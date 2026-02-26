import { openRouter } from "../lib/ia";
import type { SuggestCategoriesParams, SuggestTagsParams } from "../types";
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

export const suggestTags = async (params: SuggestTagsParams) => {
    const { selectedText, contextBefore = '', contextAfter = '', existingTags = [] } = params;

    const existingTagsText = existingTags.length > 0
        ? `\nTags existentes en el proyecto (considera reutilizarlos): ${existingTags.join(', ')}`
        : '';

    const system = `Eres un asistente experto en análisis cualitativo de datos.
    Tu tarea es sugerir etiquetas (tags) relevantes para el fragmento de texto seleccionado por el investigador.

    INSTRUCCIONES DE COMPORTAMIENTO:
    - Sugiere entre 3 y 5 tags.
    - Responde de forma natural, amigable y conversacional, directamente al investigador.
    - Usa formato Markdown (listas con viñetas, negritas) para que sea fácil de leer en el chat.
    - Justifica muy brevemente por qué sugieres esos tags en base al texto.
    - Prioriza reutilizar tags existentes si son aplicables.
    - NO uses formato JSON, responde como un compañero de investigación.`;

    const content = `
    CONTEXTO PREVIO: ${contextBefore}
    
    TEXTO SELECCIONADO: 
    "${selectedText}"
    
    CONTEXTO POSTERIOR: ${contextAfter}
    ${existingTagsText}
    `;

    // Retornamos directamente el stream
    return streamTextFunction({ content, system });
}

// Nueva función para Citas APA (Literatura)
export interface SuggestLiteratureParams {
    selectedText: string;
    contextBefore?: string;
    contextAfter?: string;
}

export const suggestLiterature = async (params: SuggestLiteratureParams) => {
    const { selectedText, contextBefore = '', contextAfter = '' } = params;

    const system = `Eres un experto investigador y académico senior en teoría social y metodología cualitativa.
    Tu tarea es sugerir perspectivas teóricas o autores reales que dialoguen, contrasten o apoyen la cita proporcionada.

    INSTRUCCIONES DE COMPORTAMIENTO:
    - Sugiere 2 o 3 autores, corrientes o enfoques teóricos relevantes.
    - Proporciona las sugerencias de referencias bibliográficas en formato APA (7ma edición).
    - Responde de manera conversacional y estructurada usando Markdown.
    - REGLA ESTRICTA ANTIALUCINACIONES: No inventes papers o libros. Si no estás seguro del título exacto de una obra, menciona el autor y su concepto general (ej: "El concepto de capital cultural de Bourdieu..."), pero advierte al usuario que es una sugerencia conceptual.
    - Sé analítico y explica brevemente la conexión entre la cita y la teoría.`;

    const content = `
    CONTEXTO PREVIO: ${contextBefore}
    
    CITA DEL DOCUMENTO: 
    "${selectedText}"
    
    CONTEXTO POSTERIOR: ${contextAfter}
    `;

    return streamTextFunction({ content, system });
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