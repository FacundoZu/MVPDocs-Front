import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import { BsStars } from 'react-icons/bs';
import { HiMiniSlash } from 'react-icons/hi2';
import { useAIChatStore } from '../stores/useAIChatStore'; // 1. Importamos el store

export default function Breadcrumbs() {
    const { projectId, documentId } = useParams();

    // 2. Obtenemos la función para abrir el sidebar
    const openSidebar = useAIChatStore((state) => state.openSidebar);

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
        enabled: !!projectId,
    });

    const { data: document } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => documentApi.getById(documentId!),
        enabled: !!documentId,
    });

    if (!projectId) {
        return (
            <span className="text-sm text-gray-400">Selecciona un proyecto</span>
        );
    }

    return (
        <nav className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center space-x-2">
                <Link
                    to={`/projects/${projectId}`}
                    className={`font-medium transition-colors ${documentId ? 'text-gray-500 hover:text-gray-800' : 'text-gray-900'
                        }`}
                >
                    {project?.name ?? '...'}
                </Link>

                {documentId && (
                    <>
                        <HiMiniSlash className="text-gray-400" />
                        <span className="text-gray-900 font-medium">
                            {document?.title ?? '...'}
                        </span>
                    </>
                )}
            </div>
            {documentId && (
                // 3. Cambiamos Link por button y le pasamos el onClick
                <button
                    onClick={openSidebar}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-4xl hover:bg-indigo-700 transition-colors duration-200 cursor-pointer shadow-sm"
                >
                    <BsStars />
                    <span>Asistente IA</span>
                </button>
            )}
        </nav>
    );
}
