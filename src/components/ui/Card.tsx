// src/components/ui/Card.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card — контейнер с фоном, скруглением и тенью
 * Используется для блоков в админке/редакторе
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-gray-200 bg-white shadow-sm p-4",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";