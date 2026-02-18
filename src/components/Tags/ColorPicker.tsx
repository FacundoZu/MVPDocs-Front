const PRESET_COLORS = [
    { name: 'Rojo', hex: '#EF4444' },
    { name: 'Naranja', hex: '#F59E0B' },
    { name: 'Amarillo', hex: '#EAB308' },
    { name: 'Verde', hex: '#10B981' },
    { name: 'Azul', hex: '#3B82F6' },
    { name: 'Índigo', hex: '#6366F1' },
    { name: 'Púrpura', hex: '#A855F7' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Gris', hex: '#6B7280' },
    { name: 'Negro', hex: '#1F2937' },
];

interface ColorPickerProps {
    selectedColor: string;
    onChange: (color: string) => void;
}

export const ColorPicker = ({
    selectedColor,
    onChange
}: ColorPickerProps) => {
    return (
        <div className="color-picker">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
                Color del tag
            </label>
            <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                    <button
                        key={color.hex}
                        type="button"
                        onClick={() => onChange(color.hex)}
                        className={`
              w-12 h-12 rounded-lg border-2 transition-all
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${selectedColor === color.hex
                                ? 'border-gray-900 ring-2 ring-gray-900'
                                : 'border-gray-300'
                            }
            `}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={`Seleccionar color ${color.name}`}
                    >
                        {selectedColor === color.hex && (
                            <svg
                                className="w-6 h-6 mx-auto text-white drop-shadow-lg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </button>
                ))}
            </div>

            {/* Input manual para colores custom (opcional) */}
            <div className="mt-3">
                <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#3B82F6"
                    maxLength={7}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
            </div>
        </div>
    );
};