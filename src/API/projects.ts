import api from '../lib/axios';

export interface Project {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
}

export const projectApi = {

    create: async (data: CreateProjectRequest): Promise<Project> => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },

    list: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>('/projects');
        return response.data;
    },

    getById: async (id: string): Promise<Project> => {
        const response = await api.get<Project>(`/projects/${id}`);
        return response.data;
    },
};
