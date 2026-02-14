import { useQuery } from "@tanstack/react-query"
import api from "../lib/axios"

export const Documents = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: () => api.get('')
    })

    if (isLoading) return <p>Cargando...</p>

    if (data) return (
        <div className="p-10 w-full">
            <h1>Documentos</h1>
            <div className="flex gap-4">
                <div className="w-1/4 bg-gray-100 p-4 rounded-lg">
                    <h2>Documentos</h2>
                    {data.data}
                </div>
            </div>
        </div>
    )
}
