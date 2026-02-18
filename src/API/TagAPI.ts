import api from "../lib/axios";
import type { CreateTagData, Tag, UpdateTagData } from "../types/tagTypes";

// Tag API
export async function getTags(projectId: string, filters?: {
    categoryId?: string;
    search?: string;
}): Promise<Tag[]> {
    const params = new URLSearchParams({ projectId });

    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.search) params.append('search', filters.search);

    try {
        const url = `/tags?${params.toString()}`;
        const response = await api.get<Tag[]>(url);

        return response.data;
    } catch {
        throw new Error('Error al obtener las etiquetas');
    }
}

export async function getTagById(tagId: string): Promise<Tag> {
    try {
        const response = await api.get<Tag>(`/tags/${tagId}`);
        return response.data;
    } catch {
        throw new Error('Error al obtener la etiqueta');
    }
}

export async function createTag(tag: CreateTagData): Promise<Tag> {
    try {
        const response = await api.post<Tag>('/tags', tag);
        return response.data;
    } catch {
        throw new Error('Error al crear la etiqueta');
    }
}

export async function updateTag(tagId: string, tag: UpdateTagData): Promise<Tag> {
    try {
        const response = await api.patch<Tag>(`/tags/${tagId}`, tag);
        return response.data;
    } catch {
        throw new Error('Error al actualizar la etiqueta');
    }
}

export async function deleteTag(tagId: string, force = false): Promise<string> {
    try {
        const params = force ? '?force=true' : '';
        await api.delete(`/tags/${tagId}${params}`);
        return 'Etiqueta eliminada correctamente';
    } catch {
        throw new Error('Error al eliminar la etiqueta');
    }
}
