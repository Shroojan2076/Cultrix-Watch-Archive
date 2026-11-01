import express from "express";
import {
  getTrendingCinema,
  getPopularCinema,
  getTopRatedCinema,
  getUpcomingCinema,
  getNowPlayingCinema,
  getCinemaGenres,
  discoverCinemaByGenre,
  searchMulti,
  getCinemaDetails,
  getCinemaCredits,
  getCinemaVideos,
  getCinemaRecommendations
} from "../services/tmdb.js";
import pool from "../db/database.js";

const router = express.Router();

// Helper to check if movie/series is in movie_watchlist
async function checkWatchlistStatus(tmdbId) {
  try {
    const { rows } = await pool.query(
      "SELECT id, status, score, media_type FROM movie_watchlist WHERE tmdb_id = $1",
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
    const mediaType = req.query.type || req.query.media_type || "all";
    const data = await getTrendingCinema(timeWindow, page, mediaType);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/popular", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getPopularCinema(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/top-rated", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getTopRatedCinema(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/upcoming", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getUpcomingCinema(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/now-playing", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await getNowPlayingCinema(page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/api/cinema/genres", async (req, res, next) => {
  try {
    const genres = await getCinemaGenres();
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

    const data = await discoverCinemaByGenre(genreId, page, sortBy);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

/**
 * Unified Search (Movies & TV Shows mixed together)
 */
router.get("/api/cinema/search", async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || "";
    const page = parseInt(req.query.page, 10) || 1;

    if (!query.trim()) {
      const trending = await getTrendingCinema("week", page, "all");
      return res.json({ data: trending });
    }

    const data = await searchMulti(query.trim(), page);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

/**
 * Cinema Dossier / Details with credits, videos & recommendations
 * Supports both Movies and TV Shows via query param ?type=tv or ?type=movie
 */
router.get("/api/cinema/movie/:tmdbId", async (req, res, next) => {
  const tmdbId = Number(req.params.tmdbId);
  if (!tmdbId || isNaN(tmdbId)) {
    return res.status(400).json({ error: "Invalid movie/series ID" });
  }

  const mediaType = req.query.type || req.query.media_type || undefined;

  try {
    const [item, credits, videos, recommendations, watchlistStatus] = await Promise.allSettled([
      getCinemaDetails(tmdbId, mediaType),
      getCinemaCredits(tmdbId, mediaType),
      getCinemaVideos(tmdbId, mediaType),
      getCinemaRecommendations(tmdbId, 1, mediaType),
      checkWatchlistStatus(tmdbId)
    ]);

    if (item.status === "rejected") {
      throw new Error(item.reason?.message || "Failed to retrieve cinema details");
    }

    const itemData = item.value;
    const creditsData = credits.status === "fulfilled" ? credits.value : { cast: [], crew: [] };
    const videosData = videos.status === "fulfilled" ? videos.value?.results || [] : [];
    const recommendationsData = recommendations.status === "fulfilled" ? recommendations.value?.results || [] : [];
    const watchStatus = watchlistStatus.status === "fulfilled" ? watchlistStatus.value : { in_watchlist: false };

    // Find primary director (Film) or creator (Series)
    const directorInCrew =
      creditsData.crew?.find((c) => c.job === "Director") ||
      creditsData.crew?.find((c) => c.department === "Directing");
    const creatorInSeries = itemData.created_by && itemData.created_by.length > 0 ? itemData.created_by[0] : null;

    let primaryLead = null;
    if (directorInCrew) {
      primaryLead = { id: directorInCrew.id, name: directorInCrew.name, job: directorInCrew.job || "Director" };
    } else if (creatorInSeries) {
      primaryLead = { id: creatorInSeries.id, name: creatorInSeries.name, job: "Creator" };
    }

    // Filter official trailers/videos (YouTube)
    const trailers = videosData.filter(
      (v) => (v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    );

    const resolvedMediaType = itemData.media_type || (itemData.number_of_seasons ? "tv" : "movie");

    const enrichedItem = {
      ...itemData,
      media_type: resolvedMediaType,
      cast: (creditsData.cast || []).slice(0, 15),
      director: primaryLead,
      crew: (creditsData.crew || []).slice(0, 10),
      trailers: trailers.slice(0, 5),
      recommendations: recommendationsData.slice(0, 10),
      ...watchStatus
    };

    return res.json({ data: enrichedItem });
  } catch (error) {
    next(error);
  }
});

export default router;
