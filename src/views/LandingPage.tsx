import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import DemoAnimation from '../components/landing/DemoAnimation';
import { FiZap } from 'react-icons/fi';

export default function LandingPage() {
    const navigate = useNavigate();
    const [mouse, setMouse] = useState({ x: -9999, y: -9999 });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                setMouse({ x: e.clientX, y: e.clientY });
            });
        };
        window.addEventListener('mousemove', onMove);
        return () => {
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-white overflow-x-hidden cursor-default">

            {/* Spotlight cursor */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px,
                        rgba(79, 57, 246, 0.08) 0%,
                        rgba(79, 57, 246, 0.02) 40%,
                        transparent 70%)`
                }}
            />

            {/* Grid dot pattern — muy sutil */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.23]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #4f39f6 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Orbes de fondo */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="landing-orb-1 absolute -top-32 -right-20 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[130px]" />
                <div className="landing-orb-2 absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[110px]" />
                <div className="landing-orb-3 absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-violet-400/10 blur-[90px]" />
            </div>

            {/* Contenido */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <FiZap className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg tracking-tight text-gray-900">Taiper</span>
                </div>
            </nav>

            <section className="relative z-10 text-center px-6 pt-10 pb-4 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
                    Investigación cualitativa
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-5 text-gray-900">
                    Análisis Cualitativo{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-500">
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

            <footer className="relative z-10 border-t border-gray-100 py-8 text-center text-xs text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-1 text-primary">
                    <FiZap className="w-3.5 h-3.5" />
                    <span>Taiper</span>
                </div>
                <p>Herramienta de análisis cualitativo para investigadores</p>
            </footer>
        </div>
    );
}
