// Quitamos dependencias de React Router y la lógica de Sidebar
import { FaSearch } from "react-icons/fa";
import { TagList } from './TagList';
import type { Tag } from '../../types/tagTypes';
import { TagFormModal } from "./TagFormModal";
import { useState } from 'react';
import { LuPlus } from "react-icons/lu";

interface TagManagerProps {
    projectId: string;
    tags: Tag[];
}

export const TagManager = ({ projectId, tags }: TagManagerProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col h-full w-full px-4 pb-4 bg-gray-50">
            {/* Header de la pestaña */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Tus Códigos</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                        <LuPlus /> Nuevo
                    </button>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-xl mb-4 shadow-sm">
                    <FaSearch className="text-gray-400 size-3" />
                    <input type="text" placeholder="Filtrar códigos..." className="w-full focus:outline-none text-sm bg-transparent" />
                </div>
            </div>

            {/* Tag List */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-4">
                <TagList tags={tags} />
            </div>

            <TagFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectId={projectId} />
        </div>
    );
};