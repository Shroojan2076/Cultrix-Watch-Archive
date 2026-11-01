# CULTRIX // CULTURE + MATRIX
### Dual-Medium Visual Culture Discovery Platform (Anime + Cinema)

```text
   ██████╗██╗   ██╗██╗  ████████╗██████╗ ██╗██╗  ██╗
  ██╔════╝██║   ██║██║  ╚══██╔══╝██╔══██╗██║╚██╗██╔╝
  ██║     ██║   ██║██║     ██║   ██████╔╝██║ ╚███╔╝ 
  ██║     ██║   ██║██║     ██║   ██╔══██╗██║ ██╔██╗ 
  ╚██████╗╚██████╔╝███████╗██║   ██║  ██║██║██╔╝ ██╗
   ╚═════╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
```

> **Culture Has No Boundaries.**  
> An independent discovery platform and personal registry for visual culture across **Animation** and **Cinema**.

---

## Overview

**CULTRIX** (derived from **CULTURE + MATRIX**) is a decoupled, full-stack visual culture platform that brings together two distinct artistic mediums under one brand identity:

1. **ANIME MODE**: An expressive Tokyo underground publication aesthetic powered by the official **MyAnimeList API v2**.
2. **CINEMA MODE**: A 35mm cinémathèque aesthetic powered by **The Movie Database (TMDB) API**.

Both mediums share the **CULTRIX** brand shell, unified navigation, and mode switcher, while maintaining strictly separated content catalogues, discovery patterns, details architectures, watchlists, and database storage.

---

## Dynamic Dual-Medium Brand & Visual Identity

CULTRIX features a dynamic dual-environment theme engine that transforms the interface when toggling between Anime and Cinema:

| Aspect | Anime Mode | Cinema Mode |
| :--- | :--- | :--- |
| **Aesthetic Direction** | Tokyo underground editorial, aged paper, carbon black | 35mm cinémathèque, celluloid obsidian, titanium |
| **Signature Accent** | **Vermilion** (`#E23826`) | **Film Gold & Amber** (`#E5A93C`) |
| **Typography System** | `Syne` (Display) + `Space Grotesk` (Headlines) | `Cinzel` (Classical Roman Serif) + `Space Grotesk` |
| **Matrix X Logo** | Sharp graphic print matrix with diagonal velocity | 35mm celluloid film strip with sprocket perforations & projector aperture |
| **Wordmark Accenting** | `CULTRI`<span style="color:#E23826">`X`</span> in Vermilion | `CULTRI`<span style="color:#E5A93C">`X`</span> in Film Gold |
| **Browser Favicon** | Dynamic `/favicon.svg` (Print Matrix) | Dynamic `/favicon-cinema.svg` (35mm Celluloid) |
| **Content Engine** | MyAnimeList API v2 (Japanese Animation) | The Movie Database TMDB API (Global Cinema) |

---

## Key Features

### 1. Unified Application Shell & Mode Switcher
* **One-Click Mode Switcher:** Instantly toggle between `ANIME` and `CINEMA` with context-preserving route transitions (`/anime/*` $\leftrightarrow$ `/cinema/*`).
* **Backward-Compatible Persistence:** Preserves user mode in `localStorage` under `cultrix_mode` (with fallback to legacy preferences).
* **Responsive Navigation:** Clean desktop navigation bar and mobile drawer with quick access to Home, Explore, and Watchlists.

### 2. Anime Experience (Tokyo Underground)
* **English-First Title Resolution:** Intelligently prioritizes English titles (`alternative_titles.en`), falling back gracefully to canonical titles.
* **Monumental Spotlight Hero:** Showcases seasonal flagship series with backdrop art, Japanese typographic mark, synopsis, and instant watchlist CTA.
* **High-Contrast Paper Slab:** Curated selections presented on aged paper contrast slabs with bespoke typography.
* **Explore & Search:** Filter by curated themes (Cyberpunk, Psychological, Retro, Mecha, Dark Fantasy, Seinen), toggle between 2:3 poster grid and list rows.
* **4-Section Details Architecture:** Hero banner, interactive watchlist action deck, full synopsis, and technical specifications.
* **Episode Watchlist:** Tracks viewing status (`Watching`, `Completed`, `Plan to Watch`, `On Hold`, `Dropped`), with one-click `+1 ep` progress increments and personal 1–10 ratings.

