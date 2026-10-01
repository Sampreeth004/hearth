"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-accent-gradient glow-accent text-ink hover:brightness-95 focus-visible:ring-accent",
      secondary:
        "border border-hairline bg-glass-subtle text-ink hover:bg-glass-hover focus-visible:ring-accent",
      ghost:
        "text-ink-muted hover:bg-glass-subtle hover:text-ink focus-visible:ring-accent",
      danger:
        "bg-danger-strong text-white shadow-[0_6px_16px_rgba(51,39,42,0.12)] hover:bg-danger-strong/90 focus-visible:ring-danger-strong",
      outline:
        "border border-glassline bg-glass text-ink hover:bg-glass-hover focus-visible:ring-accent",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
