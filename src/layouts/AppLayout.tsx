import { Link, Outlet } from "react-router";
import NavigationTabs from "../components/NavigationTabs";
import Sidebar from "../components/sidebar/Sidebar";
import { FiZap } from "react-icons/fi";
import { VscLayoutSidebarLeftOff, VscLayoutSidebarLeft } from "react-icons/vsc";
import { useState } from "react";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-gray-100 border-b border-gray-200 h-14 flex items-end shrink-0 z-10 w-full relative">
                <div className="flex items-center h-[37px] px-3 shrink-0 gap-1 z-20">
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        title={sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-200 rounded-md transition-colors duration-200 cursor-pointer"
                    >
                        {sidebarOpen
                            ? <VscLayoutSidebarLeft className="w-[18px] h-[18px] text-primary" />
                            : <VscLayoutSidebarLeftOff className="w-[18px] h-[18px]" />}
                    </button>
                    <Link to="/" className="hover:bg-gray-200 p-1.5 rounded-md transition-colors duration-200 flex items-center justify-center">
                        <FiZap className="w-[18px] h-[18px] text-primary" />
                    </Link>
                </div>
                <div className="flex-1 w-full h-full pt-4">
                    <NavigationTabs />
                </div>
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
