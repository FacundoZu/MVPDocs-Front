import type { Tag } from '../../types/tagTypes';

export const TagList: React.FC<{ tags: Tag[] }> = ({ tags }) => {
    // ... (El bloque de "No hay tags aún" queda igual)

    return (
        <div className="text-sm">
            {tags.map(tag => (
                <div key={tag._id} className="pl-4 pr-3 py-2 rounded-xl flex items-center gap-2 w-full overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="size-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: tag.color }} />
                        <p className="text-gray-700 font-medium truncate">{tag.name}</p>
                    </div>
                    <span className="px-1.5 py-0.5 text-gray-400 text-xs font-semibold shrink-0 tabular-nums">
                        {tag.usageCount}
                    </span>
                </div>
            ))}
        </div>
    );
};