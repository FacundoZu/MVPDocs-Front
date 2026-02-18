import { useState } from "react";
import ModalIASummary from "../components/AI/ModalIASummary";
import { suggestCategories, suggestTags } from "../API/AIAPI";
import ReactMarkdown from "react-markdown";
import type { Category } from "../types";

export default function Example() {
    const content = '# Entrevista Estudiante de Doctorado\n\n**Fecha:** 18 de enero de 2024  \n**Participante:** E02  \n**Edad:** 32 años  \n**Programa:** Doctorado en Neurociencias\n\n## Contexto general\n\nEl participante está en su tercer año de doctorado. Trabaja en un laboratorio de investigación y está en proceso de análisis de datos para su tesis.\n\n## ¿Cómo ha sido tu experiencia emocional últimamente?\n\nMuy complicada, para ser honesto. Hay momentos en los que siento que estoy en un pozo sin fondo. La **depresión** es algo con lo que he lidiado desde hace varios años, pero durante el doctorado se ha intensificado. Hay semanas enteras donde me cuesta levantarme de la cama, y la **motivación baja** hace que procrastine incluso las tareas más simples.\n\nEl **síndrome del impostor** es brutal. Veo a otros estudiantes avanzando con sus proyectos, publicando artículos, y yo siento que no soy lo suficientemente inteligente para estar aquí. A veces leo papers y no entiendo nada, y eso me hace sentir como un fraude.\n\n## ¿Qué aspectos del programa contribuyen a eso?\n\nPrincipalmente la **falta de recursos**. Nuestro laboratorio tiene presupuesto muy limitado, así que constantemente estamos luchando por conseguir materiales o acceso a equipos. Eso retrasa mi investigación y genera mucha frustración.\n\nTambién está la relación con mi asesor. No es mala, pero siento que tiene **expectativas altas** que no siempre son realistas. Me pide avances constantes, pero no siempre hay resultados que reportar en investigación básica. Eso genera mucha presión.\n\nEl **aislamiento social** es otro factor importante. Paso la mayor parte del tiempo en el laboratorio, muchas veces solo. Mis experimentos requieren que esté ahí hasta tarde, así que casi no veo a mi familia o amigos. Incluso los fines de semana estoy pensando en el trabajo.\n\n## ¿Has buscado apoyo o estrategias?\n\nSí, estoy medicado para la **depresión** desde hace un año. También voy a terapia cada dos semanas, aunque honestamente hay veces que me cuesta ir porque me siento muy cansado. Mi terapeuta me ha estado ayudando con la **búsqueda de ayuda profesional** adecuada, me refirió a un psiquiatra que ajustó mi medicación.\n\nEn cuanto a estrategias prácticas, intento mantener una rutina de **ejercicio físico**, aunque no siempre la cumplo. Voy al gimnasio del campus cuando puedo, generalmente 2-3 veces por semana. Me ayuda a desconectar un poco.\n\nHe encontrado algo de **apoyo de pares** en un grupo de estudiantes de doctorado que nos reunimos cada mes para compartir experiencias. Es reconfortante saber que no soy el único que lucha con estas cosas.\n\n## ¿Qué cambios institucionales ayudarían?\n\nSería increíble tener más apoyo en salud mental específico para estudiantes de posgrado. También creo que debería haber más conversaciones abiertas sobre salud mental en la academia. Hay mucho estigma todavía.'

    const contextBefore = "Honestamente, ha sido muy difícil. "
    const contextAfter = ". Hay días en los que me despierto y ya"
    const selectedText = 'Siento que la ansiedad se ha vuelto mi compañera constante'
    const tagNames = ['ansiedad', 'depresión', 'síndrome del impostor', 'falta de recursos', 'relación con asesor', 'aislamiento social', 'apoyo profesional', 'ejercicio físico', 'apoyo de pares', 'cambios institucionales']

    const [tags, setTags] = useState<string[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)

    const generateTags = async () => {
        setLoading(true)
        const tags = await suggestTags({ selectedText, contextBefore, contextAfter })
        setTags(tags)
        setLoading(false)
    }

    const generateCategories = async () => {
        setLoading(true)
        const categories = await suggestCategories({ tagNames })
        setCategories(categories)
        setLoading(false)
    }

    return (
        <>
            <section>
                <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600">
                    <ReactMarkdown>
                        {content}
                    </ReactMarkdown>
                </article>


                <button onClick={generateTags} className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer">Generar tags</button>

                {loading && <p>Generando tags...</p>}

                {tags.length > 0 && !loading && (
                    <section className="my-4">
                        <h2>Tags sugeridos</h2>
                        <ul className="flex gap-2">
                            {tags.map((tag, index) => (
                                <li key={index} className="bg-blue-500 text-white px-2 py-1 rounded-md">{tag}</li>
                            ))}
                        </ul>
                    </section>
                )}

                <button onClick={generateCategories} className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer">Generar categorías</button>

                {categories.length > 0 && !loading && (
                    <section className="my-4">
                        <h2>Categorías sugeridas</h2>
                        <ul>
                            {categories.map((category, index) => (
                                <>
                                    <li key={index} className="bg-blue-500 text-white px-2 py-1 rounded-md">{category.name}</li>
                                    <p>{category.description}</p>
                                    <ul className="flex gap-2">
                                        {category.tags.map((tag, index) => (
                                            <li key={index} className="bg-blue-500 text-white px-2 py-1 rounded-md">{tag}</li>
                                        ))}
                                    </ul>
                                </>
                            ))}
                        </ul>
                    </section>
                )}
            </section>
            <ModalIASummary content={content} />
        </>
    )
}
