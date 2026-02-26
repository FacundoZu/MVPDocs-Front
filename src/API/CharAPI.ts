import api from "../lib/axios";
import type { ChatMessage, ChatRole } from "../types/chatTypes";

type GetMessagesParams = {
    projectId: string;
    documentId: string;
}

export type SendMessageParams = {
    projectId: string;
    documentId: string;
    content: string;
    role: ChatRole;
}

export async function getMessages({ projectId, documentId }: GetMessagesParams) {
    try {
        console.log(projectId, documentId);

        const response = await api.get<ChatMessage[]>(`/chat/messages?projectId=${projectId}&documentId=${documentId}`);

        return response.data;
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
    }
}

export async function sendMessage(formData: SendMessageParams) {
    try {
        const response = await api.post<ChatMessage>(`/chat/messages`, formData);
        return response.data;
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
}