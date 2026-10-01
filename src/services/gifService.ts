import type { GifResult } from "@/types";

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
const GIPHY_BASE = "https://api.giphy.com/v1/gifs";
const DEFAULT_LIMIT = 24;

interface GiphyImage {
  url?: string;
  width?: string;
  height?: string;
}

interface GiphyGif {
  id: string;
  title?: string;
  images?: {
    fixed_height?: GiphyImage;
    fixed_height_small?: GiphyImage;
    downsized_medium?: GiphyImage;
    original?: GiphyImage;
  };
}

interface GiphyResponse {
  data?: GiphyGif[];
}

export const isGifSearchConfigured = Boolean(GIPHY_API_KEY);

function mapGif(gif: GiphyGif): GifResult | null {
  const images = gif.images;
  const preview = images?.fixed_height ?? images?.fixed_height_small ?? images?.original;
  const full = images?.downsized_medium ?? images?.original ?? images?.fixed_height;
  if (!preview?.url || !full?.url) return null;

  return {
    id: gif.id,
    title: gif.title?.trim() || "GIF",
    previewUrl: preview.url,
    fullUrl: full.url,
    width: Number(preview.width) || 200,
    height: Number(preview.height) || 200,
  };
}

async function fetchGifs(endpoint: string, params: Record<string, string>): Promise<GifResult[]> {
  if (!GIPHY_API_KEY) {
    throw new Error("GIF search is not configured.");
  }

  const query = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: String(DEFAULT_LIMIT),
    rating: "pg-13",
    ...params,
  });

  const response = await fetch(`${GIPHY_BASE}/${endpoint}?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load GIFs right now. Please try again.");
  }

  const payload = (await response.json()) as GiphyResponse;
  return (payload.data ?? [])
    .map(mapGif)
    .filter((gif): gif is GifResult => gif !== null);
}

export async function searchGifs(term: string): Promise<GifResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return getTrendingGifs();
  return fetchGifs("search", { q: trimmed });
}

export async function getTrendingGifs(): Promise<GifResult[]> {
  return fetchGifs("trending", {});
}
