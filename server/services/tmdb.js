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
 * Normalizes both movie and tv objects to have unified title and release_date fields
 */
function normalizeMediaItem(item, defaultType = null) {
  if (!item) return item;
  const mediaType = item.media_type || defaultType || (item.name ? "tv" : "movie");
  return {
    ...item,
    media_type: mediaType,
    title: item.title || item.name || "Untitled",
    original_title: item.original_title || item.original_name || item.title || item.name || "Untitled",
    release_date: item.release_date || item.first_air_date || null
  };
}

function normalizeCinemaDetails(data, type) {
  if (!data) return data;
  return {
    ...data,
    media_type: type,
    title: data.title || data.name || "Untitled",
    original_title: data.original_title || data.original_name || data.title || data.name || "Untitled",
    release_date: data.release_date || data.first_air_date || null,
    runtime: data.runtime ?? (Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0 ? data.episode_run_time[0] : null)
  };
}

/**
 * Unified Search Endpoint (Movies and TV Shows mixed together)
 */
export async function searchMulti(query, page = 1, filterOutPeople = true) {
  const data = await tmdbFetch("/search/multi", {
    query,
    include_adult: false,
    page
  });

  if (data && Array.isArray(data.results)) {
    let results = data.results;
    if (filterOutPeople) {
      results = results.filter(
        (item) => item.media_type === "movie" || item.media_type === "tv"
      );
    }
    data.results = results.map((item) => normalizeMediaItem(item));
  }

  return data;
}

/**
 * Discovery Endpoints
 */
export async function getTrendingCinema(timeWindow = "week", page = 1, mediaType = "all") {
  const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`, { page });
  if (data && Array.isArray(data.results)) {
    data.results = data.results
      .filter((item) => item.media_type !== "person")
      .map((item) => normalizeMediaItem(item, mediaType === "movie" ? "movie" : null));
  }
  return data;
}

export async function getPopularCinema(page = 1) {
  const data = await tmdbFetch("/movie/popular", { page });
  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((item) => normalizeMediaItem(item, "movie"));
  }
  return data;
}

export async function getTopRatedCinema(page = 1) {
  const data = await tmdbFetch("/movie/top_rated", { page });
  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((item) => normalizeMediaItem(item, "movie"));
  }
  return data;
}

export async function getUpcomingCinema(page = 1) {
  const data = await tmdbFetch("/movie/upcoming", { page });
  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((item) => normalizeMediaItem(item, "movie"));
  }
  return data;
}

export async function getNowPlayingCinema(page = 1) {
  const data = await tmdbFetch("/movie/now_playing", { page });
  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((item) => normalizeMediaItem(item, "movie"));
  }
  return data;
}

export async function getCinemaGenres() {
  const data = await tmdbFetch("/genre/movie/list");
  return data.genres || [];
}

export async function discoverCinemaByGenre(genreId, page = 1, sortBy = "popularity.desc") {
  const params = {
    sort_by: sortBy,
    include_adult: false,
    include_video: false,
    page
  };
  if (genreId) {
    params.with_genres = genreId;
  }
  const data = await tmdbFetch("/discover/movie", params);
  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((item) => normalizeMediaItem(item, "movie"));
  }
  return data;
}

/**
 * Details & Sub-resources (Supports both Movies and TV Shows)
 */
export async function getCinemaDetails(tmdbId, mediaType = "movie") {
  const isExplicitTv = mediaType === "tv";
  const isExplicitMovie = mediaType === "movie";

  if (isExplicitTv) {
    const data = await tmdbFetch(`/tv/${tmdbId}`);
    return normalizeCinemaDetails(data, "tv");
  }

  if (isExplicitMovie) {
    const data = await tmdbFetch(`/movie/${tmdbId}`);
    return normalizeCinemaDetails(data, "movie");
  }

  // If mediaType is unspecified, try movie first, then fallback to TV
  try {
    const data = await tmdbFetch(`/movie/${tmdbId}`);
    return normalizeCinemaDetails(data, "movie");
  } catch (movieErr) {
    if (movieErr.status === 404) {
      const tvData = await tmdbFetch(`/tv/${tmdbId}`);
      return normalizeCinemaDetails(tvData, "tv");
    }
    throw movieErr;
  }
}

export async function getCinemaCredits(tmdbId, mediaType = "movie") {
  const endpoint = mediaType === "tv" ? `/tv/${tmdbId}/credits` : `/movie/${tmdbId}/credits`;
  try {
    return await tmdbFetch(endpoint);
  } catch (err) {
    if (err.status === 404 && mediaType !== "tv") {
      return await tmdbFetch(`/tv/${tmdbId}/credits`);
    }
    throw err;
  }
}

export async function getCinemaVideos(tmdbId, mediaType = "movie") {
  const endpoint = mediaType === "tv" ? `/tv/${tmdbId}/videos` : `/movie/${tmdbId}/videos`;
  try {
    return await tmdbFetch(endpoint);
  } catch (err) {
    if (err.status === 404 && mediaType !== "tv") {
      return await tmdbFetch(`/tv/${tmdbId}/videos`);
    }
    throw err;
  }
}

export async function getCinemaRecommendations(tmdbId, page = 1, mediaType = "movie") {
  const endpoint = mediaType === "tv" ? `/tv/${tmdbId}/recommendations` : `/movie/${tmdbId}/recommendations`;
  let data;
  try {
    data = await tmdbFetch(endpoint, { page });
  } catch (err) {
    if (err.status === 404 && mediaType !== "tv") {
      data = await tmdbFetch(`/tv/${tmdbId}/recommendations`, { page });
    } else {
      throw err;
    }
  }

  if (data && Array.isArray(data.results)) {
    data.results = data.results.map((item) => normalizeMediaItem(item, mediaType));
  }

  return data;
}

// Aliases for backwards compatibility with previous imports
export const searchMovies = searchMulti;
export const getTrendingMovies = getTrendingCinema;
export const getPopularMovies = getPopularCinema;
export const getTopRatedMovies = getTopRatedCinema;
export const getUpcomingMovies = getUpcomingCinema;
export const getNowPlayingMovies = getNowPlayingCinema;
export const getMovieGenres = getCinemaGenres;
export const discoverMoviesByGenre = discoverCinemaByGenre;
export const getMovieDetails = getCinemaDetails;
export const getMovieCredits = getCinemaCredits;
export const getMovieVideos = getCinemaVideos;
export const getMovieRecommendations = getCinemaRecommendations;
