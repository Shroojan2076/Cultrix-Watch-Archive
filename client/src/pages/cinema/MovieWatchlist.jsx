import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getMovieWatchlist,
  updateMovieWatchlistItem,
  removeMovieFromWatchlist
} from "../../services/api";

const ARCHIVE_STATUS_TABS = [
  { id: "all", label: "All Titles", code: "ALL" },
  { id: "want_to_watch", label: "Queued", code: "QUEUE" },
  { id: "watched", label: "Screened", code: "SCREENED" }
];

export default function MovieWatchlist() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWatchlist() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovieWatchlist();
        if (isMounted) setItems(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load cinema archive.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWatchlist();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleToggleStatus(item) {
    const nextStatus = item.status === "watched" ? "want_to_watch" : "watched";
    try {
      await updateMovieWatchlistItem(item.tmdb_id, { status: nextStatus });
      setItems((prev) =>
        prev.map((m) =>
          m.tmdb_id === item.tmdb_id ? { ...m, status: nextStatus } : m
        )
      );
      setActionMessage(
        nextStatus === "watched"
          ? `Marked "${item.title}" as Screened`
          : `Moved "${item.title}" to Watch Queue`
      );
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      alert(err.message || "Failed to update archival status.");
    }
  }

  async function handleUpdateScore(item, newScore) {
    const scoreVal = newScore === "" ? null : Number(newScore);
    try {
      await updateMovieWatchlistItem(item.tmdb_id, { score: scoreVal });
      setItems((prev) =>
        prev.map((m) =>
          m.tmdb_id === item.tmdb_id ? { ...m, score: scoreVal } : m
        )
      );
      setActionMessage(`Updated rating for "${item.title}"`);
      setTimeout(() => setActionMessage(null), 2000);
    } catch (err) {
      alert(err.message || "Failed to update rating.");
    }
  }

  async function handleRemove(tmdbId, title) {
    if (!window.confirm(`Remove "${title}" from your Cinema Archive?`)) return;
    try {
      await removeMovieFromWatchlist(tmdbId);
      setItems((prev) => prev.filter((m) => m.tmdb_id !== tmdbId));
      setActionMessage(`Removed "${title}" from archive`);
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      alert(err.message || "Failed to remove film.");
    }
  }

  const sortedAndFilteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (activeTab === "all") return true;
      return item.status === activeTab;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "score_desc") {
        return (Number(b.score) || 0) - (Number(a.score) || 0);
      }
      if (sortBy === "vote_desc") {
        return (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0);
      }
      if (sortBy === "release_desc") {
        return (b.release_date || "").localeCompare(a.release_date || "");
      }
      // "recent" (default)
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
  }, [items, activeTab, sortBy]);

  const watchedCount = items.filter((i) => i.status === "watched").length;
  const wantToWatchCount = items.filter((i) => i.status === "want_to_watch").length;

  return (
    <main className="film-archive-page">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="details-toast font-mono" role="status">
          ✓ {actionMessage}
        </div>
      )}

      {/* Archival Masthead & Ledger Bar */}
      <section className="film-archive-masthead">
        <div className="film-archive-heading-row">
          <div className="film-archive-brand-block">
            <span className="film-archive-eyebrow font-mono">
              CINÉMATHÈQUE // PERSONAL REGISTRY
            </span>
            <h1 className="film-archive-main-heading font-display">
              CINEMA WATCHLIST
            </h1>
            <p className="film-archive-subline font-mono">
              <span>{items.length} TITLES IN REGISTRY</span>
              <span className="bullet-sep">•</span>
              <span className="stat-screened">{watchedCount} SCREENED</span>
              <span className="bullet-sep">•</span>
              <span className="stat-queued">{wantToWatchCount} QUEUED</span>
            </p>
          </div>

          {/* Sort Controls */}
          <div className="film-archive-sort-control font-headline">
            <label htmlFor="film-archive-sort-select">Sort Ledger:</label>
            <select
              id="film-archive-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="film-archive-select-element font-mono"
            >
              <option value="recent">Recently Logged</option>
              <option value="score_desc">Your Rating (Highest)</option>
              <option value="vote_desc">TMDB Score (Highest)</option>
              <option value="title_asc">Title (A–Z)</option>
              <option value="release_desc">Release Date (Newest)</option>
            </select>
          </div>
        </div>

        {/* Ledger Filter Tabs */}
        <nav className="film-archive-tabs-ledger font-headline" aria-label="Archive Ledger Filter">
          {ARCHIVE_STATUS_TABS.map((tab) => {
            const count =
              tab.id === "all"
                ? items.length
                : items.filter((i) => i.status === tab.id).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`film-archive-ledger-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ledger-btn-label">{tab.label}</span>
                <span className="ledger-btn-code font-mono">[{count}]</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* Loading & Error States */}
      {loading && (
        <div className="watchlist-loading-box font-mono">
          <span>Loading personal cinema registry...</span>
        </div>
      )}

      {error && (
        <div className="watchlist-error-box font-mono">
          <span>{error}</span>
        </div>
      )}

      {/* Archival Ledger Grid */}
      {!loading && !error && (
        <>
          {sortedAndFilteredItems.length > 0 ? (
            <div className="film-archive-cards-grid">
              {sortedAndFilteredItems.map((movie) => {
                const backdropUrl = movie.backdrop_path
                  ? (movie.backdrop_path.startsWith("http")
                      ? movie.backdrop_path
                      : `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`)
                  : null;

                const posterUrl = movie.poster_path
                  ? (movie.poster_path.startsWith("http")
                      ? movie.poster_path
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
                  : null;

                const artworkUrl = backdropUrl || posterUrl;
                const releaseYear = movie.release_date
                  ? movie.release_date.slice(0, 4)
                  : null;

                const isWatched = movie.status === "watched";
                const isTv = movie.media_type === "tv";
                const linkUrl = `/cinema/${movie.tmdb_id}${isTv ? "?type=tv" : ""}`;

                const genreList = Array.isArray(movie.genres)
                  ? movie.genres
                      .map((g) => (typeof g === "string" ? g : g?.name))
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(" / ")
                  : null;

                return (
                  <article
                    key={movie.tmdb_id}
                    className={`film-archive-entry-card ${
                      isWatched ? "is-screened" : "is-queued"
                    }`}
                  >
                    {/* Widescreen Landscape Still Artwork Frame */}
                    <div className="film-archive-artwork-frame">
                      <Link
                        to={linkUrl}
                        className="film-archive-artwork-link"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {artworkUrl ? (
                          <img
                            src={artworkUrl}
                            alt={movie.title}
                            className="film-archive-artwork-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="film-archive-no-artwork font-mono">
                            No Still Available
                          </div>
                        )}
                        <div className="film-archive-artwork-vignette" />
                      </Link>

                      {/* Floating Status Stamp & TMDB Rating */}
                      <div className="film-archive-badge-strip">
                        <span
                          className={`film-archive-stamp-badge font-mono ${
                            isWatched ? "badge-screened" : "badge-queued"
                          }`}
                        >
                          {isWatched ? "● SCREENED" : "○ QUEUED"}
                        </span>

                        {movie.vote_average && (
                          <span className="film-archive-score-badge font-mono">
                            ★ {Number(movie.vote_average).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="film-archive-format-watermark font-mono">
                        {isTv ? "TV SERIES" : "35MM FILM"}
                      </div>
                    </div>

                    {/* Archival Dossier Body */}
                    <div className="film-archive-entry-body">
                      <div className="film-archive-meta-line font-mono">
                        <span className="film-archive-spec-type">{isTv ? "TV SERIES" : "CINEMA"}</span>
                        {releaseYear && <span>• {releaseYear}</span>}
                        {movie.runtime && <span>• {movie.runtime}m</span>}
                        {genreList && <span>• {genreList.toUpperCase()}</span>}
                      </div>

                      <h2 className="film-archive-entry-title font-display">
                        <Link to={linkUrl} title={movie.title}>
                          {movie.title}
                        </Link>
                      </h2>

                      {movie.overview && (
                        <p className="film-archive-overview font-body">
                          {movie.overview.length > 135
                            ? `${movie.overview.slice(0, 135)}...`
                            : movie.overview}
                        </p>
                      )}

                      {/* Controls Deck: Status Toggle, Rating & Navigation */}
                      <div className="film-archive-action-deck">
                        {/* Status Toggle Button */}
                        <div className="film-archive-toggle-block">
                          <button
                            type="button"
                            className={`btn-film-archive-status font-mono ${
                              isWatched ? "status-active-screened" : ""
                            }`}
                            onClick={() => handleToggleStatus(movie)}
                          >
                            {isWatched ? "✓ Screened" : "Mark as Watched"}
                          </button>
                        </div>

                        {/* Personal Score Dropdown */}
                        <div className="film-archive-user-score font-mono">
                          <label htmlFor={`archive-score-${movie.tmdb_id}`}>
                            Rating:
                          </label>
                          <select
                            id={`archive-score-${movie.tmdb_id}`}
                            value={movie.score || ""}
                            onChange={(e) =>
                              handleUpdateScore(movie, e.target.value)
                            }
                            className="film-archive-score-dropdown font-mono"
                          >
                            <option value="">Unrated</option>
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                ★ {n}/10
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Item Actions */}
                        <div className="film-archive-row-actions">
                          <Link
                            to={linkUrl}
                            className="film-archive-link-dossier font-headline"
                          >
                            Dossier →
                          </Link>
                          <button
                            type="button"
                            className="btn-film-archive-remove font-mono"
                            onClick={() => handleRemove(movie.tmdb_id, movie.title)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="film-archive-empty-state">
              <h2 className="empty-title font-display">
                Your Cinema Archive Is Empty
              </h2>
              <p className="empty-desc font-body">
                {activeTab !== "all"
                  ? `No films currently recorded under "${
                      ARCHIVE_STATUS_TABS.find((t) => t.id === activeTab)?.label ||
                      activeTab
                    }".`
                  : "Curate your personal cinematheque registry. Track films to experience or archive your screened cinema."}
              </p>
              <Link
                to="/cinema/explore"
                className="btn-film-archive-explore font-headline"
              >
                Explore Cinema Index →
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
