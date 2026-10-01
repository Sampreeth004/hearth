"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ElementType, ReactNode } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: "default" | "strong" | "subtle";
  children?: ReactNode;
}

const variantClasses = {
  default: "glass-panel",
  strong: "glass-panel-strong",
  subtle: "glass-panel-subtle",
};

export function GlassPanel({
  as: Comp = "div",
  variant = "default",
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <Comp className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Comp>
  );
}
