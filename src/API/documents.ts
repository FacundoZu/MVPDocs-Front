import api from '../lib/axios';

export interface Document {
    _id: string;
    title: string;
    originalFilename: string;
    originalFormat: string;
    markdownContent: string;
    contentHash: string;
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

export interface UploadDocumentResponse extends Document { }

export const documentApi = {
    upload: async (file: File, projectId: string): Promise<UploadDocumentResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        const response = await api.post<UploadDocumentResponse>('/documents/upload', formData, {
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
};
