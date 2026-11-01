import { Pool } from "pg";
import "dotenv/config";

const isCloudDb = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost");

/**
 * CULTRIX Database Architecture & Connection Pool
 *
 * TENANCY & AUTHENTICATION ARCHITECTURE NOTE:
 * Authentication is currently not implemented. Both the Anime watchlist (`watchlist`)
 * and the Cinema watchlist (`movie_watchlist`) are shared single-tenant catalogues
 * across visitors rather than isolated personal accounts.
 *
 * MULTI-USER MIGRATION PLAN (FUTURE ROADMAP):
 * When user authentication (e.g. JWT / Sessions / OAuth) is introduced:
 * 1. Create a `users` table:
 *    CREATE TABLE users (
 *      id SERIAL PRIMARY KEY,
 *      email VARCHAR(255) UNIQUE NOT NULL,
 *      password_hash VARCHAR(255) NOT NULL,
 *      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *    );
 *
 * 2. Anime Watchlist Multi-User Migration:
 *    ALTER TABLE watchlist ADD COLUMN user_id INT REFERENCES users(id) ON DELETE CASCADE;
 *    ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS watchlist_anime_id_key;
 *    ALTER TABLE watchlist ADD CONSTRAINT uq_watchlist_user_anime UNIQUE (user_id, anime_id);
 *
 * 3. Movie Watchlist Multi-User Migration:
 *    ALTER TABLE movie_watchlist ADD COLUMN user_id INT REFERENCES users(id) ON DELETE CASCADE;
 *    ALTER TABLE movie_watchlist DROP CONSTRAINT IF EXISTS movie_watchlist_tmdb_id_key;
 *    ALTER TABLE movie_watchlist ADD CONSTRAINT uq_movie_watchlist_user_tmdb UNIQUE (user_id, tmdb_id);
 *
 * DATA ISOLATION GUARANTEE:
 * The anime tables (`anime`, `watchlist`) and the cinema table (`movie_watchlist`)
 * share zero tables, zero foreign keys, and zero ID constraints. Operations on one
 * medium cannot affect or mutate records in the other.
 */

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isCloudDb ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PG_HOST || "localhost",
      port: parseInt(process.env.PG_PORT, 10) || 5432,
      database: process.env.PG_DATABASE || "myanimesite",
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function initDB() {
  const query = `
    CREATE TABLE IF NOT EXISTS anime (
      id SERIAL PRIMARY KEY,
      mal_id INT NOT NULL UNIQUE,
      title VARCHAR(500) NOT NULL,
      poster TEXT,
      media_type VARCHAR(50),
      synopsis TEXT,
      episodes INT,
      status VARCHAR(100),
      start_date VARCHAR(50),
      end_date VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      anime_id INT NOT NULL UNIQUE REFERENCES anime(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'plan_to_watch',
      episodes_watched INT DEFAULT 0,
      score DECIMAL(3, 1),
      started_at DATE,
      completed_at DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movie_watchlist (
      id SERIAL PRIMARY KEY,
      tmdb_id INT NOT NULL UNIQUE,
      title VARCHAR(500) NOT NULL,
      original_title VARCHAR(500),
      poster_path TEXT,
      backdrop_path TEXT,
      release_date VARCHAR(50),
      runtime INT,
      status VARCHAR(50) DEFAULT 'want_to_watch',
      score DECIMAL(3, 1),
      overview TEXT,
      genres JSONB DEFAULT '[]'::jsonb,
      vote_average DECIMAL(3, 1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Connected to PostgreSQL and tables verified.");
  } catch (error) {
    console.error("Database connection/initialization error:", error.message);
  }
}

initDB();

export default pool;