import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import { searchAnime, loadMoreAnime } from "../services/api";
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

  useEffect(() => {
    const activeQuery = urlQuery.trim() || "Popular";
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await searchAnime(activeQuery);
        if (isMounted) {
          setAnimeList(result.data || []);
          setNextUrl(result.nextUrl || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to search anime.");
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
          LEVEL 1: SEARCH AND DISCOVERY CONTROLS
          Clean search bar and restrained genre filter pills
          ====================================================================== */}
      <section className="search-hero-bar">
        <div className="search-title-line">
          <h1 className="search-page-title font-condensed">
            {urlQuery.trim() ? `RESULTS FOR "${urlQuery}"` : "EXPLORE ANIME"}
          </h1>
          <span className="search-count-label font-mono">
            {animeList.length > 0 ? `${animeList.length} titles loaded` : ""}
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
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Search by title, director, or keyword..."
            className="search-input-element font-headline"
          />
          {inputQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setInputQuery("");
                setSearchParams({});
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <button type="submit" className="search-btn-action font-headline">
            Search
          </button>
        </form>

        {/* Genre Tags Shortcuts */}
        <div className="search-genre-shortcuts font-headline">
          {GENRES.map((g) => {
            const isActive = (urlQuery || "Popular").toLowerCase() === g.query.toLowerCase();
            return (
              <button
                key={g.label}
                type="button"
                className={`genre-shortcut-btn ${isActive ? "active" : ""}`}
                onClick={() => handleQuickGenre(g.query)}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* ======================================================================
            LEVEL 2: RESULTS INFORMATION AND SORTING CONTROLS
            ====================================================================== */}
        <div className="search-toolbar-row">
          <div className="toolbar-left-info font-mono">
            <span>Viewing:</span>
            <strong>{urlQuery.trim() ? `"${urlQuery}"` : "Popular Anime"}</strong>
            {sortedAnimeList.length > 0 && <span>({sortedAnimeList.length} results)</span>}
          </div>

          <div className="toolbar-right-controls">
            {/* View Mode (Grid / List) */}
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-pill-btn font-headline ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
              >
                Grid
              </button>
              <button
                type="button"
                className={`view-pill-btn font-headline ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List View"
              >
                List
              </button>
            </div>

            {/* Sort Select */}
            <div className="sort-select-wrapper font-headline">
              <label htmlFor="search-sort-select">Sort:</label>
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select-field"
              >
                <option value="relevance">Relevance</option>
                <option value="score_desc">Rating (High to Low)</option>
                <option value="title_asc">Title (A–Z)</option>
                <option value="episodes_desc">Episodes (Most)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="search-error-state font-mono">
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="search-loading-state font-mono">
          <span>Loading anime catalogue...</span>
        </div>
      )}

      {/* ======================================================================
          LEVEL 3: STRUCTURED POSTER GRID / LIST
          Strict 2:3 aspect ratio, uniform dimensions, zero horizontal overflow.
          ====================================================================== */}
      {!loading && (
        <>
          {sortedAnimeList.length > 0 ? (
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
                  No titles matched "{urlQuery}". Try searching for popular titles like "Cyberpunk", "Attack on Titan", or "Death Note".
                </p>
                <button
                  type="button"
                  className="btn-primary-action font-headline"
                  onClick={() => handleQuickGenre("Popular")}
                >
                  Browse Popular Anime
                </button>
              </div>
            )
          )}
        </>
      )}

      {/* Load More Pagination */}
      {!loading && nextUrl && (
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
