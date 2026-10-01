"use client";

import { cn } from "@/lib/utils";

interface HearthLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  tone?: "default" | "inverted";
}

const markSizes = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

const textSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
};

const chipSizes = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-11 w-11 rounded-xl",
  xl: "h-16 w-16 rounded-2xl",
};

const chipMarkSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-9 w-9",
};

export function HearthLogo({
  className,
  size = "md",
  showWordmark = true,
  tone = "default",
}: HearthLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {tone === "inverted" ? (
        <span
          className={cn(
            "flex items-center justify-center bg-white shadow-sm shadow-[rgba(51,39,42,0.08)]",
            chipSizes[size]
          )}
        >
          <FlameMark className={chipMarkSizes[size]} />
        </span>
      ) : (
        <FlameMark className={cn("shrink-0", markSizes[size])} />
      )}
      {showWordmark && (
        <span className={cn("font-bold tracking-tight text-ink", textSizes[size])}>
          Hearth
        </span>
      )}
    </span>
  );
}

/** The official Hearth flame mark, in the pastel brand pink. */
export function FlameMark({
  className,
  monochrome,
}: {
  className?: string;
  monochrome?: string;
}) {
  return (
    <svg viewBox="18 10 28 40" aria-hidden="true" className={cn(className)}>
      <path
        fill={monochrome}
        className={monochrome ? undefined : "fill-accent"}
        d="M32 12c1.2 5.2 4.4 7.6 7.4 11.7 2.6 3.6 4.6 7.3 4.6 11.5 0 7.2-5.4 13-12 13s-12-5.8-12-13c0-4.2 1.8-7.3 3.9-10.4.3 2.3 1.2 4 2.6 5.2-.2-6.3 1.8-12.3 5.5-18z"
      />
    </svg>
  );
}
