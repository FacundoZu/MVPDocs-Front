import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { ProjectProvider } from "./context/ProjectContext";
import { ProjectDocuments } from "./views/ProjectDocuments";
import { DocumentViewer } from "./views/DocumentViewer";
import { Toaster } from "sonner";
import { NetworkView } from "./views/NetworkView";

export default function Router() {
    return (
        <ProjectProvider>
            <BrowserRouter>
                <Toaster />
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Navigate to="/projects" replace />} />
                        <Route path="projects" element={<Navigate to="/" replace />} /> 
                        <Route path="projects/:projectId" element={<ProjectDocuments />} />
                        <Route path="projects/:projectId/documents/:documentId" element={<DocumentViewer />} />
                        <Route path="projects/:projectId/network/:networkId?" element={<NetworkView />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ProjectProvider>
    )
}