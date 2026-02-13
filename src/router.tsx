import { BrowserRouter, Routes, Route } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { Documents } from "./views/Documents";


export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Documents />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}