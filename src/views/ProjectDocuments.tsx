import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import DocumentUpload from '../components/document/DocumentUpload';
import DocumentTable from '../components/document/DocumentTable';
import type { ProjectWithDocs } from '../components/sidebar/ProjectItem';

export function ProjectDocuments() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
        initialData: () => {
            const all = queryClient.getQueryData<ProjectWithDocs[]>(['projects']);
            return all?.find(p => p._id === projectId);
        },
        initialDataUpdatedAt: () => queryClient.getQueryState(['projects'])?.dataUpdatedAt,
        staleTime: 30_000,
    });

    const deleteMutation = useMutation({
        mutationFn: documentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    if (!projectId) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>Selecciona un proyecto desde el sidebar</p>
            </div>
        );
    }

    type EmbeddedDoc = { id: string; title: string; createdAt?: string };
    const embeddedDocs: EmbeddedDoc[] = (project as any)?.documents ?? [];
    const tableDocuments = embeddedDocs.map((doc) => ({
        id: doc.id,
        name: doc.title,
        size: 0,
        uploadedAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        type: 'docx',
    }));

    return (
        <div className="flex flex-col h-full bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto w-full space-y-6">
                <div>
                    <DocumentUpload
                        projectId={projectId}
                        onUploadSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                            queryClient.invalidateQueries({ queryKey: ['projects'] });
                        }}
                    />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Documentos del proyecto <span className="text-xs text-gray-400 ml-2 font-semibold">{tableDocuments.length} archivo/s</span>
                        {isLoading && <span className="text-sm font-normal text-gray-400 ml-2">Cargando...</span>}
                    </h2>
                    <DocumentTable
                        documents={tableDocuments}
                        onDocumentView={(doc) => navigate(`/app/projects/${projectId}/documents/${doc.id}`)}
                        onDocumentDelete={(id) => deleteMutation.mutate(id)}
                    />
                </div>

            </div>
        </div>
    );
}
