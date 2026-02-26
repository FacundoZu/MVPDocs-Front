import { useNavigate } from 'react-router';
import DemoAnimation from '../components/landing/DemoAnimation';
import { FiZap } from 'react-icons/fi';


export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden cursor-default">

            <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <FiZap className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg tracking-tight">Taiper</span>
                </div>
            </nav>

            <section className="relative z-10 text-center px-6 pt-10 pb-4 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-primary text-xs font-medium mb-6">
                    Investigación cualitativa
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-5">
                    Análisis Cualitativo{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-black to-primary">
                        Potenciado por IA
                    </span>
                </h1>

                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                    La herramienta moderna para investigadores. Sube tus entrevistas, codifica con precisión y descubre patrones que los métodos tradicionales no ven.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => navigate('/app')}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 cursor-pointer"
                    >
                        Comenzar
                    </button>
                </div>

                <DemoAnimation />
            </section>

            <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs">
                <div className="flex items-center justify-center gap-2 mb-1 text-primary">
                    <FiZap className="w-3.5 h-3.5" />
                    <span>Taiper</span>
                </div>
                <p>Herramienta de análisis cualitativo para investigadores</p>
            </footer>
        </div>
    );
}
