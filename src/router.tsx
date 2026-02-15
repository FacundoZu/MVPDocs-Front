import { BrowserRouter, Routes, Route } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { Documents } from "./views/Documents";
import Example from "./views/Example";


export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Documents />} />
                    <Route path="example" element={<Example />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}