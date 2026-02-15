import ButtonSummary from "../AI/ButtonSummary";


export default function Header() {
    return (
        <header className="flex items-center justify-between w-full py-4">

            <div>
                <h2 className="text-2xl font-bold">MVP-Docs</h2>
            </div>
            <nav>
                <ButtonSummary />
            </nav>

        </header>
    )
}
