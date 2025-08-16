// editor-app/src/components/ui/Button.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type Variant = "default" | "primary" | "secondary" | "ghost" | "destructive" | "link";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantClass =
      {
        default: "bg-gray-900 text-white hover:bg-gray-800",
        primary: "bg-violet-600 text-white hover:bg-violet-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "bg-transparent hover:bg-gray-100",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "bg-transparent text-violet-600 hover:underline",
      }[variant] || "";

    const sizeClass =
      {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      }[size] || "";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition disabled:opacity-50 disabled:pointer-events-none",
          variantClass,
          sizeClass,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;