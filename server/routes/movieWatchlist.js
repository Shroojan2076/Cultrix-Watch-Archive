import express from "express";
import pool from "../db/database.js";

const router = express.Router();

const ALLOWED_STATUSES = new Set(["want_to_watch", "watched"]);

/**
 * Validation helpers for Movie Watchlist inputs
 */
function validateTmdbId(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { valid: false, error: "tmdb_id must be a positive integer" };
  }
  return { valid: true, value: parsed };
}

function validateTitle(title) {
  if (typeof title !== "string" || !title.trim()) {
    return { valid: false, error: "title is required and cannot be empty" };
  }
  const trimmed = title.trim();
  if (trimmed.length > 500) {
    return { valid: false, error: "title cannot exceed 500 characters" };
  }
  return { valid: true, value: trimmed };
}

function validateStatus(status) {
  if (status === undefined || status === null) {
    return { valid: true, value: "want_to_watch" };
  }
  if (!ALLOWED_STATUSES.has(status)) {
    return {
      valid: false,
      error: "status must be either 'want_to_watch' or 'watched'"
    };
  }
  return { valid: true, value: status };
}

function validateScore(score) {
  if (score === undefined || score === null || score === "") {
    return { valid: true, value: null };
  }
  const parsed = Number(score);
  if (isNaN(parsed) || parsed < 0 || parsed > 10) {
    return { valid: false, error: "score must be a number between 0 and 10" };
  }
  // Store with 1 decimal precision
  return { valid: true, value: Math.round(parsed * 10) / 10 };
}

function validateRuntime(runtime) {
  if (runtime === undefined || runtime === null || runtime === "") {
    return { valid: true, value: null };
  }
  const parsed = Number(runtime);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1500) {
    return { valid: false, error: "runtime must be a non-negative integer under 1500 minutes" };
  }
  return { valid: true, value: parsed };
}

function validateReleaseDate(date) {
  if (!date) return { valid: true, value: null };
  if (typeof date !== "string") {
    return { valid: false, error: "release_date must be a valid date string" };
  }
  const trimmed = date.trim();
  if (trimmed.length > 50) {
    return { valid: false, error: "release_date exceeds maximum length" };
  }
  return { valid: true, value: trimmed };
}

/**
 * GET /api/cinema/watchlist
 * Retrieve all movies in the cinema watchlist
 */
