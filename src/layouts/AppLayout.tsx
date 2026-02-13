import { Outlet } from "react-router";


export default function AppLayout() {

    return (
        <main className="flex h-screen">
            <section className="w-full px-10 overflow-y-auto">
                <Outlet />
            </section>
        </main>
    )
}
