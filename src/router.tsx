import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import AppLayout from "./layouts/AppLayout";
import { ProjectProvider } from "./context/ProjectContext";
import { Toaster } from "sonner";

// Vistas con Lazy Loading
const LandingPage = lazy(() => import("./views/LandingPage"));
const ProjectDocuments = lazy(() => import("./views/ProjectDocuments"));
const DocumentViewer = lazy(() => import("./views/DocumentViewer"));
const NetworkView = lazy(() => import("./views/NetworkView"));

export default function Router() {
    return (
        <ProjectProvider>
            <BrowserRouter>
                <Toaster />
                <Suspense fallback={<div>Cargando...</div>}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />

                        <Route path="/app" element={<AppLayout />}>
                            <Route path="projects/:projectId" element={<ProjectDocuments />} />
                            <Route path="projects/:projectId/documents/:documentId" element={<DocumentViewer />} />
                            <Route path="projects/:projectId/network/:networkId?" element={<NetworkView />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ProjectProvider>
    );
}