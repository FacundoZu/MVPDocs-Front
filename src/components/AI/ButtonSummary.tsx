import { BsStars } from "react-icons/bs";
import { Link } from "react-router";

export default function ButtonSummary() {
    return (
        <Link to={location.pathname + '?isOpen=true'} className="flex items-center px-4 py-2 bg-purple-700 text-white rounded-2xl">
            <BsStars />
            <span>Resumir con IA</span>
        </Link>
    )
}
