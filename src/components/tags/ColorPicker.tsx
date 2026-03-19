import { LuShuffle } from 'react-icons/lu';

export function randomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const sat = 55 + Math.floor(Math.random() * 30); // 55–85%
    const lit = 40 + Math.floor(Math.random() * 20); // 40–60%
    return hslToHex(hue, sat, lit);
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

interface ColorPickerProps {
    selectedColor: string;
    onChange: (color: string) => void;
}

export const ColorPicker = ({ selectedColor, onChange }: ColorPickerProps) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500">Color</label>

            <div className="flex items-center gap-3">
                {/* Input nativo de color — abre el selector del sistema */}
                <div className="relative">
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={e => onChange(e.target.value)}
                        className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent p-0 appearance-none"
                        style={{ WebkitAppearance: 'none' } as React.CSSProperties}
                        title="Seleccionar color"
                    />
                    {/* Círculo decorativo sobre el input para aplicar estilo */}
                    <div
                        className="absolute inset-0 rounded-full border-2 border-white ring-1 ring-gray-300 pointer-events-none"
                        style={{ backgroundColor: selectedColor }}
                    />
                </div>

                <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm font-mono text-gray-700 uppercase tracking-wide">
                        {selectedColor}
                    </span>
                    <span className="text-xs text-gray-400">Click para cambiar</span>
                </div>

                {/* Botón de color aleatorio */}
                <button
                    type="button"
                    onClick={() => onChange(randomColor())}
                    title="Generar color aleatorio"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-primary hover:bg-primary/10 border border-gray-200 rounded-lg transition-colors"
                >
                    <LuShuffle className="w-3.5 h-3.5" />
                    Aleatorio
                </button>
            </div>
        </div>
    );
};