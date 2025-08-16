// src/components/ui/Input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputVariant = "default" | "error";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  uiSize?: InputSize; // size → uiSize для избежания конфликта с HTML
  describedById?: string;
}

/**
 * Поле ввода в стиле UI Kit:
 * - Варианты: default, error
 * - Размеры: sm, md, lg
 * - Цвета, радиусы и шрифты соответствуют Ui Kit Specification.pdf
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant = "default",
      uiSize = "md",
      describedById,
      ...props
    },
    ref
  ) => {
    const variantClasses =
      variant === "error"
        ? "border-red-500 focus-visible:ring-red-500"
        : "border-gray-300 focus-visible:ring-purple-400";

    const sizeClasses =
      uiSize === "lg"
        ? "h-11 px-4 text-base"
        : uiSize === "sm"
        ? "h-9 px-3 text-xs"
        : "h-10 px-3 text-sm";

    return (
      <input
        type={type}
        ref={ref}
        aria-describedby={describedById}
        className={cn(
          "flex w-full rounded-lg border bg-white text-gray-900 shadow-sm " +
            "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium " +
            "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
            "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses,
          sizeClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";