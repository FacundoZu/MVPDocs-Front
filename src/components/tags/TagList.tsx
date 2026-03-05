import type { Tag } from '../../types/tagTypes';

export const TagList: React.FC<{ tags: Tag[] }> = ({ tags }) => {
    // ... (El bloque de "No hay tags aún" queda igual)

    return (
        <div className="space-y-3 text-sm">
            {tags.map(tag => (
                <div key={tag._id} className="bg-white pl-4 pr-3 py-3 rounded-xl flex items-center justify-between w-full border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: tag.color }} />
                        <p className="text-gray-700 font-medium line-clamp-1">{tag.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs font-bold border border-gray-100">
                            {tag.usageCount}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};