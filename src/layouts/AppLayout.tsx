import { Link, Outlet } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import Sidebar from "../components/sidebar/Sidebar";
import { FiZap } from "react-icons/fi";
import { VscLayoutSidebarLeftOff, VscLayoutSidebarLeft } from "react-icons/vsc";
import { useState } from "react";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-2 py-2 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center ">
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        title={sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
                        className="py-2 px-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors duration-200"
                    >
                        {sidebarOpen
                            ? <VscLayoutSidebarLeft className="w-5 h-5" />
                            : <VscLayoutSidebarLeftOff className="w-5 h-5" />}
                    </button>
                    <Link to="/" className="hover:bg-gray-100 py-2 px-2 rounded-xl transition-colors duration-200">
                        <FiZap className="w-5 h-5 text-primary" />
                    </Link>
                </div>
                <Breadcrumbs />
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div
                    className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ width: sidebarOpen ? 256 : 0 }}
                >
                    <Sidebar />
                </div>
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
