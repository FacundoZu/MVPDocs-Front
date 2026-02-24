import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FiFolder, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import DocumentItem from './DocumentItem';

// Tipo extendido que incluye los documentos embebidos que devuelve GET /projects
export interface ProjectWithDocs {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    documents: { id: string; title: string }[];
}

interface ProjectItemProps {
    project: ProjectWithDocs;
}

export default function ProjectItem({ project }: ProjectItemProps) {
    const navigate = useNavigate();
    const { projectId: activeProjectId } = useParams();
    const [isOpen, setIsOpen] = useState(activeProjectId === project._id);

    const isActive = activeProjectId === project._id;

    const handleClick = () => {
        console.log(project._id, isActive)
        navigate(`/app/projects/${project._id}`);
        setIsOpen((prev) => !prev);
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                {isOpen
                    ? <FiChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                    : <FiChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                }
                <FiFolder className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="truncate">{project.name}</span>
                {project.documents.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{project.documents.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">
                    {project.documents.length === 0 ? (
                        <p className="text-xs text-gray-400 px-3 py-1.5 italic">Sin documentos aún</p>
                    ) : (
                        project.documents.map((doc) => (
                            <DocumentItem
                                key={doc.id}
                                documentId={doc.id}
                                projectId={project._id}
                                title={doc.title}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
