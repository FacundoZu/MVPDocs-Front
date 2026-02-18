import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../API/documents';
import DocumentUpload from '../components/document/DocumentUpload';
import DocumentTable from '../components/document/DocumentTable';

export function ProjectDocuments() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documents', projectId],
        queryFn: () => documentApi.list(projectId!),
        enabled: !!projectId,
    });

    const deleteMutation = useMutation({
        mutationFn: documentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
        },
    });

    if (!projectId) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>Selecciona un proyecto desde el sidebar</p>
            </div>
        );
    }

    const tableDocuments = documents.map((doc) => ({
        id: doc._id,
        name: doc.title || doc.originalFilename,
        size: doc.metadata?.characterCount ?? 0,
        uploadedAt: new Date(doc.createdAt),
        type: doc.originalFormat,
    }));

    return (
        <div className="flex flex-col h-full bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto w-full space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Documento</h2>
                    <DocumentUpload
                        onUploadSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
                        }}
                        projectId={projectId}
                    />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Documentos {isLoading && <span className="text-sm font-normal text-gray-400">Cargando...</span>}
                    </h2>
                    <DocumentTable
                        documents={tableDocuments}
                        onDocumentView={(doc) => navigate(`/projects/${projectId}/documents/${doc.id}`)}
                        onDocumentDelete={(id) => deleteMutation.mutate(id)}
                    />
                </div>
            </div>
        </div>
    );
}
