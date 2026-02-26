import { BrowserRouter, Routes, Route } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { ProjectProvider } from "./context/ProjectContext";
import { ProjectDocuments } from "./views/ProjectDocuments";
import { DocumentViewer } from "./views/DocumentViewer";
import { Toaster } from "sonner";
import { LandingPage } from "./views/LandingPage";

export default function Router() {
    return (
        <ProjectProvider>
            <BrowserRouter>
                <Toaster />
                <Routes>
                    <Route path="/" element={<LandingPage />} />

                    <Route path="/app" element={<AppLayout />}>
                        <Route path="projects/:projectId" element={<ProjectDocuments />} />
                        <Route path="projects/:projectId/documents/:documentId" element={<DocumentViewer />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ProjectProvider>
    );
}