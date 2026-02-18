import api from '../lib/axios';

export interface Document {
    _id: string;
    title: string;
    originalFilename: string;
    originalFormat: string;
    markdownContent: string;
    contentHash: string;
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

export interface UploadDocumentResponse {
    title: string;
    originalFilename: string;
    originalFormat: string;
    markdownContent: string;
    contentHash: string;
    metadata: {
        wordCount: number;
        characterCount: number;
        uploadDate: string;
        lastModified: string;
    };
    projectId: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface UploadDocumentError {
    error: string;
}

export const documentApi = {
    upload: async (file: File, projectId: string): Promise<UploadDocumentResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        const response = await api.post<UploadDocumentResponse>('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    list: async (projectId?: string): Promise<Document[]> => {
        const response = await api.get<Document[]>('/documents', {
            params: projectId ? { projectId } : undefined,
        });
        return response.data;
    },

    getById: async (id: string): Promise<Document> => {
        const response = await api.get<Document>(`/documents/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/documents/${id}`);
    },
};
