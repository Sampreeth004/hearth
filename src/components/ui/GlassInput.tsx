"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const glassInputClass = "glass-input";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  trailing?: ReactNode;
  wrapperClassName?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ icon: Icon, trailing, className, wrapperClassName, ...props }, ref) => {
    const padding = Icon
      ? "pl-10 pr-4"
      : trailing
        ? "pl-4 pr-12"
        : "px-4";

    if (!Icon && !trailing) {
      return (
        <input
          ref={ref}
          className={cn("glass-input py-3 text-sm", padding, className)}
          {...props}
        />
      );
    }

    return (
      <div className={cn("relative", wrapperClassName)}>
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        )}
        <input
          ref={ref}
          className={cn("glass-input py-3 text-sm", padding, className)}
          {...props}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
