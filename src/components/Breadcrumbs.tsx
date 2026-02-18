import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumbs() {
    const { projectId, documentId } = useParams();

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
        <nav className="flex items-center space-x-2 text-sm">
            <Link
                to={`/projects/${projectId}`}
                className={`font-medium transition-colors ${documentId ? 'text-gray-500 hover:text-gray-800' : 'text-gray-900'
                    }`}
            >
                {project?.name ?? '...'}
            </Link>

            {documentId && (
                <>
                    <FiChevronRight className="text-gray-400" />
                    <span className="text-gray-900 font-medium">
                        {document?.title ?? '...'}
                    </span>
                </>
            )}
        </nav>
    );
}
