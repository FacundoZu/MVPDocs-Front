export interface Tag {
    _id: string;
    name: string;
    color: string;
    description?: string;
    categoryId?: {
        _id: string;
        name: string;
        color: string;
    } | string;
    projectId: string;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CreateTagData {
    name: string;
    color?: string;
    description?: string;
    categoryId?: string;
    projectId: string;
}

export interface UpdateTagData {
    name?: string;
    color?: string;
    description?: string;
    categoryId?: string | null;
}