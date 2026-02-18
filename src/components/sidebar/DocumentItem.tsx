import { useNavigate, useParams } from 'react-router';
import { FiFileText } from 'react-icons/fi';

interface DocumentItemProps {
    documentId: string;
    projectId: string;
    title: string;
}

export default function DocumentItem({ documentId, projectId, title }: DocumentItemProps) {
    const navigate = useNavigate();
    const { documentId: activeDocumentId } = useParams();

    const isActive = activeDocumentId === documentId;

    return (
        <button
            onClick={() => navigate(`/projects/${projectId}/documents/${documentId}`)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <FiFileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="truncate text-xs">{title}</span>
        </button>
    );
}
