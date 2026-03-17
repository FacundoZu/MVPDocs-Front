import { Link, Outlet } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import Sidebar from "../components/sidebar/Sidebar";
import TagsDrawer from "../components/sidebar/TagsDrawer";
import { FiZap } from "react-icons/fi";
import { VscLayoutSidebarLeftOff, VscLayoutSidebarLeft } from "react-icons/vsc";
import { useRef, useState } from "react";
import { LayoutContext } from "../context/LayoutContext";

interface DrawerState {
    projectId: string;
    projectName: string;
    showForm: boolean;
}

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [tagsDrawer, setTagsDrawer] = useState<DrawerState | null>(null);

    // Mantiene el último valor visible durante la animación de cierre
    const lastDrawer = useRef(tagsDrawer);
    if (tagsDrawer) lastDrawer.current = tagsDrawer;

    const handleOpenTags = (projectId: string, projectName: string, showForm = false) => {
        setTagsDrawer(prev => {
            // Toggle si mismo proyecto (sin showForm)
            if (!showForm && prev?.projectId === projectId) return null;
            return { projectId, projectName, showForm };
        });
    };

    return (
        <LayoutContext.Provider value={{
            openTagsDrawer: handleOpenTags,
            closeTagsDrawer: () => setTagsDrawer(null),
        }}>
            <div className="flex flex-col h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center mr-2">
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            title={sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
                            className="py-2 px-2 text-gray-400 hover:text-primary hover:bg-primary/20 rounded-xl transition-colors duration-200 cursor-pointer"
                        >
                            {sidebarOpen
                                ? <VscLayoutSidebarLeft className="w-5 h-5 text-primary" />
                                : <VscLayoutSidebarLeftOff className="w-5 h-5" />}
                        </button>
                        <Link to="/" className="hover:bg-primary/20 py-2 px-2 rounded-xl transition-colors duration-200">
                            <FiZap className="w-5 h-5 text-primary" />
                        </Link>
                    </div>
                    <Breadcrumbs />
                </header>

                <div className="relative flex flex-1 overflow-hidden">
                    <div
                        className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ width: sidebarOpen ? 256 : 0 }}
                    >
                        <Sidebar onOpenTags={handleOpenTags} tagsProjectId={tagsDrawer?.projectId ?? null} />
                    </div>

                    {/* Drawer de tags — siempre montado, animado por width */}
                    <div
                        className="absolute top-0 bottom-0 z-20 overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                            left: sidebarOpen ? 256 : 0,
                            width: tagsDrawer ? 320 : 0,
                        }}
                    >
                        {lastDrawer.current && (
                            <TagsDrawer
                                projectId={lastDrawer.current.projectId}
                                projectName={lastDrawer.current.projectName}
                                showForm={lastDrawer.current.showForm}
                                onClose={() => setTagsDrawer(null)}
                            />
                        )}
                    </div>

                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </LayoutContext.Provider>
    );
}
