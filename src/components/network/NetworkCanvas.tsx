import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import debounce from 'lodash/debounce';
import { useNetworkStore } from '../../store/UseNetworkStore';
import { CustomTagNode } from './CustomTagNode';
import { EdgeLabelModal } from './EdgeLabelModal';

// ✅ PASO 1: Definir nodeTypes FUERA del componente para evitar el warning #002
const nodeTypes = {
  tagNode: CustomTagNode,
};

interface NetworkCanvasProps {
  projectId: string;
  networkId: string;
}

// TODO agregar prop projectId
export const NetworkCanvas = ({ networkId }: NetworkCanvasProps) => {
  const {
    nodes = [], edges = [], viewport,
    onNodesChange, onEdgesChange, onConnect,
    loadFromBackend, saveNetwork
  } = useNetworkStore();

  // 2. Estados para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<any>(null);

  // 3. Modificamos el disparador de conexión
  const handleConnect = (params: any) => {
    setPendingConnection(params); // Guardamos la conexión temporalmente
    setIsModalOpen(true);         // Abrimos el modal
  };

  const onModalSubmit = (data: any) => {
    // 4. Creamos el edge final con los datos del modal
    onConnect({
      ...pendingConnection,
      label: data.label,
      animated: data.type === 'causal', // Por ejemplo, las causas se mueven
      data: { type: data.type }
    });
    setIsModalOpen(false);
  };

  const debouncedSave = useMemo(
    () =>
      debounce(async () => {
        if (!networkId) return;
        try {
          await saveNetwork(networkId);
        } catch (error) {
          console.error("Error al guardar:", error);
        }
      }, 800),
    [networkId, saveNetwork]
  );

  // ✅ PASO 2: Fix al error de .length usando el operador '?' 
  useEffect(() => {
    // Verificamos con '?' para que si es undefined no rompa la app
    if (nodes?.length > 0 || edges?.length > 0) {
      debouncedSave();
    }
    return () => debouncedSave.cancel();
  }, [nodes, edges, viewport, debouncedSave]);

  useEffect(() => {
    if (networkId) {
      loadFromBackend(networkId);
    }
  }, [networkId, loadFromBackend]);



  // Si nodes está vacío, React Flow no mostrará nada
  if (nodes.length === 0) {
    return <div className="p-10 text-center">Cargando nodos... (ID: {networkId})</div>;
  }

  return (
    <div className="w-full h-[80vh] bg-gray-200 border border-red-500">
      <ReactFlow
        nodes={nodes} // ✅ Aseguramos que siempre sea al menos un array vacío
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <EdgeLabelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onModalSubmit}
      />
    </div>
  );
};