### 3. Cinema Experience (35mm Cinémathèque)
* **Widescreen 16:9 Hero:** Dynamic backdrop presentation of trending canonical films with director/runtime specs.
* **Weekly Trending Stills:** 16:9 cinematic still cards with celluloid vignetting and TMDB community scores.
* **Genre Discovery:** Instant filtering across Sci-Fi, Action, Thriller, Drama, Horror, Crime, and Animation.
* **Film Dossier Details:** Backdrop imagery, cast & crew credits, trailers/videos, release dates, and runtime specifications.
* **Cinémathèque Personal Archive Watchlist:**
  * Widescreen landscape still frames with atmospheric celluloid vignettes.
  * Archival ledger statuses: `● SCREENED` (Amber glow) vs. `○ QUEUED` (Silver).
  * Metadata hierarchy: Classification, Release Year, Runtime in minutes, Genres, and TMDB Community Rating.
  * Interactive controls: Instant status toggle (`✓ Screened`), personal 1–10 star rating selector, direct dossier link, and deletion.

---

## Architecture & Data Flow

```text
+--------------------------------------------------------------------------+
|                       CULTRIX Client (React 19 + Vite)                   |
|  - ModeContext: dynamic theme switcher (anime / cinema), localStorage    |
|  - Dynamic CULTRIX X Symbol: morphs vector geometry & colors per mode    |
|  - Pure Vanilla CSS Design Tokens (theme.css + style.css)                |
|  - React Router 7: dedicated /anime/* and /cinema/* route namespaces     |
+------------------------------------+-------------------------------------+
                                     |
                         HTTP / JSON | (REST API via fetch)
                                     v
+--------------------------------------------------------------------------+
|                       Server (Node.js + Express 5)                       |
|  - Constrained project CORS allowlist (strict preview regex security)   |
|  - In-memory TTL caching for third-party API rate-limit resilience       |
|  - Dedicated route modules: /search, /anime, /watchlist, /api/cinema/*   |
+------------------+------------------------------------+------------------+
                   |                                    |
       SQL Queries | (node-pg pool)         HTTP / REST | (API Key / Client ID)
                   v                                    v
+--------------------------------------+   +-------------------------------+
|      PostgreSQL (Neon Cloud DB)      |   |        External APIs          |
|  - anime (cached MAL metadata)       |   |  - MyAnimeList API v2         |
|  - watchlist (anime episode tracking)|   |  - The Movie Database (TMDB)  |
|  - movie_watchlist (film archive)    |   +-------------------------------+
+--------------------------------------+
```

---

## Tech Stack

### Frontend (`/client`)
* **Framework:** React 19, JavaScript (ESModules)
* **Build Tool:** Vite 8 (production bundle builds in ~200ms)
* **Routing:** React Router DOM v7 (with `vercel.json` SPA rewrite rules)
* **Styling:** Modular Vanilla CSS & CSS Custom Properties (`theme.css` + `style.css`)
  * Dynamic theme tokens (`[data-theme="anime"]` vs. `[data-theme="cinema"]`)
  * Typography: `Space Grotesk`, `Syne`, `Cinzel`, `Cormorant Garamond`, `JetBrains Mono`, `Bebas Neue`
  * Fully decoupled component classes: `.film-card`, `.film-row-card`, `.film-archive-*` vs. `.anime-card`, `.anime-row-card`, `.watchlist-*`

### Backend (`/server`)
* **Runtime:** Node.js (v20+)
* **Framework:** Express 5
* **Security:** Hardened CORS policy with strict project-level Vercel preview regex validation
* **Database Driver:** `pg` (node-postgres connection pool with SSL handling)
* **External Clients:** Native `fetch` with in-memory caching for TMDB and MAL APIs

### Database (Neon PostgreSQL)
* **Provider:** Serverless PostgreSQL on Neon.tech
* **Isolation:** Strict separation between Anime tables and Cinema tables. Zero cross-medium data interference.

---

## Database Schema

