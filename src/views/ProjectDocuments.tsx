import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../API/projects';
import { documentApi } from '../API/documents';
import DocumentUpload from '../components/document/DocumentUpload';
import DocumentTable from '../components/document/DocumentTable';
import TagManager from '../components/tags/TagManager';

export function ProjectDocuments() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Cargamos el proyecto (que ya incluye sus documentos embebidos)
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getById(projectId!),
        enabled: !!projectId,
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

    // Los documentos vienen embebidos en el proyecto: { id, title, createdAt }
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Documento</h2>
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
                        Documentos
                        {isLoading && <span className="text-sm font-normal text-gray-400 ml-2">Cargando...</span>}
                    </h2>
                    <DocumentTable
                        documents={tableDocuments}
                        onDocumentView={(doc) => navigate(`/projects/${projectId}/documents/${doc.id}`)}
                        onDocumentDelete={(id) => deleteMutation.mutate(id)}
                    />
                </div>

                <TagManager projectId={projectId} />
            </div>
        </div>
    );
}
