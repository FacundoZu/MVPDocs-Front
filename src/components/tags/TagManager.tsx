import { FaSearch, FaTag } from "react-icons/fa";
import { TagList } from './TagList';
import type { Tag } from '../../types/tagTypes';
import { TagFormModal } from "./TagFormModal";
import { useState } from 'react';
import { useLocation } from "react-router";


interface TagManagerProps {
    projectId: string;
    tags: Tag[]
    handleCreateQuote: ({ tagId, color }: { tagId: Tag['_id'], color: Tag['color'] }) => void
}

export const TagManager = ({ projectId, tags, handleCreateQuote }: TagManagerProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const location = useLocation()
    const quertParams = new URLSearchParams(location.search)
    const sideBarOpen = quertParams.get('sidebar')


    if (!sideBarOpen) return null

    return (
        <div className="flex flex-col bg-gray-100 p-6 min-h-full max-h-screen relative max-w-1/4">
            {/* Header */}
            <div className="">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Panel de Códigos</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer duration-300"
                    >
                        <FaTag />
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4 px-4 py-2 border border-gray-300 bg-white rounded-full my-8">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filtrar códigos..."
                        className="w-full focus:outline-none"
                    />
                </div>

                <h3 className="font-bold text-gray-400 uppercase text-sm">Códigos recientes</h3>
            </div>

            {/* Tag List */}
            <div className="max-h-64 overflow-y-auto mt-2 py-4 pr-2 grow scroll-bar-hide">
                <TagList
                    tags={tags}
                    handleCreateQuote={handleCreateQuote}
                />
            </div>

            <TagFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
            />
        </div>
    );
};