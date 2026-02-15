import ModalIASummary from "../components/AI/ModalIASummary";

export default function Example() {
    const content = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod. Lorem ipsum dolor sit amet consectetur adipisicing elit. Error illo aliquam expedita nostrum officiis sint saepe dolore. Expedita qui, eius ratione aut laudantium quae adipisci et consequatur quasi voluptatibus voluptate voluptas illum doloremque libero tempora consectetur cum, vitae distinctio veniam maiores? Ad, aut? Eligendi illo molestiae error fugiat. Ducimus tenetur voluptatem ullam. Iste, facere officiis? Commodi accusamus non perspiciatis deserunt expedita illum, natus laboriosam nisi maiores, quidem ea. Sit animi hic deleniti excepturi voluptatibus aspernatur ipsam, obcaecati porro minus. Voluptas ab repudiandae non. Excepturi eveniet quidem voluptates nisi, corrupti repellat id adipisci voluptatibus asperiores perspiciatis sapiente ipsa culpa, magnam ad!'

    return (
        <>
            <section>
                <h1>Titulo del documento</h1>
                <pre>
                    {content}
                </pre>

            </section>
            <ModalIASummary content={content} />
        </>
    )
}
