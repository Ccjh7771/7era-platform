"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
    children: ReactNode;
    className: string;
    pendingLabel: string;
};

export function AdminSubmitButton({
    children,
    className,
    pendingLabel,
}: AdminSubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className={`${className} disabled:cursor-wait disabled:opacity-60`}
        >
            {pending ? pendingLabel : children}
        </button>
    );
}
