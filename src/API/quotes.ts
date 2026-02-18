import api from '../lib/axios';

export interface Quote {
    _id: string;
    documentId: string;
    position: {
        rawStart: number;
        rawEnd: number;
        plainStart: number;
        plainEnd: number;
        selectedText: string;
        contextBefore?: string;
        contextAfter?: string;
    };
    tags: string[];
    memo?: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuoteRequest {
    documentId: string;
    plainStart: number;
    plainEnd: number;
    selectedText: string;
    color: string;
    memo?: string;
    contextBefore?: string;
    contextAfter?: string;
    tags?: string[];
}

export const quoteApi = {
    list: async (documentId: string): Promise<Quote[]> => {
        const response = await api.get<Quote[]>('/quotes', { params: { documentId } });
        return response.data;
    },

    create: async (data: CreateQuoteRequest): Promise<Quote> => {
        const response = await api.post<Quote>('/quotes', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/quotes/${id}`);
    },
};
