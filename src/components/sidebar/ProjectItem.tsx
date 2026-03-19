import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FiFolder, FiChevronDown, FiChevronRight, FiChevronLeft, FiTag } from 'react-icons/fi';
import DocumentItem from './DocumentItem';
import type { ProjectDocument } from '../../API/projects';

// Tipo extendido que incluye los documentos embebidos que devuelve GET /projects
export interface ProjectWithDocs {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    documents: ProjectDocument[];
}

interface ProjectItemProps {
    project: ProjectWithDocs;
    onOpenTags: (projectId: string, projectName: string) => void;
    tagsOpen: boolean; // si el drawer de tags está abierto para este proyecto
}

export default function ProjectItem({ project, onOpenTags, tagsOpen }: ProjectItemProps) {
    const navigate = useNavigate();
    const { projectId: activeProjectId } = useParams();
    const [isOpen, setIsOpen] = useState(activeProjectId === project._id);

    const isActive = activeProjectId === project._id;

    const handleClick = () => {
        navigate(`/app/projects/${project._id}`);
        setIsOpen((prev) => !prev);
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                {isOpen
                    ? <FiChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                    : <FiChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                }
                <FiFolder className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                <span className="truncate">{project.name}</span>
                {project.documents.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{project.documents.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenTags(project._id, project.name);
                        }}
                        title="Ver códigos del proyecto"
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors mt-1 ${tagsOpen
                            ? 'text-primary bg-primary/10 font-medium'
                            : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                            }`}
                    >
                        <FiTag className="w-3 h-3 shrink-0" />
                        <span>Ver códigos</span>
                        <span className="ml-auto">
                            {tagsOpen
                                ? <FiChevronLeft className="w-3 h-3" />
                                : <FiChevronRight className="w-3 h-3" />}
                        </span>
                    </button>

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
