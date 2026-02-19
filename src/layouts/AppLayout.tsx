import { Outlet } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import Sidebar from "../components/sidebar/Sidebar";

export default function AppLayout() {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 z-10">
                <Breadcrumbs />
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
