import { BrowserRouter, Routes, Route } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { Documents } from "./views/Documents";
import Example from "./views/Example";
import { Toaster } from "sonner";
import { TagManager } from "./components/Tags/TagManager";


export default function Router() {
    return (
        <BrowserRouter>
            <Toaster />
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Documents />} />
                    <Route path="example" element={<Example />} />
                    <Route path="tags" element={<TagManager />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}