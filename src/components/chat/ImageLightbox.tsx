"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useBackLayer } from "@/context/BackNavigationContext";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = "Photo", onClose }: ImageLightboxProps) {
  useBackLayer("image-lightbox", true, onClose);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[95] flex items-center justify-center bg-ink p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#594a4e] text-white transition-colors hover:bg-[#6b5a5f]"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        onClick={(event) => event.stopPropagation()}
        className="glass-panel-strong animate-pop-in max-h-full max-w-3xl rounded-3xl p-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] max-w-full rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}
