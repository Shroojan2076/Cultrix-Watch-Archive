# CULTRIX - CULTURE + MATRIX
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

[![Live Production](https://img.shields.io/badge/Live%20App-cultrix.shroojan.in-E23826?style=for-the-badge&logo=vercel&logoColor=white)](https://cultrix.shroojan.in)
[![Anime Portal](https://img.shields.io/badge/Anime%20Archive-cultrix.shroojan.in%2Fanime-E23826?style=for-the-badge)](https://cultrix.shroojan.in/anime)
[![Cinema Portal](https://img.shields.io/badge/Cinema%20Archive-cultrix.shroojan.in%2Fcinema-E5A93C?style=for-the-badge)](https://cultrix.shroojan.in/cinema)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Cultrix--Watch--Archive-181C22?style=for-the-badge&logo=github)](https://github.com/Shroojan2076/Cultrix-Watch-Archive)

---

## Live Deployments

* **Production Application:** [cultrix.shroojan.in](https://cultrix.shroojan.in)
* **Anime Portal:** [cultrix.shroojan.in/anime](https://cultrix.shroojan.in/anime)
* **Cinema Portal:** [cultrix.shroojan.in/cinema](https://cultrix.shroojan.in/cinema)

---

## Overview

**CULTRIX** (derived from **CULTURE + MATRIX**) is a decoupled, full-stack visual culture platform that brings together two distinct artistic mediums under one brand identity:

1. **ANIME MODE**: An expressive Tokyo underground publication aesthetic powered by the official **MyAnimeList API v2**.
2. **CINEMA MODE**: A 35mm cinémathèque aesthetic powered by **The Movie Database (TMDB) API** (supporting both feature films and television series).

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
| **Content Engine** | MyAnimeList API v2 (Japanese Animation) | The Movie Database TMDB API (Global Cinema & TV) |

---

## Key Features

### 1. Unified Application Shell & Mode Switcher
* **One-Click Mode Switcher:** Instantly toggle between `ANIME` and `CINEMA` with context-preserving route transitions (`/anime/*` ⇄ `/cinema/*`).
* **Backward-Compatible Persistence:** Preserves user mode in `localStorage` under `cultrix_mode` (with fallback to legacy preferences `yugen_index_mode`).
* **Responsive Navigation:** Clean desktop navigation bar and mobile drawer with quick access to Home, Explore, and Watchlists.

### 2. Anime Experience (Tokyo Underground)
* **English-First Title Resolution:** Intelligently prioritizes English titles (`alternative_titles.en`), falling back gracefully to canonical titles and romanized synonyms.
* **Monumental Spotlight Hero:** Showcases flagship seasonal series with backdrop art, Japanese typographic mark, synopsis, and instant watchlist CTA.
* **High-Contrast Paper Slab:** Curated selections presented on aged paper contrast slabs with bespoke typography.
* **Explore & Search:** Filter by curated themes (Cyberpunk, Psychological, Action, Sci-Fi, Mecha, Retro Classics, Dark Fantasy, Seinen), toggle between 2:3 poster grid and list rows.
* **4-Section Details Architecture:** Hero banner, interactive watchlist action deck, full synopsis, and technical specifications (status, studio, episodes, broadcast period).
* **Episode Watchlist:** Tracks viewing status (`Watching`, `Completed`, `Plan to Watch`, `On Hold`, `Dropped`), with one-click `+1 ep` progress increments and personal 1–10 ratings.

### 3. Cinema Experience (35mm Cinémathèque)
* **Widescreen 16:9 Hero:** Dynamic backdrop presentation of trending canonical works with director/runtime specs.
* **Weekly Trending Stills:** 16:9 cinematic still cards with celluloid vignetting and TMDB community scores.
* **Multi-Media Catalogue:** Comprehensive coverage of both feature films and TV shows with normalized runtime and metadata resolution.
* **Genre Discovery:** Instant filtering across Sci-Fi, Action, Thriller, Drama, Horror, Crime, Mystery, Adventure, and Animation.
* **Film Dossier Details:** High-resolution backdrop imagery, cast & crew credits (directors & series creators), embedded official YouTube trailers, release dates, budget/revenue stats, and runtime specifications.
* **Cinémathèque Personal Archive Watchlist:**
  * Widescreen landscape still frames with atmospheric celluloid vignettes.
  * Archival ledger statuses: `● SCREENED` (Amber glow) vs. `○ QUEUED` (Silver).
  * Metadata hierarchy: Classification/Media Type, Release Year, Runtime in minutes, Genres, and TMDB Community Rating.
  * Interactive controls: Instant status toggle (`✓ Screened` / `Queue`), personal 1–10 star rating selector, direct dossier link, and deletion.

---

## Screenshots & Interface Tour

### ⛩️ Anime Experience (Tokyo Underground Publication Aesthetic)

#### Home & Thematic Spotlight
![Anime Mode - Home Page](screenshots/cultrix-anime-homepage.png)

#### Anime Details Dossier & Action Deck
![Anime Mode - Details Page](screenshots/cultrix-anime-detailspage.png)

#### Personal Episode Watchlist & Ledger
![Anime Mode - Watchlist](screenshots/cultrix-anime-watchlist.png)

---

### 🎬 Cinema Experience (35mm Cinémathèque Aesthetic)

#### Widescreen Trending & Curated Genres
![Cinema Mode - Home Page](screenshots/cultrix-cinema-homepage.png)

#### Film Dossier, Technical Specs & Trailers
![Cinema Mode - Details Page](screenshots/cultrix-cinema-detailspage.png)

#### Cinémathèque Personal Archive & Screening Ledger
![Cinema Mode - Watchlist](screenshots/cultrix-cinema-watchlist.png)

---

## Architecture & Data Flow

```text
+--------------------------------------------------------------------------+
|                       CULTRIX Client (React 19 + Vite 8)                 |
|  - ModeContext: dynamic theme switcher (anime / cinema), localStorage    |
|  - Dynamic CULTRIX X Symbol: morphs vector geometry & colors per mode    |
|  - Tailwind CSS v4 & Modular Design Tokens (theme.css + style.css)       |
|  - React Router 7: dedicated /anime/* and /cinema/* route namespaces     |
+------------------------------------+-------------------------------------+
                                     |
                         HTTP / JSON | (REST API via fetch)
                                     v
+--------------------------------------------------------------------------+
|                       Server (Node.js + Express 5)                       |
|  - CORS middleware configured with CLIENT_URL origin credentials         |
|  - In-memory TTL caching (5 min) & request deduplication for TMDB API    |
|  - Dedicated route modules: /search, /anime, /watchlist, /api/cinema/*   |
+------------------+------------------------------------+------------------+
                   |                                    |
       SQL Queries | (node-pg pool)         HTTP / REST | (Axios Client)
                   v                                    v
+--------------------------------------+   +-------------------------------+
|      PostgreSQL (Neon Cloud DB)      |   |        External APIs          |
|  - anime (cached MAL metadata)       |   |  - MyAnimeList API v2 (Axios) |
|  - watchlist (anime episode tracking)|   |  - The Movie Database TMDB    |
|  - movie_watchlist (film archive)    |   |    (Axios + In-Memory Cache)  |
+--------------------------------------+   +-------------------------------+
```

---

## Tech Stack

### Frontend (`/client`)
* **Framework:** React 19, JavaScript (ESModules)
* **Build Tool:** Vite 8 (optimized production bundle builds in ~200ms)
* **Routing:** React Router DOM v7 (with `vercel.json` SPA rewrite rules)
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + Modular CSS Custom Properties (`theme.css` + `style.css`)
  * Dynamic theme tokens (`[data-theme="anime"]` vs. `[data-theme="cinema"]`)
  * Typography: `Space Grotesk`, `Syne`, `Cinzel`, `Cormorant Garamond`, `JetBrains Mono`, `Bebas Neue`, `Noto Sans JP`, `Plus Jakarta Sans`
  * Decoupled component styles: `.film-card`, `.film-row-card`, `.film-archive-*` vs. `.anime-card`, `.anime-row-card`, `.watchlist-*`

### Backend (`/server`)
* **Runtime:** Node.js (v18+)
* **Framework:** Express 5
* **Security:** Configured CORS policy matching client origin with credentials and strict HTTP methods
* **Database Driver:** `pg` (node-postgres connection pool with automatic SSL negotiation for cloud Postgres)
* **External HTTP Clients:** Axios (`axios`) with in-memory TTL caching and concurrent in-flight request deduplication for TMDB

### Database (PostgreSQL / Neon)
* **Provider:** Serverless PostgreSQL on [Neon.tech](https://neon.tech) (or local PostgreSQL)
* **Isolation:** Strict isolation between Anime tables (`anime`, `watchlist`) and Cinema tables (`movie_watchlist`). Zero shared foreign keys or cross-medium interference.

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
    status VARCHAR(50) DEFAULT 'want_to_watch',
    score DECIMAL(3, 1),
    overview TEXT,
    genres JSONB DEFAULT '[]'::jsonb,
    vote_average DECIMAL(3, 1),
    media_type VARCHAR(50) DEFAULT 'movie',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Reference

### Anime Endpoints (MyAnimeList Integration)
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/?q=<term>` | `?q=<term>` or `?query=<term>` | Search anime catalog via query parameters |
| `POST` | `/` | `{ "query": "<term>" }` | Search anime catalog via JSON body |
| `GET` | `/ranking` | `?type=all&limit=10` | Top/airing/popular anime ranking (`all`, `airing`, `bypopularity`, etc.) |
| `GET` | `/next` | `?url=<mal_url>` | Fetches next page of MAL pagination results |
| `GET` | `/anime/:mal_id` | `:mal_id` | Returns complete anime details + current watchlist status |
| `GET` | `/watchlist` | None | Retrieves all saved anime watchlist entries |
| `POST` | `/watchlist/add` | `{ mal_id, title, poster, media_type, ... }` | Adds anime to personal library |
| `PUT` | `/watchlist/:mal_id` | `{ status, episodes_watched, score }` | Updates watch progress, rating, or status |
| `DELETE` | `/watchlist/:mal_id`| None | Removes anime from personal library |

### Cinema Endpoints (TMDB Integration)
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cinema/trending` | `?window=week&page=1&type=all` | Trending cinema & TV (`window=week\|day`, `type=all\|movie\|tv`) |
| `GET` | `/api/cinema/popular` | `?page=1` | Currently popular feature films |
| `GET` | `/api/cinema/top-rated` | `?page=1` | Canonical all-time top rated masterworks |
| `GET` | `/api/cinema/upcoming` | `?page=1` | Upcoming theatrical and cinema releases |
| `GET` | `/api/cinema/now-playing` | `?page=1` | Films currently playing in theatres |
| `GET` | `/api/cinema/genres` | None | Curated TMDB film genres |
| `GET` | `/api/cinema/discover` | `?genre_id=<id>&sort_by=<sort>&page=1` | Explores films by genre and sorting criterion |
| `GET` | `/api/cinema/search` | `?q=<term>&page=1` | Multi-search across TMDB titles (movies & TV series) |
| `GET` | `/api/cinema/movie/:tmdbId`| `:tmdbId`, optional `?type=movie\|tv` | Full dossier: cast, crew, trailers, recommendations & watch status |
| `GET` | `/api/cinema/watchlist`| None | Retrieves personal cinémathèque film & TV registry |
| `POST` | `/api/cinema/watchlist/add` | `{ tmdb_id, title, status, score, ... }` | Registers film or TV series in personal archive |
| `PUT` | `/api/cinema/watchlist/:tmdbId` | `{ status, score }` | Updates screening status (`want_to_watch` / `watched`) or score |
| `DELETE`| `/api/cinema/watchlist/:tmdbId`| None | Removes item from personal archive |

---

## Local Setup & Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **PostgreSQL** (running locally on port 5432, or a free [Neon](https://neon.tech) serverless instance)
* **TMDB API Key** (v3 auth from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))
* **MyAnimeList Client ID** (from [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig))

### 1. Clone the repository
```bash
git clone https://github.com/Shroojan2076/Cultrix-Watch-Archive.git
cd Cultrix-Watch-Archive
```

### 2. Configure & Run Backend (`/server`)
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=3000

# PostgreSQL Connection String (Option 1: Neon Cloud or Hosted Postgres)
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require

# Local PostgreSQL Configuration (Option 2: Local fallback when DATABASE_URL is unset)
# PG_HOST=localhost
# PG_PORT=5432
# PG_USER=postgres
# PG_PASSWORD=your_local_password
# PG_DATABASE=myanimesite

# External API Keys
MAL_CLIENT_ID=your_mal_client_id_here
MAL_CLIENT_SECRET=your_mal_client_secret_here
TMDB_API_KEY=your_tmdb_api_key_v3_here

# Client URL for CORS (Set to your client URL; e.g., http://localhost:5173 or production domain)
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
# or for production:
npm start
```
The server will start at `http://localhost:3000` and automatically verify and initialize database tables.

### 3. Configure & Run Frontend (`/client`)
Open a new terminal:
```bash
cd client
npm install
```

(Optional) Create a `.env` file in `client/`:
```env
# Defaults to http://localhost:3000 if not specified
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
* **Cross-Browser Verification:** Tested for dynamic SVG favicons, mode switching, and theme token transitions.

---

## Author & License

* **Created by:** [Shroojan Dhok](https://github.com/Shroojan2076)
* **GitHub:** [@Shroojan2076](https://github.com/Shroojan2076)
* **LinkedIn:** [@shroojan-dhok-679a73377](https://www.linkedin.com/in/shroojan-dhok-679a73377/)
* **Repository:** [https://github.com/Shroojan2076/Cultrix-Watch-Archive](https://github.com/Shroojan2076/Cultrix-Watch-Archive)
* **License:** [ISC](https://opensource.org/license/isc-license-txt)
