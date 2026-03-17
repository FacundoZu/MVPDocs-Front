import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useAIChatStore } from '../stores/useAIChatStore';
import ChatSidebar from '../components/AI/ChatSidebar';

interface RightSidebarLayoutProps {
    context: string;
}

export default function RightSidebarLayout({ context }: RightSidebarLayoutProps) {
    const { activeSidebar, openSidebar, closeSidebar } = useAIChatStore();

    // TRUCO: Estado local para recordar la última pestaña abierta.
    // Así, cuando activeSidebar pasa a ser null (cerrando), el contenido 
    // no se borra de golpe y podemos ver cómo se desliza hacia afuera.
    const [activeTab] = useState<'CHAT'>('CHAT');

    return (
        <aside
            // Manejamos la animación modificando el ancho (w-1/3 vs w-0) y la opacidad.
            // overflow-hidden es vital para que nada sobresalga mientras se encoge.
            className={`flex flex-col bg-gray-50 min-h-full max-h-screen shadow-2xl z-20 transition-all duration-300 ease-in-out overflow-hidden ${activeSidebar
                ? 'w-1/3 border-l border-gray-200 opacity-100'
                : 'w-0 border-none opacity-0'
                }`}
        >
            {/* Contenedor interno fijado. Al poner un min-w-[380px], obligamos a que 
                el contenido mantenga su forma original y simplemente se "recorte" 
                hacia la derecha mientras el aside se hace más pequeño.
            */}
            <div className="w-full min-w-[380px] flex flex-col h-full">
                {/* Header Unificado + Pestañas */}
                <div className="flex flex-col p-4 border-b border-gray-200 bg-white gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Panel de Análisis</h2>
                        <button
                            onClick={closeSidebar}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>

                    {/* Solo Chat IA */}
                    <div className="flex bg-gray-100 rounded-lg p-2">
                        <button
                            onClick={() => openSidebar('CHAT')}
                            className="flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer bg-white text-indigo-600 shadow-sm"
                        >
                            Chat IA
                        </button>
                    </div>
                </div>

                {/* Contenedor dinámico */}
                <div className="grow flex flex-col overflow-hidden relative">
                    {/* Renderizamos basados en nuestra memoria local (activeTab) en lugar del global (activeSidebar) */}
                    {activeTab === 'CHAT' && <ChatSidebar context={context} />}
                </div>
            </div>
        </aside>
    );
}