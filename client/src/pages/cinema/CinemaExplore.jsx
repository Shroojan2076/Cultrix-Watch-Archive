import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import {
  searchMovies,
  discoverMoviesByGenre,
  getCinemaPopular,
  getCinemaTopRated
} from "../../services/api";

const CINEMA_GENRES = [
  { label: "All Popular", id: "popular" },
  { label: "Top Rated", id: "top_rated" },
  { label: "Sci-Fi", id: 878 },
  { label: "Action", id: 28 },
  { label: "Thriller", id: 53 },
  { label: "Drama", id: 18 },
  { label: "Horror", id: 27 },
  { label: "Crime", id: 80 },
  { label: "Animation", id: 16 },
  { label: "Mystery", id: 9648 },
  { label: "Adventure", id: 12 }
];

export default function CinemaExplore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const urlGenre = searchParams.get("genre") || "";
  const urlSort = searchParams.get("sort") || "";

  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [inputQuery, setInputQuery] = useState(urlQuery);
  const [movieList, setMovieList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const initialSort = urlSort === "rating" || urlSort === "rating_desc" || urlGenre === "top_rated"
    ? "rating_desc"
    : urlSort === "date_desc"
    ? "date_desc"
    : urlSort === "title_asc"
    ? "title_asc"
    : "popularity_desc";

  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setInputQuery(urlQuery);
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchMovies() {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);

        let data;
        if (urlQuery.trim()) {
          data = await searchMovies(urlQuery.trim(), 1);
        } else if (urlGenre === "top_rated" || urlSort === "rating") {
          data = await getCinemaTopRated(1);
        } else if (urlGenre && urlGenre !== "popular") {
          data = await discoverMoviesByGenre(urlGenre, 1);
        } else {
          data = await getCinemaPopular(1);
        }

        if (isMounted) {
          setMovieList(data.results || []);
          setTotalPages(data.total_pages || 1);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch movies.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [urlQuery, urlGenre, urlSort]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setSearchParams({ q: inputQuery.trim() });
  }

  function handleClearSearch() {
    setInputQuery("");
    setSearchParams({});
  }

  function handleGenreClick(genreItem) {
    setInputQuery("");
    if (genreItem.id === "popular") {
      setSearchParams({});
    } else if (genreItem.id === "top_rated") {
      setSearchParams({ genre: "top_rated" });
    } else {
      setSearchParams({ genre: String(genreItem.id) });
    }
  }

  async function handleLoadMore() {
    if (currentPage >= totalPages || loadingMore) return;
    const nextPage = currentPage + 1;

    try {
      setLoadingMore(true);
      setError(null);

      let data;
      if (urlQuery.trim()) {
        data = await searchMovies(urlQuery.trim(), nextPage);
      } else if (urlGenre === "top_rated" || urlSort === "rating") {
        data = await getCinemaTopRated(nextPage);
      } else if (urlGenre && urlGenre !== "popular") {
        data = await discoverMoviesByGenre(urlGenre, nextPage);
      } else {
        data = await getCinemaPopular(nextPage);
      }

      setMovieList(prev => [...prev, ...(data.results || [])]);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err.message || "Failed to load more films.");
    } finally {
      setLoadingMore(false);
    }
  }

  const sortedMovies = useMemo(() => {
    return [...movieList].sort((a, b) => {
      if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "rating_desc") {
        return (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0);
      }
      if (sortBy === "date_desc") {
        return (b.release_date || "").localeCompare(a.release_date || "");
      }
      // default popularity
      return (Number(b.popularity) || 0) - (Number(a.popularity) || 0);
    });
  }, [movieList, sortBy]);

  const activeGenreId = urlQuery ? null : (urlGenre || "popular");

  return (
    <main className="search-page-container cinema-explore">
      {/* ======================================================================
          LEVEL 1: SEARCH AND DISCOVERY CONTROLS
          ====================================================================== */}
      <section className="search-hero-bar">
        <div className="search-title-line">
          <h1 className="search-page-title font-display cinema-explore-title">
            {urlQuery.trim()
              ? `ARCHIVE SEARCH // "${urlQuery.toUpperCase()}"`
              : activeGenreId === "top_rated" || urlSort === "rating"
              ? "CANONICAL SELECTIONS // ALL-TIME BEST"
              : activeGenreId && activeGenreId !== "popular"
              ? `CINEMA ARCHIVE // ${CINEMA_GENRES.find((g) => String(g.id) === String(activeGenreId))?.label.toUpperCase() || "SELECTIONS"}`
              : "CINÉMATHÈQUE // FILM ARCHIVE"}
          </h1>
          <span className="search-count-label font-mono">
            {movieList.length > 0 ? `${movieList.length} films loaded` : ""}
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
            placeholder="Search films by title, director, keyword..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          {inputQuery && (
            <button
              type="button"
              className="search-clear-btn font-mono"
              onClick={handleClearSearch}
            >
              CLEAR
            </button>
          )}
          <button type="submit" className="search-submit-btn font-headline">
            SEARCH
          </button>
        </form>

        {/* Curated Genre Filter Pills */}
        <div className="search-genres-row font-mono" role="tablist">
          {CINEMA_GENRES.map((genre) => {
            const isSelected = activeGenreId === String(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                className={`genre-filter-pill ${isSelected ? "active" : ""}`}
                onClick={() => handleGenreClick(genre)}
              >
                {genre.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================================
          LEVEL 2: VIEW CONTROLS & RESULTS BAR
          ====================================================================== */}
      <section className="search-controls-bar">
        <div className="controls-left font-mono">
          <span>SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown font-mono"
          >
            <option value="popularity_desc">Popularity</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="title_asc">Title (A–Z)</option>
            <option value="date_desc">Release Date</option>
          </select>
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

      {/* ======================================================================
          LEVEL 3: RESULTS AREA
          ====================================================================== */}
      {loading ? (
        <div className="search-loading font-mono">
          <span>Loading cinema catalogue...</span>
        </div>
      ) : error ? (
        <div className="search-error font-mono">
          <span>{error}</span>
        </div>
      ) : sortedMovies.length === 0 ? (
        <div className="search-empty-state">
          <h2 className="empty-title font-headline">No films found</h2>
          <p className="empty-desc">
            Try adjusting your search terms or exploring a different genre.
          </p>
          <button
            type="button"
            className="empty-reset-btn font-headline"
            onClick={handleClearSearch}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="uniform-poster-grid">
              {sortedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="film-list-rows-view">
              {sortedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  variant="row"
                  showSynopsis={true}
                />
              ))}
            </div>
          )}

          {/* Load More Action */}
          {currentPage < totalPages && (
            <div className="search-pagination-row">
              <button
                type="button"
                className="btn-load-more font-headline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading More..." : "Load More Films ↓"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
