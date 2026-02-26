import { create } from 'zustand';
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  type Connection, 
  type Edge, 
  type Node, 
  type OnNodesChange, 
  type OnEdgesChange,
  type NodeChange,
  type EdgeChange,
  type Viewport 
} from 'reactflow';
import axios from 'axios';
import dagre from 'dagre';

interface NetworkState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  version: number;
  loading: boolean;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;

  loadFromBackend: (networkId: string) => Promise<void>;
  saveNetwork: (networkId: string) => Promise<void>;
  applyAutoLayout: () => void;
}

export const useNetworkStore = create<NetworkState>()((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  version: 1,
  loading: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const newEdge = { 
      ...connection, 
      id: `e-${Date.now()}`, 
      animated: true, 
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  loadFromBackend: async (networkId: string) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`/api/networks/${networkId}`);
      set({ 
        nodes: data.nodes || [], 
        edges: data.edges || [], 
        viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
        version: data.version || 1 
      });
    } catch (error) {
      console.error("Error cargando la red del backend:", error);
      set({ nodes: [], edges: [] }); 
    } finally {
      set({ loading: false });
    }
  },

  saveNetwork: async (networkId) => {
    const { nodes, edges, viewport, version } = get();
    try {
      const { data } = await axios.patch(`/api/networks/${networkId}`, {
        nodes,
        edges,
        viewport,
        version
      });
      set({ version: data.version });
    } catch (error) {
      throw error;
    }
  },

  applyAutoLayout: () => {
    const { nodes, edges } = get();
    if (!nodes || nodes.length === 0) return; 
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR' }); 

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 100 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100,
          y: nodeWithPosition.y - 50,
        },
      };
    });

    set({ nodes: layoutedNodes });
  }
}));