import { Link, Outlet } from "react-router";
import Breadcrumbs from "../components/Breadcrumbs";
import Sidebar from "../components/sidebar/Sidebar";
import { FiZap } from "react-icons/fi";

export default function AppLayout() {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 z-10">
                <Link to="/" className="hover:bg-gray-100 py-2 px-2 rounded-xl mr-4 transition-colors duration-200">
                    <FiZap className="w-5 h-5 text-primary" />
                </Link>
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
