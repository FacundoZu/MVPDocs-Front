import { useState } from 'react'; // Nuevo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkApi } from '../store/UseNetworkStore';
import { useNavigate } from 'react-router';
import { BsDiagram3, BsSquare, BsArrowRight, BsTrash, BsEye } from 'react-icons/bs';
import { toast } from 'sonner';
import DeleteNetworkModal from '../components/network/DeleteNetworkModal'; // Importar el modal

export default function RecentNetworksView() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Estados para el modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<{id: string, name: string} | null>(null);

    const { data: networks = [], isLoading } = useQuery({
        queryKey: ['networks', 'recent'],
        queryFn: networkApi.getRecent,
    });

    const deleteMutation = useMutation({
        mutationFn: networkApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['networks'] });
            toast.success("Red eliminada correctamente");
        }
    });

    // Nueva función para abrir el modal
    const openDeleteModal = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        setSelectedNetwork({ id, name });
        setIsDeleteModalOpen(true);
    };

    if (isLoading) return <p className="p-10 text-center">Cargando redes recientes...</p>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-2">Redes Semánticas Recientes</h1>
            <p className="text-gray-500 mb-8">Últimas modificaciones realizadas en todos tus proyectos.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {networks.map((net: any) => (
                    <div key={net._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <BsDiagram3 className="text-2xl" />
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-400">
                                        <BsSquare size={10} /> {net.nodesCount} Nodos
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-400">
                                        <BsArrowRight /> {net.edgesCount} Conexiones
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{net.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">
                                    {net.projectName}
                                </span>
                            </div>
                            
                            <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1">
                                <span className="font-medium text-gray-500">Editado:</span> 
                                {new Date(net.updatedAt).toLocaleString('es-AR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button 
                                onClick={() => navigate(`/app/projects/${net.projectId._id}/network/${net._id}`)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <BsEye className="text-lg" />
                                <span>Abrir Visualización</span>
                            </button>
                            
                            <button 
                                onClick={(e) => openDeleteModal(e, net._id, net.name)}
                                className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95"
                            >
                                <BsTrash className="text-lg" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            <DeleteNetworkModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => selectedNetwork && deleteMutation.mutate(selectedNetwork.id)}
                networkName={selectedNetwork?.name || ""}
            />
        </div>
    );
}