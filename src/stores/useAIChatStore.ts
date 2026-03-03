import { create } from 'zustand';

export interface SelectionPayload {
    plainStart?: number;
    plainEnd?: number;
    selectedText: string;
    contextBefore: string;
    contextAfter: string;
}

export type AIActionType = 'SUGGEST_TAGS' | 'SUGGEST_LITERATURE' | null;
export type SidebarType = 'CHAT' | 'TAGS' | null; // Añadimos los tipos de sidebar

interface AppSidebarStore {
    activeSidebar: SidebarType;
    pendingAction: AIActionType;
    selectionPayload: SelectionPayload | null;

    openSidebar: (type: SidebarType) => void;
    closeSidebar: () => void;
    setSelectionPayload: (payload: SelectionPayload | null) => void;
    triggerAIAction: (type: AIActionType, payload: SelectionPayload) => void;
    clearPendingAction: () => void;
}

export const useAIChatStore = create<AppSidebarStore>((set) => ({
    activeSidebar: null,
    pendingAction: null,
    selectionPayload: null,

    openSidebar: (type) => set({ activeSidebar: type }),
    closeSidebar: () => set({ activeSidebar: null, selectionPayload: null }),

    setSelectionPayload: (payload) => set({ selectionPayload: payload }),

    triggerAIAction: (type, payload) => set({
        activeSidebar: 'CHAT', // Abre el chat automáticamente
        pendingAction: type,
        selectionPayload: payload
    }),

    clearPendingAction: () => set({ pendingAction: null }),
}));