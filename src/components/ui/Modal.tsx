import type { ReactNode } from "react";

interface ModalProps {
    children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
    return (
        <section>
            <div>
                {children}
            </div>
        </section>
    )
}
