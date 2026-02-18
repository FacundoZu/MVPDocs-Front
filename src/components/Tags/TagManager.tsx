import { FaSearch, FaTag } from "react-icons/fa";

import { TagList } from './TagList';
import { getTags } from '../../API/TagAPI';
import type { Tag } from '../../types/tagTypes';
import { useQuery } from '@tanstack/react-query';
import Loader from '../UI/Loader';


export const TagManager = () => {
    // TODO Traer el projectId de la URL
    const projectId = '65a1b2c3d4e5f6a7b8c9d0e1'

    // Cargar tags al montar
    const { data, isLoading } = useQuery<Tag[]>({
        queryKey: ['tags', projectId],
        queryFn: () => getTags(projectId),
    })

    if (isLoading) return <Loader />

    if (data) return (
        <div className="h-full flex flex-col bg-gray-100 p-6 max-h-screen">
            {/* Header */}
            <div className="">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Panel de Códigos</h2>
                    <button
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
            <div className="max-h-96 overflow-y-auto mt-2 py-4 pr-2 grow">
                <TagList
                    tags={data}
                />
            </div>
        </div>
    );
};