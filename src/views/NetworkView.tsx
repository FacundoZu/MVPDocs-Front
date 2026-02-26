import { useParams, useNavigate } from "react-router";
import { NetworkCanvas } from "../components/network/NetworkCanvas";
import { useNetworkStore } from "../store/UseNetworkStore";
import { toast } from "sonner";
import { BsDiagram3, BsPlusCircle, BsSquare, BsArrowRight } from "react-icons/bs";
import api from "../lib/axios";

export default function NetworkView() {
    const { projectId, networkId } = useParams();
    const navigate = useNavigate();
    const { applyAutoLayout } = useNetworkStore();

    // Redes simuladas para MVP con contadores de nodos y conexiones
    const mockNetworks = [
        { id: "mock-1", name: "Causas de la Ansiedad", date: "24/02/2026", nodesCount: 17, edgesCount: 12 },
        { id: "mock-2", name: "Consecuencias del Estrés", date: "25/02/2026", nodesCount: 8, edgesCount: 5 },
        { id: "mock-3", name: "Relaciones de Causa", date: "26/02/2026", nodesCount: 22, edgesCount: 30 },
    ];

    const handleGenerateNetwork = async () => {
        try {
            const { data } = await api.post('/networks/generate-from-project', {
                projectId
            });

            toast.success("Red generada con éxito");
            navigate(`/app/projects/${projectId}/network/${data._id}`);
        } catch {
            toast.error("Error al generar la red inicial");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">
                    Redes Semánticas {networkId ? `- ${networkId}` : ''}
                </h1>
                {networkId && (
                    <button
                        onClick={applyAutoLayout}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        Auto-Organizar
                    </button>
                )}
            </header>

            <main className="grow relative overflow-y-auto p-8">
                {networkId ? (
                    <NetworkCanvas projectId={projectId!} networkId={networkId!} />
                ) : (
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-700">Explorador de Redes</h2>
                            <p className="text-gray-500">Gestiona y visualiza las relaciones conceptuales de tu proyecto.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button
                                onClick={handleGenerateNetwork}
                                className="group border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-green-500 hover:bg-green-50 transition-all duration-300 min-h-[200px]"
                            >
                                <BsPlusCircle className="text-4xl text-gray-400 group-hover:text-green-600 transition-colors" />
                                <div className="text-center">
                                    <span className="block font-bold text-gray-600 group-hover:text-green-700">Generar Nueva Red</span>
                                    <span className="text-xs text-gray-400">Sincroniza tus etiquetas actuales</span>
                                </div>
                            </button>

                            {mockNetworks.map((net) => (
                                <div
                                    key={net.id}
                                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-default"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <BsDiagram3 className="text-2xl text-indigo-600" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <BsSquare className="text-[10px]" /> {net.nodesCount} Nodos
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <BsArrowRight /> {net.edgesCount} Conexiones
                                            </div>
                                        </div>
                                        {/* <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            Guardada
                                        </span> */}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">{net.name}</h3>
                                    <p className="text-xs text-gray-400 mb-6 uppercase font-semibold">Proyecto: {projectId?.substring(0, 8)}... • {net.date}</p>
                                    {/* <p className="text-sm text-gray-500 mb-6">Creada el {net.date}</p> */}

                                    <button
                                        onClick={() => toast.info("Funcionalidad simulada para el MVP")}
                                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                        Abrir Visualización
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}