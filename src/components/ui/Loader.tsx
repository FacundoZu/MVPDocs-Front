
interface LoaderProps {
    isSmall?: boolean
}

export default function Loader({ isSmall = false }: LoaderProps) {
    return (
        <div className="flex items-center justify-center p-4 ">
            <div className={isSmall ? "animate-spin rounded-full size-4 border-b-2 border-purple-600" : "animate-spin rounded-full size-32 border-b-2 border-purple-600"}></div>
        </div>
    )
}
