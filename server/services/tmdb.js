import axios from "axios";
import "dotenv/config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
const MAX_CACHE_ENTRIES = 500;

// In-memory cache storage and in-flight request deduplication map
const cache = new Map();
const inFlightRequests = new Map();

/**
 * Periodically sweep expired entries every 2 minutes
 */
const cleanupInterval = setInterval(() => {
  pruneExpiredEntries();
}, 2 * 60 * 1000);

// Ensure background timer does not hold node process open during shutdown/tests
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

function pruneExpiredEntries() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
}

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  // Prune if cache is growing large
  if (cache.size >= MAX_CACHE_ENTRIES) {
    pruneExpiredEntries();
    // If still at capacity, evict oldest entry
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
  }

  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL_MS
  });
}

/**
 * Generates a deterministic cache key regardless of param property ordering
 */
function buildCacheKey(endpoint, params = {}) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .reduce((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {});
  return `${endpoint}?${new URLSearchParams(sorted).toString()}`;
}

/**
 * Low-level TMDB HTTP client with caching, deduplication & error normalization
 */
async function tmdbFetch(endpoint, params = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const configError = new Error("TMDB_API_KEY is not configured on the server. Please verify server/.env.");
    configError.status = 500;
    throw configError;
  }

  const key = buildCacheKey(endpoint, params);

  // 1. Return from memory cache if valid
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  // 2. In-flight request deduplication (prevents redundant concurrent calls for same query)
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const fetchPromise = (async () => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
        params: {
          api_key: apiKey.trim(),
          language: "en-US",
          ...params
        },
        headers: {
          Accept: "application/json",
          "User-Agent": "Cultrix/2.0 (CinemaArchive)"
        },
        timeout: 10000
      });

      // Cache successful response
      setCached(key, response.data);
      return response.data;
    } catch (error) {
      // Do NOT cache failures
      const status = error.response?.status || 500;
      const message = error.response?.data?.status_message || error.message || "Failed to fetch from TMDB";
      const customError = new Error(message);
      customError.status = status;
      throw customError;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Discovery Endpoints (Movies Only)
 */
export async function getTrendingMovies(timeWindow = "week", page = 1) {
  return tmdbFetch(`/trending/movie/${timeWindow}`, { page });
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch("/movie/popular", { page });
}

export async function getTopRatedMovies(page = 1) {
  return tmdbFetch("/movie/top_rated", { page });
}

export async function getUpcomingMovies(page = 1) {
  return tmdbFetch("/movie/upcoming", { page });
}

export async function getNowPlayingMovies(page = 1) {
  return tmdbFetch("/movie/now_playing", { page });
}

export async function getMovieGenres() {
  const data = await tmdbFetch("/genre/movie/list");
  return data.genres || [];
}

export async function discoverMoviesByGenre(genreId, page = 1, sortBy = "popularity.desc") {
  const params = {
    sort_by: sortBy,
    include_adult: false,
    include_video: false,
    page
  };
  if (genreId) {
    params.with_genres = genreId;
  }
  return tmdbFetch("/discover/movie", params);
}

/**
 * Search Endpoints (Movies Only)
 */
export async function searchMovies(query, page = 1) {
  return tmdbFetch("/search/movie", {
    query,
    include_adult: false,
    page
  });
}

/**
 * Details & Sub-resources
 */
export async function getMovieDetails(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}`);
}

export async function getMovieCredits(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}/credits`);
}

export async function getMovieVideos(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}/videos`);
}

export async function getMovieRecommendations(tmdbId, page = 1) {
  return tmdbFetch(`/movie/${tmdbId}/recommendations`, { page });
}
