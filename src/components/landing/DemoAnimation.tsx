import { useState, useEffect } from 'react';

interface DemoLine {
    text: string;
    type: 'heading' | 'space' | 'normal';
    highlight?: string;
    tagged?: string;
    color?: string;
    tail?: string;
}

interface DemoFrame {
    label: string;
    lines: DemoLine[];
}

const FRAMES: DemoFrame[] = [
    {
        label: 'Documento cargado',
        lines: [
            { text: 'Entrevista con Juan', type: 'heading' },
            { text: '', type: 'space' },
            { text: 'Investigador: ¿Cómo describirías tu situación actual?', type: 'normal' },
            { text: '', type: 'space' },
            { text: 'Juan: Me siento muy ', type: 'normal', tail: 'cansado' },
            { text: 'y sin motivación para continuar.', type: 'normal' },
        ],
    },
    {
        label: 'Texto seleccionado',
        lines: [
            { text: 'Entrevista con Juan', type: 'heading' },
            { text: '', type: 'space' },
            { text: 'Investigador: ¿Cómo describirías tu situación actual?', type: 'normal' },
            { text: '', type: 'space' },
            { text: 'Juan: Me siento muy ', type: 'normal', highlight: 'cansado', tail: '' },
            { text: 'y sin motivación para continuar.', type: 'normal' },
        ],
    },
    {
        label: 'Tag aplicado',
        lines: [
            { text: 'Entrevista con Juan', type: 'heading' },
            { text: '', type: 'space' },
            { text: 'Investigador: ¿Cómo describirías tu situación actual?', type: 'normal' },
            { text: '', type: 'space' },
            { text: 'Juan: Me siento muy ', type: 'normal', tagged: 'cansado', color: '#EF4444', tail: '' },
            { text: 'y sin motivación para continuar.', type: 'normal' },
        ],
    },
];

const TAGS = [
    { name: 'Fatiga Crónica', color: '#EF4444', count: 1 },
    { name: 'Falta de Motivación', color: '#F97316', count: 0 },
    { name: 'Resiliencia', color: '#22C55E', count: 0 },
];

export default function DemoAnimation() {
    const [frame, setFrame] = useState(0);
    const [tagVisible, setTagVisible] = useState(false);

    useEffect(() => {
        const timers = [
            setTimeout(() => setFrame(1), 1200),
            setTimeout(() => { setFrame(2); setTagVisible(true); }, 2400),
            setTimeout(() => { setFrame(0); setTagVisible(false); }, 4200),
        ];
        const interval = setInterval(() => {
            setFrame(0);
            setTagVisible(false);
            setTimeout(() => setFrame(1), 1200);
            setTimeout(() => { setFrame(2); setTagVisible(true); }, 2400);
        }, 5000);
        return () => { timers.forEach(clearTimeout); clearInterval(interval); };
    }, []);

    const current = FRAMES[frame];

    return (
        <div className="relative mx-auto max-w-3xl mt-10 mb-6 cursor-default">
            <div className="flex justify-center mb-4 gap-2">
                {FRAMES.map((f, i) => (
                    <span
                        key={i}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-300 ${i === frame
                            ? 'bg-secondary text-white'
                            : 'bg-white/10'
                            }`}
                    >
                        {f.label}
                    </span>
                ))}
            </div>

            <div className="flex gap-3 rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
                <div className="flex-1 p-6 text-sm leading-7 min-h-[180px] text-gray-800">
                    {current.lines.map((line, i) => {
                        if (line.type === 'space') return <div key={i} className="h-3" />;
                        if (line.type === 'heading') return (
                            <div key={i} className="font-bold text-base mb-1">{line.text}</div>
                        );
                        return (
                            <div key={i}>
                                {line.text}
                                {line.highlight && (
                                    <span className="bg-primary/40 border-b-2 border-primary px-0.5 rounded transition-all duration-300">
                                        {line.highlight}
                                    </span>
                                )}
                                {line.tagged && (
                                    <mark
                                        className="px-0.5 rounded border-b-2 transition-all duration-300"
                                        style={{
                                            backgroundColor: (line.color ?? '#EF4444') + '33',
                                            borderColor: line.color ?? '#EF4444',
                                        }}
                                    >
                                        {line.tagged}
                                    </mark>
                                )}
                                {line.tail}
                            </div>
                        );
                    })}
                </div>

                <div className="w-56 border-l border-gray-100 p-4 bg-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-gray-400">Tags</p>
                    <div className="space-y-2">
                        {TAGS.map((tag, i) => (
                            <div
                                key={i}
                                className={`pl-4 pr-2 py-2 rounded-lg flex items-center gap-2 w-full border border-gray-200 cursor-default bg-white ${tagVisible && i === 0 ? 'bg-primary/5 border-primary/20' : ''
                                    }`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                                <span className="text-xs flex-1 truncate text-gray-700">{tag.name}</span>
                                {tagVisible && i === 0 && (
                                    <span className="text-xs animate-pulse text-gray-400">{tag.count}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
