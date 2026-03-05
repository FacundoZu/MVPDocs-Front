import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProject } from '../../context/ProjectContext';
import { projectApi } from '../../API/projects';
import { FiFolder, FiFolderPlus, FiPlus, FiLoader, FiPlusCircle } from 'react-icons/fi';
import ProjectItem from './ProjectItem';
import type { ProjectWithDocs } from './ProjectItem';
import NewProjectModal from './NewProjectModal';
import { useNavigate } from 'react-router';

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
    const navigate = useNavigate();

    return (
        <>
            <aside className="w-64 shrink-0 h-full bg-white border-r border-gray-200 flex flex-col">
                <div className="px-4 py-4 border-b border-gray-200">
                    <button 
                    onClick={() => navigate('/app')}
                    title="Ver todas las redes semánticas"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 hover:bg-indigo-150 hover:text-indigo-600 transition-all duration-200shadow-sm hover:shadow-md cursor-pointer group ">
                    <FiPlusCircle className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />

                    <span className="text-sm font-semibold">
                        Redes Semánticas
                    </span>
                    </button>
                </div>
                <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiFolderPlus className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">Proyectos</span>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        title="Nuevo proyecto"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <FiPlus className="w-4 h-4" />
                    </button>
                </div>

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
                                Crear un proyecto
                            </button>
                        </div>
                    ) : (
                        (projects as ProjectWithDocs[]).map((project) => (
                            <ProjectItem key={project._id} project={project} />
                        ))
                    )}
                </div>

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
