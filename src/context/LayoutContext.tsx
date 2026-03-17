import { createContext, useContext } from 'react';

interface LayoutContextValue {
    /** Abre el TagsDrawer izquierdo para el proyecto dado.
     *  Si ya está abierto el mismo proyecto, lo cierra (toggle).
     *  Si no se pasa projectId/Name, usa el proyecto activo. */
    openTagsDrawer: (projectId: string, projectName: string, showForm?: boolean) => void;
    closeTagsDrawer: () => void;
}

export const LayoutContext = createContext<LayoutContextValue>({
    openTagsDrawer: () => {},
    closeTagsDrawer: () => {},
});

export function useLayout() {
    return useContext(LayoutContext);
}
