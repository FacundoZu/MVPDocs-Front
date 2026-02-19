import { CiCircleCheck } from "react-icons/ci";

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
        <div className="color-picker space-y-4">
            <label className='text-sm text-gray-500'>
                Color
            </label>
            <div className="grid grid-cols-5 gap-2 mt-2">
                {PRESET_COLORS.map((color) => (
                    <button
                        key={color.hex}
                        type="button"
                        onClick={() => onChange(color.hex)}
                        className={`
              size-10 rounded-full transition-all duration-300 cursor-pointer
              hover:scale-90 focus:outline-none
              ${selectedColor === color.hex && 'flex items-center justify-center border border-gray-300'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={`Seleccionar color ${color.name}`}
                    >
                        {selectedColor === color.hex && (
                            <CiCircleCheck className="size-6 text-white" />
                        )}
                    </button>
                ))}
            </div>

            <input
                type="text"
                value={selectedColor}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#3B82F6"
                maxLength={7}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm w-full"
            />
        </div>
    );
};