import { create } from 'zustand';

// Reutilizamos tu interfaz de selección
export interface SelectionPayload {
    selectedText: string;
    contextBefore: string;
    contextAfter: string;
}

export type AIActionType = 'SUGGEST_TAGS' | 'SUGGEST_LITERATURE' | null;

interface AIChatStore {
    // Estado
    isSidebarOpen: boolean;
    pendingAction: AIActionType;
    actionPayload: SelectionPayload | null;

    // Acciones
    openSidebar: () => void;
    closeSidebar: () => void;
    triggerAIAction: (type: AIActionType, payload: SelectionPayload) => void;
    clearPendingAction: () => void;
}

export const useAIChatStore = create<AIChatStore>((set) => ({
    isSidebarOpen: false,
    pendingAction: null,
    actionPayload: null,

    openSidebar: () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),

    // Esta es la magia: abre el sidebar y le pasa la tarea al chat
    triggerAIAction: (type, payload) => set({
        isSidebarOpen: true,
        pendingAction: type,
        actionPayload: payload
    }),

    // El chat llamará a esto una vez que empiece a procesar la solicitud
    clearPendingAction: () => set({ pendingAction: null, actionPayload: null }),
}));