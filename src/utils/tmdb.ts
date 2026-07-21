import { env } from "prisma/config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_IMAGE_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

function getHeadersAndParams(extraParams: Record<string, string> = {}) {
  let apiKey: string | undefined;
  try {
    apiKey = env("TMDB_API_KEY");
  } catch {
    apiKey = process.env.TMDB_API_KEY;
  }

  let bearerToken: string | undefined;
  try {
    bearerToken = env("TMDB_READ_ACCESS_TOKEN");
  } catch {
    bearerToken = process.env.TMDB_READ_ACCESS_TOKEN;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const params = new URLSearchParams(extraParams);

  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  } else if (apiKey) {
    params.append("api_key", apiKey);
  }

  return { headers, params };
}

export function formatTmdbImageUrl(
  path: string | null | undefined,
  type: "poster" | "backdrop" = "poster",
): string | null {
  if (!path) return null;
  const base = type === "poster" ? TMDB_IMAGE_POSTER_BASE : TMDB_IMAGE_BACKDROP_BASE;
  return `${base}${path}`;
}

export interface ITmdbSearchMovieItem {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  vote_count?: number;
}

export interface ITmdbMovieDetails {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
  genres?: { id: number; name: string }[];
}

export async function searchTmdbMovies(query: string, page = 1) {
  const { headers, params } = getHeadersAndParams({
    query,
    page: String(page),
  });

  const url = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: (data.results || []).map((item: ITmdbSearchMovieItem) => ({
      tmdbId: item.id,
      title: item.title,
      originalTitle: item.original_title,
      overview: item.overview,
      posterUrl: formatTmdbImageUrl(item.poster_path, "poster"),
      backdropUrl: formatTmdbImageUrl(item.backdrop_path, "backdrop"),
      releaseDate: item.release_date,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
    })),
  };
}

export async function fetchTmdbMovieDetails(tmdbId: number): Promise<ITmdbMovieDetails> {
  const { headers, params } = getHeadersAndParams();

  const url = `${TMDB_BASE_URL}/movie/${tmdbId}?${params.toString()}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`TMDB API error for movie ${tmdbId}: ${response.statusText}`);
  }

  return await response.json();
}
