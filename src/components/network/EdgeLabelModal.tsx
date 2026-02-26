import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { label: string, type: string, strength: number }) => void;
}

export const EdgeLabelModal = ({ isOpen, onClose, onSubmit }: ModalProps) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('similar');
  // TODO agregar setStrength
  const [strength] = useState(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-bold mb-4">Definir Relación</h3>

        <div className="space-y-4">
          <label className="block">
            Tipo de relación:
            <select
              className="w-full border p-2 rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="causal">Causa</option>
              <option value="contradicts">Contradice</option>
              <option value="supports">Refuerza</option>
              <option value="similar">Similar</option>
            </select>
          </label>

          <label className="block">
            Etiqueta:
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancelar</button>
          <button
            onClick={() => onSubmit({ label, type, strength })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Crear Conexión
          </button>
        </div>
      </div>
    </div>
  );
};