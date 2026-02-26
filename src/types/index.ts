import type { Tag } from "./tagTypes";

export interface SummarizeParams {
    content: string;
    maxWords?: number;
}

export interface SuggestTagsParams {
    selectedText: string;
    contextBefore?: string;
    contextAfter?: string;
    existingTags?: Tag[];
}

export interface SuggestCategoriesParams {
    tagNames: string[];
}

export interface Category {
    name: string;
    description: string;
    tags: string[];
}

// src/types/index.ts
export interface IQuote {
  _id: string;
  documentId: string;
  position: {
    selectedText: string;
    plainStart: number;
    plainEnd: number;
  };
  memo?: string;
  color: string;
}

// Interfaz para los datos del Nodo de React Flow
export interface TagNodeData {
  tagId: string;
  label: string;
  color: string;
}