import { MdKeyboardArrowRight } from "react-icons/md";
import type { Tag } from '../../types/tagTypes';

interface TagListProps {
    tags: Tag[];
    handleCreateQuote: ({ tagId, color }: { tagId: Tag['_id'], color: Tag['color'] }) => void
}

export const TagList: React.FC<TagListProps> = ({
    tags,
    handleCreateQuote
}) => {

    if (tags.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-lg font-medium">No hay tags aún</p>
                <p className="text-sm mt-1">Crea tu primer tag para comenzar a codificar</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 text-sm">
            {tags.map(tag => (
                <button
                    onClick={() => handleCreateQuote({ tagId: tag._id, color: tag.color })}
                    key={tag._id}
                    className="bg-white pl-4 pr-2 py-2 rounded-lg flex items-center justify-between w-full border border-gray-200 hover:bg-gray-50 hover:border-gray-200 transition-colors duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="size-4 rounded-full shrink-0 border border-gray-300"
                            style={{ backgroundColor: tag.color }}
                            title={`Color: ${tag.color}`}
                        />
                        <p className="text-gray-700 font-semibold line-clamp-1" title={tag.name}>{tag.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-2xl bg-gray-100 text-gray-500 text-xs font-bold">{tag.usageCount}</span>
                        <MdKeyboardArrowRight className="text-gray-400 font-bold" />
                    </div>
                </button>
            ))}
        </div>
    );
};