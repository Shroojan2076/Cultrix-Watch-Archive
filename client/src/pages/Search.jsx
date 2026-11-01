import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import MovieCard from "../components/MovieCard";
import { searchAnime, loadMoreAnime, searchMovies } from "../services/api";
import { getAnimeTitle } from "../utils/animeTitles";

const GENRES = [
  { label: "All Popular", query: "Popular" },
  { label: "Cyberpunk", query: "Cyberpunk" },
  { label: "Psychological", query: "Psychological" },
  { label: "Action", query: "Action" },
  { label: "Sci-Fi", query: "Sci-Fi" },
  { label: "Mecha", query: "Mecha" },
  { label: "Retro Classics", query: "Retro" },
  { label: "Fantasy", query: "Fantasy" },
  { label: "Thriller", query: "Thriller" },
  { label: "Seinen", query: "Seinen" }
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [inputQuery, setInputQuery] = useState(urlQuery);
  const [animeList, setAnimeList] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [activeMediumTab, setActiveMediumTab] = useState("anime"); // "anime" or "cinema"
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setInputQuery(urlQuery);
  }

  // Debounced live search as user types
  useEffect(() => {
    if (inputQuery === urlQuery) return;
    const timer = setTimeout(() => {
      if (inputQuery.trim()) {
        setSearchParams({ q: inputQuery.trim() });
      } else if (urlQuery) {
        setSearchParams({});
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputQuery, urlQuery, setSearchParams]);

  useEffect(() => {
    const activeQuery = urlQuery.trim() || "Popular";
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch Anime from MAL and Cinema (Movies & TV) from TMDB in parallel
        const [animeResult, cinemaResult] = await Promise.allSettled([
          searchAnime(activeQuery),
          urlQuery.trim() ? searchMovies(urlQuery.trim(), 1) : Promise.resolve({ results: [] })
        ]);

        if (isMounted) {
          const loadedAnime = animeResult.status === "fulfilled" ? (animeResult.value.data || []) : [];
          const loadedCinema = cinemaResult.status === "fulfilled" ? (cinemaResult.value.results || []) : [];

          setAnimeList(loadedAnime);
          setCinemaList(loadedCinema);
          setNextUrl(animeResult.status === "fulfilled" ? (animeResult.value.nextUrl || null) : null);

          // If no anime found, but cinema/TV results exist (e.g. WandaVision), automatically show Cinema results
          if (loadedAnime.length === 0 && loadedCinema.length > 0) {
            setActiveMediumTab("cinema");
          } else {
            setActiveMediumTab("anime");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to search catalogue.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [urlQuery]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setSearchParams({ q: inputQuery.trim() });
  }

  function handleQuickGenre(query) {
    setInputQuery(query);
    setSearchParams({ q: query });
  }

  async function handleLoadMore() {
    if (!nextUrl || loadingMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const result = await loadMoreAnime(nextUrl);

      setAnimeList((prev) => [...prev, ...(result.data || [])]);
      setNextUrl(result.nextUrl || null);
    } catch (err) {
      setError(err.message || "Failed to load more titles.");
    } finally {
      setLoadingMore(false);
    }
  }

  const sortedAnimeList = useMemo(() => {
    if (sortBy === "relevance") return animeList;

    return [...animeList].sort((a, b) => {
      const nodeA = a.node || {};
      const nodeB = b.node || {};

      if (sortBy === "title_asc") {
        return getAnimeTitle(nodeA).localeCompare(getAnimeTitle(nodeB));
      }
      if (sortBy === "score_desc") {
        return (Number(nodeB.mean) || 0) - (Number(nodeA.mean) || 0);
      }
      if (sortBy === "episodes_desc") {
        return (nodeB.num_episodes || 0) - (nodeA.num_episodes || 0);
      }
      return 0;
    });
  }, [animeList, sortBy]);

  return (
    <main className="search-page-container">
      {/* ======================================================================
          LEVEL 1: DISCOVERY CONTROLS
          Strict typographic scale, high-density layout, aged paper accents.
          ====================================================================== */}
      <section className="search-hero-bar">
        <div className="search-title-line">
          <h1 className="search-page-title font-display">
            {urlQuery.trim()
              ? `ARCHIVE SEARCH // "${urlQuery.toUpperCase()}"`
              : "POPULAR SELECTIONS // ARCHIVE"}
          </h1>
          <span className="search-count-label font-mono">
            {urlQuery.trim()
              ? `${animeList.length} anime • ${cinemaList.length} cinema/TV loaded`
              : `${animeList.length} titles loaded`}
          </span>
        </div>

        {/* Search Input Field */}
        <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
          <svg
            className="search-mag-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-field font-headline"
            placeholder="Search anime, films & TV series..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          {inputQuery && (
            <button
              type="button"
              className="search-clear-btn font-mono"
              onClick={() => {
                setInputQuery("");
                setSearchParams({});
              }}
            >
              CLEAR
            </button>
          )}
          <button type="submit" className="search-submit-btn font-headline">
            SEARCH
          </button>
        </form>

        {/* Quick-filter Theme Pills */}
        <div className="search-genres-row font-mono" role="tablist">
          {GENRES.map((genre) => (
            <button
              key={genre.query}
              type="button"
              className={`genre-filter-pill ${
                (urlQuery.toLowerCase() === genre.query.toLowerCase()) ||
                (!urlQuery && genre.query === "Popular")
                  ? "active"
                  : ""
              }`}
              onClick={() => handleQuickGenre(genre.query)}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </section>

      {/* ======================================================================
          LEVEL 2: CROSS-MEDIUM TABS & CONTROLS BAR
          ====================================================================== */}
      <section className="search-controls-bar">
        <div className="controls-left font-mono" style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Cross-Medium Switcher Tabs when searching */}
          {urlQuery.trim() && (cinemaList.length > 0 || animeList.length > 0) && (
            <div className="cinema-type-pills-wrap font-mono" role="group" aria-label="Medium switcher">
              <button
                type="button"
                className={`genre-filter-pill ${activeMediumTab === "anime" ? "active" : ""}`}
                onClick={() => setActiveMediumTab("anime")}
              >
                ANIME ({animeList.length})
              </button>
              <button
                type="button"
                className={`genre-filter-pill ${activeMediumTab === "cinema" ? "active" : ""}`}
                onClick={() => setActiveMediumTab("cinema")}
              >
                CINEMA & TV SERIES ({cinemaList.length})
              </button>
            </div>
          )}

          {activeMediumTab === "anime" && (
            <div className="sort-wrap">
              <span>SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown font-mono"
              >
                <option value="relevance">Relevance</option>
                <option value="score_desc">Highest Rated</option>
                <option value="title_asc">Title (A–Z)</option>
                <option value="episodes_desc">Most Episodes</option>
              </select>
            </div>
          )}
        </div>

        <div className="controls-right">
          <div className="view-mode-toggle font-mono">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              GRID
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              LIST
            </button>
          </div>
        </div>
      </section>

      {/* Error Notification */}
      {error && (
        <div className="search-error-state font-mono">
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="search-loading-state font-mono">
          <span>Searching cross-medium archives...</span>
        </div>
      )}

      {/* ======================================================================
          LEVEL 3: RESULTS AREA (ANIME OR CINEMA/TV)
          ====================================================================== */}
      {!loading && (
        <>
          {activeMediumTab === "anime" ? (
            sortedAnimeList.length > 0 ? (
              <div className={viewMode === "list" ? "search-results-list" : "search-results-grid"}>
                {sortedAnimeList.map((anime) => (
                  <AnimeCard
                    key={anime.node.id}
                    anime={anime}
                    variant={viewMode === "list" ? "row" : "default"}
                    showSynopsis={viewMode === "list"}
                  />
                ))}
              </div>
            ) : (
              !error && (
                <div className="search-no-results">
                  <h3 className="no-results-title font-condensed">NO ANIME FOUND</h3>
                  <p className="no-results-desc">
                    {cinemaList.length > 0
                      ? `Found ${cinemaList.length} matching films and TV series in the Cinema Archive.`
                      : `No anime matched "${urlQuery}".`}
                  </p>
                  {cinemaList.length > 0 ? (
                    <button
                      type="button"
                      className="btn-primary-action font-headline"
                      onClick={() => setActiveMediumTab("cinema")}
                    >
                      View Cinema & TV Results ({cinemaList.length}) →
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
                      <Link
                        to={`/cinema/explore?q=${encodeURIComponent(urlQuery)}`}
                        className="btn-primary-action font-headline"
                        style={{ textDecoration: "none" }}
                      >
                        Search Cinema Archive for "{urlQuery}" →
                      </Link>
                      <button
                        type="button"
                        className="btn-spotlight-secondary font-headline"
                        onClick={() => handleQuickGenre("Popular")}
                      >
                        Browse Popular Anime
                      </button>
                    </div>
                  )}
                </div>
              )
            )
          ) : (
            /* CINEMA & TV SERIES RESULTS */
            cinemaList.length > 0 ? (
              viewMode === "grid" ? (
                <div className="uniform-poster-grid">
                  {cinemaList.map((movie) => (
                    <MovieCard
                      key={`${movie.media_type || "item"}-${movie.id || movie.tmdb_id}`}
                      movie={movie}
                    />
                  ))}
                </div>
              ) : (
                <div className="film-list-rows-view">
                  {cinemaList.map((movie) => (
                    <MovieCard
                      key={`${movie.media_type || "item"}-${movie.id || movie.tmdb_id}`}
                      movie={movie}
                      variant="row"
                      showSynopsis={true}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="search-no-results">
                <h3 className="no-results-title font-condensed">NO CINEMA TITLES FOUND</h3>
                <p className="no-results-desc">
                  No movies or series found for "{urlQuery}".
                </p>
                {animeList.length > 0 && (
                  <button
                    type="button"
                    className="btn-primary-action font-headline"
                    onClick={() => setActiveMediumTab("anime")}
                  >
                    View Anime Results ({animeList.length}) →
                  </button>
                )}
              </div>
            )
          )}
        </>
      )}

      {/* Load More Pagination (Only for Anime list) */}
      {!loading && activeMediumTab === "anime" && nextUrl && (
        <div className="search-pagination-container">
          <button
            type="button"
            className="btn-load-more font-headline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading more titles..." : "Load More Titles →"}
          </button>
        </div>
      )}
    </main>
  );
}
