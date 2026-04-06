import api from '../lib/axios';

export interface Document {
    _id: string;
    title: string;
    originalFilename: string;
    originalFormat: string;
    markdownContent: string;
    contentHash: string;
    documentType: 'source_material' | 'research_note';
    lexicalState?: string;
    summary?: string;
    metadata: {
        wordCount: number;
        characterCount: number;
        uploadDate: string;
        lastModified: string;
    };
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentListResponse {
    documents: Document[];
    totalPages: number;
    currentPage: number;
    totalDocuments: number;
}

export const documentApi = {
    upload: async (file: File, projectId: string): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        const response = await api.post<Document>('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    list: async (params?: { page?: number; limit?: number }): Promise<DocumentListResponse> => {
        const response = await api.get<DocumentListResponse>('/documents', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Document> => {
        const response = await api.get<Document>(`/documents/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/documents/${id}`);
    },

    updateSummary: async (id: string, summary: string): Promise<Document> => {
        const response = await api.patch<{ message: string; document: Document }>(`/documents/${id}/summary`, { summary });
        return response.data.document;
    },

    createNote: async (projectId: string, title: string): Promise<Document> => {
        const response = await api.post<Document>('/documents/notes', { projectId, title });
        return response.data;
    },

    updateContent: async (id: string, data: { markdownContent?: string; lexicalState?: string }): Promise<Document> => {
        const response = await api.patch<{ message: string; document: Document }>(`/documents/${id}/content`, data);
        return response.data.document;
    },
};
