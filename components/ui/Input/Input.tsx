"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import {
  inputBaseStyles,
  inputSizeStyles,
  inputVariantStyles,
} from "./Input.styles";
import type { InputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      variant = "default",
      size = "md",
      className,
      type = "text",
      ...inputProps
    },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          inputBaseStyles,
          inputVariantStyles[variant],
          inputSizeStyles[size],
          className,
        )}
        {...inputProps}
      />
    );
  },
);

Input.displayName = "Input";