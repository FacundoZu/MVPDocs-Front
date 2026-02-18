import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { Project } from '../../context/ProjectContext';
import { documentApi } from '../../API/documents';
import { FiFolder, FiChevronDown, FiChevronRight, FiLoader } from 'react-icons/fi';
import DocumentItem from './DocumentItem';

interface ProjectItemProps {
    project: Project;
}

export default function ProjectItem({ project }: ProjectItemProps) {
    const navigate = useNavigate();
    const { projectId: activeProjectId } = useParams();
    const [isOpen, setIsOpen] = useState(activeProjectId === project._id);

    const isActive = activeProjectId === project._id;

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documents', project._id],
        queryFn: () => documentApi.list(project._id),
        enabled: isOpen,
    });

    const handleClick = () => {
        navigate(`/projects/${project._id}`);
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
            </button>

            {isOpen && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">
                    {isLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2">
                            <FiLoader className="w-3 h-3 text-gray-400 animate-spin" />
                            <span className="text-xs text-gray-400">Cargando...</span>
                        </div>
                    ) : documents.length === 0 ? (
                        <p className="text-xs text-gray-400 px-3 py-1.5 italic">Sin documentos aún</p>
                    ) : (
                        documents.map((doc) => (
                            <DocumentItem
                                key={doc._id}
                                documentId={doc._id}
                                projectId={project._id}
                                title={doc.title || doc.originalFilename}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
