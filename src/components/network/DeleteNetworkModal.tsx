import { motion, AnimatePresence } from 'framer-motion';
import { BsTrash, BsExclamationTriangle } from 'react-icons/bs';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    networkName: string;
}

export default function DeleteNetworkModal({ isOpen, onClose, onConfirm, networkName }: DeleteModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    
                    {/* Modal Card */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center"
                    >
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                            <BsExclamationTriangle className="text-3xl text-red-600" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            ¿Eliminar red semántica?
                        </h3>
                        <p className="text-gray-500 text-sm mb-8">
                            Estás por eliminar <span className="font-bold text-gray-800">"{networkName}"</span>. 
                            Esta acción no se puede deshacer.
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                            >
                                <BsTrash />
                                Eliminar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}