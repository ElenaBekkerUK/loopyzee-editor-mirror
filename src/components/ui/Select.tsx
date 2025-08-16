// src/components/ui/Select.tsx
"use client";
import * as React from "react";

export type SelectVariant = "default" | "ghost" | "error";
export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  uiSize?: SelectSize;          // <-- вместо "size"
  variant?: SelectVariant;
  containerClassName?: string;
  describedById?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, uiSize = "md", variant = "default", multiple, describedById, children, ...props }, ref) => {
    const base =
      "w-full appearance-none rounded-md border bg-white text-gray-800 transition " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 ring-offset-white " +
      "disabled:cursor-not-allowed disabled:opacity-50";
    const byVariant =
      variant === "ghost"
        ? "border-none bg-transparent shadow-none"
        : variant === "error"
        ? "border-red-500 focus-visible:ring-red-500"
        : "border-gray-200";
    const bySize = uiSize === "lg" ? "h-11 px-4 pr-10 text-base"
                    : uiSize === "sm" ? "h-9 px-3 pr-9 text-xs"
                    : "h-10 px-3 pr-9 text-sm";

    return (
      <div className={["relative w-full", containerClassName].filter(Boolean).join(" ")}>
        <select
          ref={ref}
          multiple={multiple}
          aria-describedby={describedById}
          className={[base, byVariant, bySize, !multiple ? "cursor-pointer" : "", className].filter(Boolean).join(" ")}
          {...props}
        >
          {children}
        </select>
        {!multiple && (
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${uiSize === "lg" ? "h-5 w-5" : uiSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`}
          >
            <path d="M5 7l5 5 5-5" fill="currentColor" />
          </svg>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";