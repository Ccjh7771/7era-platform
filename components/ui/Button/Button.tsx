"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import {
    buttonBaseStyles,
    buttonLoadingSpinnerStyles,
    buttonSizeStyles,
    buttonVariantStyles,
} from "./Button.styles";
import type { ButtonProps } from "./Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        {
            children,
            variant = "primary",
            size = "md",
            loading = false,
            disabled = false,
            className,
            type = "button",
            ...buttonProps
        },
        ref,
    ) {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                type={type}
                disabled={isDisabled}
                aria-busy={loading}
                className={cn(
                    buttonBaseStyles,
                    buttonVariantStyles[variant],
                    buttonSizeStyles[size],
                    className,
                )}
                {...buttonProps}
            >
                {loading && (
                    <span
                        aria-hidden="true"
                        className={buttonLoadingSpinnerStyles}
                    />
                )}

                <span>{children}</span>
            </button>
        );
    },
);

Button.displayName = "Button";