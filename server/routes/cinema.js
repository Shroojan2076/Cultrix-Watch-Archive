import express from "express";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getMovieGenres,
  discoverMoviesByGenre,
  searchMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getMovieRecommendations
} from "../services/tmdb.js";
import pool from "../db/database.js";

const router = express.Router();

// Helper to check if movie is in movie_watchlist
async function checkWatchlistStatus(tmdbId) {
  try {
    const { rows } = await pool.query(
      "SELECT id, status, score FROM movie_watchlist WHERE tmdb_id = $1",
      [Number(tmdbId)]
    );
    if (rows.length > 0) {
      return {
        in_watchlist: true,
        watchlist_id: rows[0].id,
        watchlist_status: rows[0].status,
        user_score: rows[0].score
      };
    }
  } catch (err) {
    console.warn("Watchlist status check failed:", err.message);
  }
  return {
    in_watchlist: false,
    watchlist_id: null,
    watchlist_status: null,
    user_score: null
  };
}

/**
 * Discovery
 */
router.get("/api/cinema/trending", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const timeWindow = req.query.window === "day" ? "day" : "week";
    const data = await getTrendingMovies(timeWindow, page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/popular", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getPopularMovies(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/top-rated", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getTopRatedMovies(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/upcoming", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getUpcomingMovies(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/now-playing", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getNowPlayingMovies(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/genres", async (req, res, next) => {
  try {
    const genres = await getMovieGenres();
    return res.json({ data: genres });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/discover", async (req, res, next) => {
  try {
    const rawGenre = req.query.genre_id ?? req.query.genreId;
    const page = parseInt(req.query.page, 10) || 1;
    const sortBy = req.query.sort_by || req.query.sortBy || "popularity.desc";

    let genreId;
    if (rawGenre !== undefined && rawGenre !== null && rawGenre !== "") {
      const parsed = Number(rawGenre);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ error: "Invalid genre_id: must be a positive integer" });
      }
      genreId = parsed;
    }

    const data = await discoverMoviesByGenre(genreId, page, sortBy);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

/**
 * Search
 */
router.get("/api/cinema/search", async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || "";
    const page = parseInt(req.query.page, 10) || 1;

    if (!query.trim()) {
      const popular = await getPopularMovies(page);
      return res.json({ data: popular });
    }

    const data = await searchMovies(query.trim(), page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

/**
 * Movie Details with credits, videos & recommendations
 */
router.get("/api/cinema/movie/:tmdbId", async (req, res, next) => {
  const tmdbId = Number(req.params.tmdbId);
  if (!tmdbId || isNaN(tmdbId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    const [movie, credits, videos, recommendations, watchlistStatus] = await Promise.allSettled([
      getMovieDetails(tmdbId),
      getMovieCredits(tmdbId),
      getMovieVideos(tmdbId),
      getMovieRecommendations(tmdbId),
      checkWatchlistStatus(tmdbId)
    ]);

    if (movie.status === "rejected") {
      throw new Error(movie.reason?.message || "Failed to retrieve movie details");
    }

    const movieData = movie.value;
    const creditsData = credits.status === "fulfilled" ? credits.value : { cast: [], crew: [] };
    const videosData = videos.status === "fulfilled" ? videos.value?.results || [] : [];
    const recommendationsData = recommendations.status === "fulfilled" ? recommendations.value?.results || [] : [];
    const watchStatus = watchlistStatus.status === "fulfilled" ? watchlistStatus.value : { in_watchlist: false };

    // Find primary director
    const director = creditsData.crew?.find((c) => c.job === "Director" || c.department === "Directing");

    // Filter official trailers/videos (YouTube)
    const trailers = videosData.filter(
      (v) => (v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    );

    const enrichedMovie = {
      ...movieData,
      cast: (creditsData.cast || []).slice(0, 15),
      director: director ? { id: director.id, name: director.name, job: director.job } : null,
      crew: (creditsData.crew || []).slice(0, 10),
      trailers: trailers.slice(0, 5),
      recommendations: recommendationsData.slice(0, 10),
      ...watchStatus
    };

    return res.json({ data: enrichedMovie });
  } catch (error) {
    next(error);
  }
});

export default router;

