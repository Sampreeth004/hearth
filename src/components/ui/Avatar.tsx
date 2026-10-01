"use client";

import { cn, getInitials } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnline?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-2xl",
};

const dotSizeClasses = {
  sm: "w-2.5 h-2.5 border",
  md: "w-3 h-3 border-2",
  lg: "w-3.5 h-3.5 border-2",
  xl: "w-5 h-5 border-2",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  showOnline,
  isOnline,
}: AvatarProps) {
  return (
    <div className={cn("relative flex shrink-0 rounded-full", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover ring-1 ring-white",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "bg-accent-gradient flex items-center justify-center rounded-full font-semibold text-ink ring-1 ring-white",
            sizeClasses[size]
          )}
        >
          {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
        </div>
      )}
      {showOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white",
            dotSizeClasses[size],
            isOnline
              ? "animate-presence bg-online"
              : "bg-offline"
          )}
        />
      )}
    </div>
  );
}
