import { Outlet } from "react-router";
import Header from "../components/UI/Header";


export default function AppLayout() {

    return (
        <main className="h-screen px-20">
            {/* <Header /> */}
            <section className="overflow-y-auto">
                <Outlet />
            </section>
        </main>
    )
}
