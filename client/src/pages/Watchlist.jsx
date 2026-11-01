import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, updateWatchlistItem, removeFromWatchlist } from "../services/api";
import { getAnimeTitle } from "../utils/animeTitles";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "watching", label: "Watching" },
  { id: "completed", label: "Completed" },
  { id: "plan_to_watch", label: "Plan to Watch" },
  { id: "on_hold", label: "On Hold" },
  { id: "dropped", label: "Dropped" }
];

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWatchlist();
        if (isMounted) setItems(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load watchlist.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleIncrementEpisode(anime) {
    const nextCount = (anime.episodes_watched || 0) + 1;
    const maxEp = anime.episodes;
    if (maxEp && nextCount > maxEp) return;

    try {
      await updateWatchlistItem(anime.mal_id, { episodes_watched: nextCount });
      setItems((prev) =>
        prev.map((item) =>
          item.mal_id === anime.mal_id
            ? { ...item, episodes_watched: nextCount }
            : item
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update episode count.");
    }
  }

  async function handleRemove(malId) {
    if (!window.confirm("Remove this anime from your watchlist?")) return;
    try {
      await removeFromWatchlist(malId);
      setItems((prev) => prev.filter((item) => item.mal_id !== malId));
    } catch (err) {
      alert(err.message || "Failed to remove anime.");
    }
  }

  const sortedAndFilteredItems = useMemo(() => {
    const list = items.filter((item) => {
      if (activeTab === "all") return true;
      return item.status === activeTab;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "title_asc") {
        return getAnimeTitle(a).localeCompare(getAnimeTitle(b));
      }
      if (sortBy === "rating_desc") {
        return (Number(b.score) || 0) - (Number(a.score) || 0);
      }
      if (sortBy === "episodes_desc") {
        return (b.episodes_watched || 0) - (a.episodes_watched || 0);
      }
      // "recent" (default)
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
  }, [items, activeTab, sortBy]);

  const totalEpisodesWatched = items.reduce((acc, curr) => acc + (curr.episodes_watched || 0), 0);

  return (
    <main className="watchlist-page-container">
      {/* Watchlist Header */}
      <section className="watchlist-heading-panel">
        <div className="watchlist-title-row">
          <div>
            <h1 className="watchlist-heading font-condensed">MY WATCHLIST</h1>
            <p className="watchlist-subline font-mono">
              {items.length} titles saved • {totalEpisodesWatched} episodes watched
            </p>
          </div>

          {/* Sort Selector */}
          <div className="watchlist-sort-control font-headline">
            <label htmlFor="watchlist-sort-select">Sort:</label>
            <select
              id="watchlist-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="watchlist-select-element"
            >
              <option value="recent">Recently Updated</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="title_asc">Title (A–Z)</option>
              <option value="episodes_desc">Most Episodes Watched</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="watchlist-tabs-row font-headline">
          {STATUS_TABS.map((tab) => {
            const count = tab.id === "all" ? items.length : items.filter((i) => i.status === tab.id).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`watchlist-tab-pill ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="pill-counter font-mono">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Loading / Error States */}
      {loading && (
        <div className="watchlist-loading-box font-mono">
          <span>Loading your watchlist...</span>
        </div>
      )}

      {error && (
        <div className="watchlist-error-box font-mono">
          <span>{error}</span>
        </div>
      )}

      {/* Watchlist Grid */}
      {!loading && (
        <>
          {sortedAndFilteredItems.length > 0 ? (
            <div className="watchlist-cards-grid">
              {sortedAndFilteredItems.map((anime) => {
                const totalEp = anime.episodes || 0;
                const watchedEp = anime.episodes_watched || 0;
                const progressPct = totalEp > 0 ? Math.min(100, Math.round((watchedEp / totalEp) * 100)) : 0;

                return (
                  <article key={anime.mal_id} className="watchlist-entry-card">
                    {/* Poster */}
                    <div className="entry-poster-wrap">
                      {anime.poster ? (
                        <img
                          src={anime.poster}
                          alt={getAnimeTitle(anime)}
                          className="entry-poster-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="entry-no-poster font-mono">No Poster</div>
                      )}
                      {anime.score && (
                        <div className="entry-score-tag font-mono">
                          ★ {anime.score}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="entry-card-body">
                      <div className="entry-meta-line font-mono">
                        <span className="entry-status-badge">
                          {anime.status?.replace("_", " ")}
                        </span>
                        {anime.media_type && <span>{anime.media_type}</span>}
                      </div>

                      <h3 className="entry-title font-headline">
                        <Link to={`/anime/${anime.mal_id}`}>
                          {getAnimeTitle(anime)}
                        </Link>
                      </h3>

                      {/* Progress Area */}
                      <div className="entry-progress-deck">
                        <div className="progress-numbers font-mono">
                          <span>Episodes</span>
                          <span>
                            {watchedEp} / {totalEp || "?"} {totalEp > 0 && `(${progressPct}%)`}
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: totalEp > 0 ? `${progressPct}%` : watchedEp > 0 ? "50%" : "0%" }}
                          ></div>
                        </div>

                        <div className="progress-actions">
                          <button
                            type="button"
                            className="btn-add-episode font-headline"
                            onClick={() => handleIncrementEpisode(anime)}
                            disabled={Boolean(totalEp && watchedEp >= totalEp)}
                          >
                            +1 Episode
                          </button>
                          <Link
                            to={`/anime/${anime.mal_id}`}
                            className="entry-details-link font-headline"
                          >
                            Details →
                          </Link>
                        </div>
                      </div>

                      {/* Footer Remove Button */}
                      <div className="entry-card-footer">
                        <button
                          type="button"
                          className="btn-remove-entry"
                          onClick={() => handleRemove(anime.mal_id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            !error && (
              <div className="watchlist-empty-view">
                <h3 className="empty-title font-condensed">
                  {items.length === 0
                    ? "YOUR WATCHLIST IS EMPTY"
                    : `NO ANIME UNDER "${STATUS_TABS.find((t) => t.id === activeTab)?.label.toUpperCase()}"`}
                </h3>
                <p className="empty-desc">
                  Explore anime titles in the catalogue to start tracking episodes and ratings.
                </p>
                <Link to="/anime/explore" className="btn-primary-action font-headline">
                  Explore Anime →
                </Link>
              </div>
            )
          )}
        </>
      )}
    </main>
  );
}