router.get("/api/cinema/watchlist", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id AS watchlist_id,
        tmdb_id,
        title,
        original_title,
        poster_path,
        backdrop_path,
        release_date,
        runtime,
        status,
        score,
        overview,
        genres,
        vote_average,
        created_at,
        updated_at
      FROM movie_watchlist
      ORDER BY updated_at DESC
    `);

    return res.json({ data: rows });
  } catch (error) {
    console.error("Failed to load movie watchlist:", error.message);
    next(error);
  }
});

/**
 * POST /api/cinema/watchlist/add
 * Add or upsert movie in movie_watchlist with strict validation
 */
router.post("/api/cinema/watchlist/add", async (req, res, next) => {
  const {
    tmdb_id,
    title,
    original_title,
    poster_path,
    backdrop_path,
    release_date,
    runtime,
    status,
    score,
    overview,
    genres = [],
    vote_average
  } = req.body;

  // 1. Validate required fields
  const tmdbCheck = validateTmdbId(tmdb_id);
  if (!tmdbCheck.valid) {
    return res.status(400).json({ error: tmdbCheck.error });
  }

  const titleCheck = validateTitle(title);
  if (!titleCheck.valid) {
    return res.status(400).json({ error: titleCheck.error });
  }

  const statusCheck = validateStatus(status);
  if (!statusCheck.valid) {
    return res.status(400).json({ error: statusCheck.error });
  }

  const scoreCheck = validateScore(score);
  if (!scoreCheck.valid) {
    return res.status(400).json({ error: scoreCheck.error });
  }

  const runtimeCheck = validateRuntime(runtime);
  if (!runtimeCheck.valid) {
    return res.status(400).json({ error: runtimeCheck.error });
  }

  const dateCheck = validateReleaseDate(release_date);
  if (!dateCheck.valid) {
    return res.status(400).json({ error: dateCheck.error });
  }

  // Sanitize vote_average
  let sanitizedVoteAverage = null;
  if (vote_average !== undefined && vote_average !== null && vote_average !== "") {
    const parsedVote = Number(vote_average);
    if (!isNaN(parsedVote) && parsedVote >= 0 && parsedVote <= 10) {
      sanitizedVoteAverage = Math.round(parsedVote * 10) / 10;
    }
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO movie_watchlist (
        tmdb_id,
        title,
        original_title,
        poster_path,
        backdrop_path,
        release_date,
        runtime,
        status,
        score,
        overview,
        genres,
        vote_average,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      ON CONFLICT (tmdb_id) DO UPDATE SET
        title = EXCLUDED.title,
        original_title = COALESCE(EXCLUDED.original_title, movie_watchlist.original_title),
        poster_path = COALESCE(EXCLUDED.poster_path, movie_watchlist.poster_path),
        backdrop_path = COALESCE(EXCLUDED.backdrop_path, movie_watchlist.backdrop_path),
        release_date = COALESCE(EXCLUDED.release_date, movie_watchlist.release_date),
        runtime = COALESCE(EXCLUDED.runtime, movie_watchlist.runtime),
        status = EXCLUDED.status,
        score = COALESCE(EXCLUDED.score, movie_watchlist.score),
        overview = COALESCE(EXCLUDED.overview, movie_watchlist.overview),
        genres = COALESCE(EXCLUDED.genres, movie_watchlist.genres),
        vote_average = COALESCE(EXCLUDED.vote_average, movie_watchlist.vote_average),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        tmdbCheck.value,
        titleCheck.value,
        original_title ? String(original_title).slice(0, 500) : null,
        poster_path || null,
        backdrop_path || null,
        dateCheck.value,
        runtimeCheck.value,
        statusCheck.value,
        scoreCheck.value,
        overview || null,
        JSON.stringify(Array.isArray(genres) ? genres : []),
        sanitizedVoteAverage
      ]
    );

    return res.status(201).json({
      message: "Movie saved to watchlist",
      data: rows[0]
    });
  } catch (error) {
    console.error("Failed to add movie to watchlist:", error.message);
    next(error);
  }
});

/**
 * PUT /api/cinema/watchlist/:tmdbId
 * Update movie watchlist item (status, score) with strict validation
 */
router.put("/api/cinema/watchlist/:tmdbId", async (req, res, next) => {
  const tmdbCheck = validateTmdbId(req.params.tmdbId);
  if (!tmdbCheck.valid) {
    return res.status(400).json({ error: tmdbCheck.error });
  }

  const { status, score } = req.body;
  const updates = [];
  const values = [tmdbCheck.value];
  let paramIndex = 2;

  if (status !== undefined) {
    const statusCheck = validateStatus(status);
    if (!statusCheck.valid) {
      return res.status(400).json({ error: statusCheck.error });
    }
    updates.push(`status = $${paramIndex++}`);
    values.push(statusCheck.value);
  }

  if (score !== undefined) {
    const scoreCheck = validateScore(score);
    if (!scoreCheck.valid) {
      return res.status(400).json({ error: scoreCheck.error });
    }
    updates.push(`score = $${paramIndex++}`);
    values.push(scoreCheck.value);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update (allowed: status, score)" });
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");

  try {
    const { rows } = await pool.query(
      `
      UPDATE movie_watchlist
      SET ${updates.join(", ")}
      WHERE tmdb_id = $1
      RETURNING *
      `,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Movie not found in watchlist" });
    }

    return res.json({
      message: "Movie watchlist updated",
      data: rows[0]
    });
  } catch (error) {
    console.error("Failed to update movie watchlist:", error.message);
    next(error);
  }
});

/**
 * DELETE /api/cinema/watchlist/:tmdbId
 * Remove movie from movie_watchlist with strict validation
 */
router.delete("/api/cinema/watchlist/:tmdbId", async (req, res, next) => {
  const tmdbCheck = validateTmdbId(req.params.tmdbId);
  if (!tmdbCheck.valid) {
    return res.status(400).json({ error: tmdbCheck.error });
  }

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM movie_watchlist WHERE tmdb_id = $1",
      [tmdbCheck.value]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Movie not found in watchlist" });
    }

    return res.json({
      message: "Movie removed from watchlist",
      tmdb_id: tmdbCheck.value
    });
  } catch (error) {
    console.error("Failed to remove movie from watchlist:", error.message);
    next(error);
  }
});

export default router;
