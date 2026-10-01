"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassInput } from "@/components/ui/GlassInput";
import { EmptyState, Skeleton } from "@/components/ui/EmptyState";
import { useBackLayer } from "@/context/BackNavigationContext";
import { getTrendingGifs, isGifSearchConfigured, searchGifs } from "@/services/gifService";
import { getFriendlyErrorMessage, isGifUrl } from "@/lib/utils";
import type { GifResult } from "@/types";

interface GifPickerProps {
  onSelect: (gifUrl: string) => Promise<void>;
  onClose: () => void;
}

const DEBOUNCE_MS = 350;

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(isGifSearchConfigured);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [linkValue, setLinkValue] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useBackLayer("gif-picker", true, onClose);

  const loadGifs = useCallback(async (searchTerm: string) => {
    if (!isGifSearchConfigured) return;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    try {
      const gifs = searchTerm.trim()
        ? await searchGifs(searchTerm)
        : await getTrendingGifs();
      if (requestId !== requestIdRef.current) return;
      setResults(gifs);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to load GIFs", err);
      setError(getFriendlyErrorMessage(err));
      setResults([]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGifSearchConfigured) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void loadGifs(term), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term, loadGifs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = async (gif: GifResult) => {
    setSendingId(gif.id);
    try {
      await onSelect(gif.fullUrl);
      onClose();
    } catch (err) {
      console.error("Failed to send GIF", err);
    } finally {
      setSendingId(null);
    }
  };

  const handleSendLink = async () => {
    const value = linkValue.trim();
    if (!isGifUrl(value)) {
      setError("That does not look like a GIF link.");
      return;
    }
    setSendingLink(true);
    setError(null);
    try {
      await onSelect(value);
      setLinkValue("");
      onClose();
    } catch (err) {
      console.error("Failed to send GIF link", err);
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Choose a GIF"
      className="glass-menu animate-pop-in absolute bottom-full left-2 right-2 z-40 mb-2 flex max-h-[60vh] origin-bottom flex-col overflow-hidden rounded-3xl sm:left-auto sm:w-[22rem]"
    >
      <div className="flex items-center gap-2 border-b border-hairline p-3">
        {isGifSearchConfigured ? (
          <GlassInput
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search GIFs..."
            aria-label="Search GIFs"
            autoFocus
            icon={Search}
            wrapperClassName="flex-1"
          />
        ) : (
          <p className="flex-1 text-sm font-semibold text-ink">Send a GIF</p>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close GIF picker"
          className="glass-icon-btn h-8 w-8"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isGifSearchConfigured ? (
          <>
            {loading && (
              <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-4 text-center">
                <p className="text-sm text-ink-muted">{error}</p>
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <EmptyState
                icon={Search}
                title="No GIFs found"
                description="Try a different search term."
              />
            )}

            {!loading && !error && results.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
                {results.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => handleSelect(gif)}
                    disabled={sendingId !== null}
                    aria-label={`Send GIF: ${gif.title}`}
                    className="group relative overflow-hidden rounded-xl border border-hairline bg-glass-subtle transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gif.previewUrl}
                      alt={gif.title}
                      loading="lazy"
                      className="h-24 w-full object-cover"
                    />
                    {sendingId === gif.id && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="px-3 pb-2 pt-1 text-center text-[10px] text-ink-muted">
              Powered by{" "}
              <a
                href="https://giphy.com"
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
              >
                GIPHY
              </a>
            </p>
          </>
        ) : (
          <div className="font-dm p-4 text-center text-sm text-ink-muted">
            <p>
              GIF search is not configured. Add a free{" "}
              <a
                href="https://developers.giphy.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold text-accent-text underline"
              >
                GIPHY API key
              </a>{" "}
              to enable it — or paste a GIF link below.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-hairline p-3">
        {error && isGifSearchConfigured && (
          <p className="mb-2 text-xs text-danger-strong">{error}</p>
        )}
        <div className="flex items-center gap-2">
          <GlassInput
            type="url"
            value={linkValue}
            onChange={(event) => {
              setLinkValue(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSendLink();
              }
            }}
            placeholder="Paste a GIF link"
            aria-label="Paste a GIF link"
            icon={Link2}
            wrapperClassName="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSendLink}
            disabled={!linkValue.trim() || sendingLink}
            loading={sendingLink}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
