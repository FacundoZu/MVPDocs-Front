import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import { BsDiagram3 } from 'react-icons/bs';
import { HiMiniSlash } from 'react-icons/hi2';
import { useAIChatStore } from '../stores/useAIChatStore'; // 1. Importamos el store
import { VscLayoutSidebarRight, VscLayoutSidebarRightOff } from 'react-icons/vsc';

export default function Breadcrumbs() {
    const { projectId, documentId } = useParams();

    // 2. Obtenemos la función para abrir el sidebar
    const { activeSidebar, openSidebar, closeSidebar } = useAIChatStore();

    const toggleSidebar = () => {
        if (activeSidebar) {
            closeSidebar();
        } else {
            openSidebar('CHAT'); // Por defecto abre el chat si estaba cerrado
        }
    };

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
            <span className="text-sm text-gray-400 py-2">Selecciona un proyecto</span>
        );
    }

    return (
        <nav className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center space-x-2 py-2">
                <Link
                    to={`/app/projects/${projectId}`}
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
            <div className="flex items-center gap-3">
                <Link
                    to={`/app/projects/${projectId}/network`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-4xl hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                    <BsDiagram3 className="text-indigo-600" />
                    <span>Ver Red Semántica</span>
                </Link>
                {documentId && (
                    // 3. Cambiamos Link por button y le pasamos el onClick
                    <button
                        onClick={toggleSidebar}
                        className={`p-2 rounded-xl transition-colors duration-200 cursor-pointer hover:text-primary hover:bg-primary/20 ${activeSidebar
                            ? 'bg-primary-50 text-primary'
                            : 'bg-white text-gray-400'
                            }`}
                        title="Alternar panel lateral"
                    >
                        {activeSidebar ? (
                            <VscLayoutSidebarRight size={20} />
                        ) : (
                            <VscLayoutSidebarRightOff size={20} />
                        )}
                    </button>
                )}
            </div>
        </nav>
    );
}