```sql
-- 1. Anime Metadata Cache
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

-- 2. Anime User Watchlist
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

-- 3. Dedicated Cinema Archive Watchlist
CREATE TABLE IF NOT EXISTS movie_watchlist (
    id SERIAL PRIMARY KEY,
    tmdb_id INT NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    poster_path TEXT,
    backdrop_path TEXT,
    release_date VARCHAR(50),
    runtime INT,
    status VARCHAR(50) DEFAULT 'want_to_watch' NOT NULL,
    score NUMERIC(3, 1),
    overview TEXT,
    genres TEXT[],
    vote_average NUMERIC(3, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Reference

### Anime Endpoints (MyAnimeList Integration)
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | `{ "query": "<term>" }` | Search anime catalog via MAL API |
| `GET` | `/ranking` | `?type=all&limit=10` | Top/airing/popular anime ranking |
| `GET` | `/next` | `?url=<mal_url>` | Fetches next page of MAL results |
| `GET` | `/anime/:mal_id` | `:mal_id` | Returns complete anime details + watchlist status |
| `GET` | `/watchlist` | None | Retrieves all saved anime entries |
| `POST` | `/watchlist/add` | `{ mal_id, title, poster, ... }` | Adds anime to watchlist |
| `PUT` | `/watchlist/:mal_id` | `{ status, episodes_watched, score }` | Updates progress, rating, or watch status |
| `DELETE` | `/watchlist/:mal_id`| None | Removes anime from watchlist |

### Cinema Endpoints (TMDB Integration)
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cinema/trending` | `?time_window=week&page=1` | Weekly trending cinema |
| `GET` | `/api/cinema/popular` | `?page=1` | Currently popular feature films |
| `GET` | `/api/cinema/top-rated` | `?page=1` | Canonical all-time top rated masterworks |
| `GET` | `/api/cinema/genres` | None | Curated TMDB film genres |
| `GET` | `/api/cinema/discover` | `?genre_id=<id>&sort_by=<sort>&page=1` | Explores films by genre and sorting index |
| `GET` | `/api/cinema/search` | `?q=<term>&page=1` | Searches TMDB movie database |
| `GET` | `/api/cinema/movie/:id`| `:id` | Full film dossier: cast, crew, videos, specs |
| `GET` | `/api/cinema/watchlist`| None | Retrieves personal cinémathèque film registry |
| `POST` | `/api/cinema/watchlist/add` | `{ tmdb_id, title, status, ... }` | Registers film in personal archive |
| `PUT` | `/api/cinema/watchlist/:id` | `{ status, score }` | Updates screening status or personal rating |
| `DELETE`| `/api/cinema/watchlist/:id`| None | Removes film from personal archive |

---

## Local Setup & Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **PostgreSQL** (running locally on port 5432, or a free [Neon](https://neon.tech) connection string)
* **TMDB API Key** (v3 auth from [themoviedb.org](https://www.themoviedb.org/settings/api))
* **MyAnimeList Client ID** (from [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig))

### 1. Clone the repository
```bash
git clone https://github.com/Shroojan2076/anime-website.git
cd anime-website
```

### 2. Configure & Run Backend (`/server`)
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=3000

# PostgreSQL Connection String (Neon Cloud or Local)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# External API Keys
MAL_CLIENT_ID=your_mal_client_id
MAL_CLIENT_SECRET=your_mal_client_secret
TMDB_API_KEY=your_tmdb_api_key

# CORS Allowed Origins (Comma-separated in production)
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
# or
npm start
```
The server will start at `http://localhost:3000` and automatically verify database tables.

### 3. Configure & Run Frontend (`/client`)
Open a new terminal:
```bash
cd client
npm install
```

(Optional) Create a `.env` file in `client/`:
```env
VITE_API_URL=http://localhost:3000
```

Start the Vite development server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Quality Assurance & Verification

* **ESLint:** Run `npm --prefix client run lint` (0 errors, 0 warnings).
* **Production Build:** Run `npm --prefix client run build` (builds cleanly in ~200ms).
* **CORS Security:** Tested against allowed origins and unauthorized origins (`403 Forbidden`).

---

## Author & License

* **Created by:** Shroojan Dhok
* **GitHub:** [@Shroojan2076](https://github.com/Shroojan2076)
* **LinkedIn:** [@shroojan-dhok-679a73377](https://www.linkedin.com/in/shroojan-dhok-679a73377/)
* **Repository:** [https://github.com/Shroojan2076/anime-website](https://github.com/Shroojan2076/anime-website)
