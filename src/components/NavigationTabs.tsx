import { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import { FiPlus, FiFolder, FiFileText, FiShare2, FiX, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIChatStore } from '../stores/useAIChatStore';
import { useTabsStore, type TabType } from '../stores/useTabsStore';
import { VscLayoutSidebarRight, VscLayoutSidebarRightOff } from 'react-icons/vsc';

const getTabTypeFromPath = (path: string): TabType => {
    if (path.includes('/network')) return 'network';
    if (path.includes('/documents/')) return 'document';
    if (path.includes('/projects/')) return 'project';
    return 'unknown';
};

const getTabIcon = (type: TabType, active: boolean) => {
    const className = `shrink-0 ${active ? "text-primary" : "text-gray-400"}`;
    if (type === 'project') return <FiFolder className={className} />;
    if (type === 'document') return <FiFileText className={className} />;
    if (type === 'network') return <FiShare2 className={className} />;
    return <FiFile className={className} />;
};

export default function NavigationTabs() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Fallback since useParams might not catch nested params when rendered in a parent layout
    const projectId = params.projectId || location.pathname.match(/\/projects\/([^/]+)/)?.[1];
    const documentId = params.documentId || location.pathname.match(/\/documents\/([^/]+)/)?.[1];

    // Zustand Tabs Store
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);
    const addTab = useTabsStore((state) => state.addTab);
    const updateTab = useTabsStore((state) => state.updateTab);
    const removeTab = useTabsStore((state) => state.removeTab);
    const setActiveTab = useTabsStore((state) => state.setActiveTab);

    // Sidebar Store
    const { activeSidebar, openSidebar, closeSidebar } = useAIChatStore();

    const toggleSidebar = () => {
        if (activeSidebar) closeSidebar();
        else openSidebar('CHAT');
    };

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
        enabled: !!projectId,
    });

    const { data: document } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentApi.getById(documentId!),
        enabled: !!documentId,
    });

    // 1. Sincronizar cambios de URL (React Router) hacia el estado global de pestañas
    useEffect(() => {
        const estado = useTabsStore.getState();
        const currentPath = location.pathname;

        // Si no hay pestañas iniciales, creamos la primera
        if (estado.tabs.length === 0 || !estado.activeTabId) {
            const type = getTabTypeFromPath(currentPath);
            addTab({ path: currentPath, title: 'Cargando...', type });
            return;
        }

        const activeTab = estado.tabs.find(t => t.id === estado.activeTabId);
        
        // Si la URL actual es distinta a la de la pestaña activa (navegación vía Link)
        if (activeTab && activeTab.path !== currentPath) {
            // Buscamos si el usuario fue "atrás" a una url que ya está en otra pestaña para enfocarla
            const matchingTab = estado.tabs.find(t => t.path === currentPath);
            if (matchingTab) {
                setActiveTab(matchingTab.id);
            } else {
                // Nos comportamos como un IDE/navegador "nuevo espacio". 
                // Al hacer clic a un documento o red, abrimos una NUEVA pestaña automáticamente
                // para que no pierdan la vista de Proyecto. 
                const type = getTabTypeFromPath(currentPath);
                const newId = addTab({ path: currentPath, title: 'Cargando...', type });
                setActiveTab(newId);
            }
        }
    }, [location.pathname, addTab, setActiveTab]);

    // 2. Actualizar título cuando terminan de cargar las queries
    useEffect(() => {
        if (!activeTabId) return;
        const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId);
        if (!activeTab) return;

        let newTitle = activeTab.title;
        if (activeTab.type === 'project' && project?.name) {
            newTitle = project.name;
        } else if (activeTab.type === 'document' && document?.title) {
            newTitle = document.title;
        } else if (activeTab.type === 'network') {
            newTitle = 'Red Semántica';
        }

        if (newTitle !== activeTab.title && newTitle !== 'Cargando...') {
            updateTab(activeTabId, { title: newTitle });
        }
    }, [project?.name, document?.title, activeTabId, updateTab]);

    // Handlers
    const handleTabClick = (id: string, path: string) => {
        setActiveTab(id);
        navigate(path);
    };

    const handleCloseTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Evitar que dispare el onClick del div padre
        
        const isClosingActive = activeTabId === id;
        removeTab(id);

        // Ya fue eliminado del estado de zustand. Navegamos sincrónicamente a la nueva activa si es necesario
        const newState = useTabsStore.getState();
        if (newState.tabs.length === 0) {
            const defaultPath = projectId ? `/app/projects/${projectId}` : `/app`;
            addTab({ path: defaultPath, title: 'Panel Principal', type: 'project' });
            navigate(defaultPath);
        } else if (isClosingActive && newState.activeTabId) {
            const nextActiveTab = newState.tabs.find(t => t.id === newState.activeTabId);
            if (nextActiveTab) {
                navigate(nextActiveTab.path);
            }
        }
    };

    const handleAddTab = () => {
        // Al darle a +, duplicamos o creamos el inicio
        const startPath = projectId ? `/app/projects/${projectId}` : `/app`;
        const initialType = getTabTypeFromPath(startPath);
        const newId = addTab({ path: startPath, title: 'Nueva Pestaña', type: initialType });
        setActiveTab(newId);
        navigate(startPath);
    };

    // Si aún no hay projectId y no hay tabs siquiera, no mostrar, aunque es raro si acabamos de hacer redirect
    if (!projectId && tabs.length === 0) {
        return (
            <div className="flex w-full items-center justify-end px-4">
                <span className="text-sm text-gray-400">Selecciona un proyecto</span>
            </div>
        );
    }

    return (
        <div className="flex flex-1 items-end justify-between h-full w-full pl-2 overflow-hidden relative">
            <div className="flex items-center h-full gap-1 overflow-x-auto overflow-y-hidden hide-scrollbar relative z-10 pt-[2px]">
                <AnimatePresence initial={false}>
                    {tabs.map(tab => {
                        const isActive = tab.id === activeTabId;
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10, minWidth: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
                                animate={{ opacity: 1, y: 0, minWidth: 120, width: 'auto', paddingLeft: 12, paddingRight: 12 }}
                                exit={{ opacity: 0, y: 10, minWidth: 0, width: 0, paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0, borderWidth: 0 }}
                                transition={{ duration: 0.2 }}
                                key={tab.id}
                                title={tab.title}
                                onClick={() => handleTabClick(tab.id, tab.path)}
                                className={`group flex items-center gap-2 border-x border-t rounded-t-lg transition-colors max-w-[200px] h-[36px] font-medium text-sm cursor-pointer whitespace-nowrap overflow-hidden ${
                                    isActive
                                        ? 'border-gray-200 text-primary bg-white -bottom-px relative h-[37px] z-20'
                                        : 'border-transparent text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-200 z-10 hover:opacity-100'
                                }`}
                            >
                                {getTabIcon(tab.type, isActive)}
                                <span className="truncate flex-1 select-none pointer-events-none min-w-[50px]">
                                    {tab.title}
                                </span>
                                
                                <button
                                    onClick={(e) => handleCloseTab(e, tab.id)}
                                    className={`shrink-0 p-[2px] rounded-md transition-all duration-200 cursor-pointer ${
                                        isActive 
                                            ? 'opacity-100 hover:bg-primary/10 hover:text-red-500' 
                                            : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-red-500 text-gray-400'
                                    }`}
                                    title="Cerrar pestaña"
                                >
                                    <FiX size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Botón para añadir nueva pestaña */}
                <motion.button
                    layout
                    className="flex shrink-0 items-center justify-center p-1.5 ml-1 mb-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors cursor-pointer self-end z-10"
                    title="Nueva pestaña"
                    onClick={handleAddTab}
                >
                    <FiPlus size={18} />
                </motion.button>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200 z-0 border-b border-gray-200"></div>

            {/* Acciones a la derecha y Sidebar control */}
            <div className="flex items-center h-[37px] gap-3 pr-4 shrink-0 z-20 bg-gray-100 absolute right-0 bottom-0">
                {documentId && (
                    <button
                        onClick={toggleSidebar}
                        className={`p-1.5 rounded-md transition-colors duration-200 cursor-pointer ${activeSidebar
                            ? 'bg-primary-50 text-primary hover:bg-primary-100'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                            }`}
                        title="Alternar analista documental"
                    >
                        {activeSidebar ? <VscLayoutSidebarRight size={18} /> : <VscLayoutSidebarRightOff size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
}
