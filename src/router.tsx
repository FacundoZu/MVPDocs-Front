import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./layouts/AppLayout";
import { ProjectProvider } from "./context/ProjectContext";
import { ProjectDocuments } from "./views/ProjectDocuments";
import { DocumentViewer } from "./views/DocumentViewer";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            retry: 1,
        },
    },
});

export default function Router() {
    return (
        <QueryClientProvider client={queryClient}>
            <ProjectProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<AppLayout />}>
                            <Route index element={<Navigate to="/projects" replace />} />
                            <Route path="projects" element={<Navigate to="/" replace />} />
                            <Route path="projects/:projectId" element={<ProjectDocuments />} />
                            <Route path="projects/:projectId/documents/:documentId" element={<DocumentViewer />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ProjectProvider>
        </QueryClientProvider>
    );
}