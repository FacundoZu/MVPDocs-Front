import { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import { useQuotesOfTag } from "../../hooks/UseQuotesOfTag";

// Definimos la interfaz para los datos que vienen en el nodo
interface TagNodeData {
  tagId: string;
  label: string;
  color: string;
}

// components/Network/CustomTagNode.tsx
export const CustomTagNode = memo(({ data }: { data: TagNodeData }) => {
  const [expanded, setExpanded] = useState(false);
  const { quotes } = useQuotesOfTag(data.tagId); // Tu custom hook

  return (
    <div 
      className="custom-node bg-white shadow-lg rounded-md border-2 p-2" 
      style={{ 
        borderColor: data.color,
        width: '200px', // 👈 FORZAR ANCHO PARA QUE NO MIDA 885px
        fontSize: '12px' 
      }}
    >
      <div className="font-bold border-b pb-1 mb-1">{data.label}</div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="node-body">
            {quotes.map(q => (
              <div key={q._id} className="quote-mini-preview">
                "{q.position.selectedText.substring(0, 30)}..."
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
});