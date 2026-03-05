import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsDiagram3 } from 'react-icons/bs';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

export default function NewNetworkModal({ isOpen, onClose, onSubmit }: Props) {
    const [name, setName] = useState('');

    const handleAction = () => {
        if (!name.trim()) return;
        onSubmit(name);
        setName(''); // Reset
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                            <BsDiagram3 className="text-2xl" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nueva Red Semántica</h3>
                        <p className="text-gray-500 text-sm mb-6">Asigna un nombre para identificar este análisis conceptual.</p>
                        
                        <input 
                            autoFocus
                            type="text"
                            placeholder="Ej: Análisis de Causas"
                            className="w-full border-2 border-gray-100 rounded-xl p-3 mb-6 focus:border-indigo-500 outline-none transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                        />
                        
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button 
                                onClick={handleAction}
                                disabled={!name.trim()}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                            >
                                Crear Red
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}