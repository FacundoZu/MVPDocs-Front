export const ChatRole = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export interface ChatMessage {
    _id?: string;
    content: string;
    role: ChatRole;
    projectId?: string;
    quoteId?: string;
    documentId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}