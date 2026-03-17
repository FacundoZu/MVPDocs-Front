import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import DocumentUpload from '../components/document/DocumentUpload';
import DocumentTable from '../components/document/DocumentTable';
import Loader from '../components/ui/Loader';

export default function ProjectDocuments() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
    });

    const deleteMutation = useMutation({
        mutationFn: documentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    if (isLoading) {
        return <Loader />;
    }

    if (project) {
        return (
            <div className="flex flex-col h-full bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto w-full space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Documentos del proyecto <span className="text-xs text-gray-400 ml-2 font-semibold">{project.documents.length} archivo/s</span>
                            {isLoading && <span className="text-sm font-normal text-gray-400 ml-2">Cargando...</span>}
                        </h2>
                        <DocumentTable
                            documents={project.documents}
                            onDocumentView={(doc) => navigate(`/app/projects/${projectId}/documents/${doc.id}`)}
                            onDocumentDelete={(id) => deleteMutation.mutate(id)}
                        />
                    </div>

                    <div>
                        <DocumentUpload
                            projectId={projectId!}
                            onUploadSuccess={() => {
                                queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                                queryClient.invalidateQueries({ queryKey: ['projects'] });
                            }}
                        />
                    </div>

                </div>
            </div>
        )
    } else {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>Selecciona un proyecto desde el sidebar</p>
            </div>
        );
    }
}
