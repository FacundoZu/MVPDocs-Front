import { Link } from "react-router";
import { BsStars } from "react-icons/bs";


export default function Header() {
    return (
        <header className="flex items-center justify-between w-full py-4">

            <div>
                <h2 className="text-2xl font-bold">MVP-Docs</h2>
            </div>
            <nav>
                <Link to={location.pathname + '?isOpen=true'} className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-4xl hover:bg-purple-800 transition-colors duration-200">
                    <BsStars />
                    <span>Resumir con IA</span>
                </Link>
            </nav>

        </header>
    )
}
