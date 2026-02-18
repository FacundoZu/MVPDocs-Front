import api from '../lib/axios';

export interface Tag {
    _id: string;
    name: string;
    color: string;
    description?: string;
    categoryId?: string;
    projectId: string;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTagRequest {
    name: string;
    color: string;
    description?: string;
    projectId: string;
}

export const tagApi = {
    list: async (projectId: string): Promise<Tag[]> => {
        const response = await api.get<Tag[]>('/tags', { params: { projectId } });
        return response.data;
    },

    create: async (data: CreateTagRequest): Promise<Tag> => {
        const response = await api.post<Tag>('/tags', data);
        return response.data;
    },

    delete: async (tagId: string, force = false): Promise<void> => {
        await api.delete(`/tags/${tagId}`, { params: { force } });
    },
};
