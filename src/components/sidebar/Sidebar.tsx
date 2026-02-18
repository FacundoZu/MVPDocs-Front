import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProject } from '../../context/ProjectContext';
import { projectApi } from '../../API/projects';
import type { Project } from '../../context/ProjectContext';
import { FiFolder, FiFolderPlus, FiPlus, FiLoader } from 'react-icons/fi';
import ProjectItem from './ProjectItem';
import NewProjectModal from './NewProjectModal';

export default function Sidebar() {
    const { addProject } = useProject();
    const [showModal, setShowModal] = useState(false);

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectApi.list,
    });

    const handleCreated = async (data: { name: string; description?: string }) => {
        await addProject(data);
        setShowModal(false);
    };

    return (
        <>
            <aside className="w-64 shrink-0 h-full bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiFolderPlus className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">Proyectos</span>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        title="Nuevo proyecto"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                    </button>
                </div>

                {/* Lista de proyectos */}
                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <FiLoader className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <FiFolder className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">No hay proyectos todavía</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-2 text-xs text-blue-600 hover:underline"
                            >
                                Crear el primero
                            </button>
                        </div>
                    ) : (
                        projects.map((project: Project) => (
                            <ProjectItem key={project._id} project={project} />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        Nuevo proyecto
                    </button>
                </div>
            </aside>

            {showModal && (
                <NewProjectModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleCreated}
                />
            )}
        </>
    );
}
