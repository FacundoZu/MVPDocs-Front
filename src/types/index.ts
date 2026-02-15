export interface SummarizeParams {
    content: string;
    maxWords?: number;
}

export interface SuggestTagsParams {
    selectedText: string;
    contextBefore?: string;
    contextAfter?: string;
    existingTags?: string[];
}

export interface SuggestCategoriesParams {
    tagNames: string[];
}

export interface Category {
    name: string;
    description: string;
    tags: string[];
}