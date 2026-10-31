import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAnimeDetails,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist
} from "../services/api";
import { getAnimeTitle, getAnimeJapaneseTitle } from "../utils/animeTitles";

const STATUS_OPTIONS = [
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" }
];

function formatStatus(status) {
  if (!status) return null;
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSeason(seasonObj) {
  if (!seasonObj || !seasonObj.season) return null;
  const s = seasonObj.season.charAt(0).toUpperCase() + seasonObj.season.slice(1);
  return `${s} ${seasonObj.year || ""}`.trim();
}

export default function AnimeDetails() {
  const { mal_id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnimeDetails(mal_id);
        if (isMounted) {
          setAnime(data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load anime details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [mal_id]);

  // Local state for episode input to prevent unnecessary requests on every keystroke
  const serverEpisodes = anime?.episodes_watched ?? 0;
  const [prevServerEpisodes, setPrevServerEpisodes] = useState(serverEpisodes);
  const [localEpisodes, setLocalEpisodes] = useState(serverEpisodes);

  if (serverEpisodes !== prevServerEpisodes) {
    setPrevServerEpisodes(serverEpisodes);
    setLocalEpisodes(serverEpisodes);
  }

  const resolvedEnglishTitle = getAnimeTitle(anime);
  const japaneseTitle = getAnimeJapaneseTitle(anime);

  async function handleAddToWatchlist() {
    if (!anime) return;
    try {
      setSaving(true);
      await addToWatchlist({
        mal_id: anime.id,
        title: resolvedEnglishTitle, // Store the resolved English title!
        poster: anime.main_picture?.large || anime.main_picture?.medium,
        media_type: anime.media_type,
        synopsis: anime.synopsis,
        episodes: anime.num_episodes,
        status: "plan_to_watch",
        start_date: anime.start_date,
        end_date: anime.end_date
      });

      setAnime((prev) => ({
        ...prev,
        in_watchlist: true,
        watchlist_status: "plan_to_watch",
        episodes_watched: 0
      }));
      setLocalEpisodes(0);

      setActionMessage("Added to your Watchlist");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Could not add to watchlist.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus) {
    if (!anime) return;
    try {
      setSaving(true);
      await updateWatchlistItem(anime.id, { status: newStatus });
      setAnime((prev) => ({
        ...prev,
        watchlist_status: newStatus
      }));
      setActionMessage("Watch status updated");
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEpisodeCount(targetCount) {
    if (!anime) return;
    const maxEp = anime.num_episodes || 9999;
    const clamped = Math.max(0, Math.min(targetCount, maxEp));

    try {
      setSaving(true);
      await updateWatchlistItem(anime.id, { episodes_watched: clamped });
      setAnime((prev) => ({
        ...prev,
        episodes_watched: clamped
      }));
      setLocalEpisodes(clamped);
    } catch (err) {
      setError(err.message || "Failed to update episodes.");
      // Rollback local state
      setLocalEpisodes(anime.episodes_watched || 0);
    } finally {
      setSaving(false);
    }
  }

  function handleEpisodeStep(delta) {
    const current = anime?.episodes_watched || 0;
    const next = current + delta;
    if (next < 0) return;
    if (anime?.num_episodes && next > anime.num_episodes) return;
    saveEpisodeCount(next);
  }

  function handleEpisodeInputBlur() {
    const parsed = parseInt(localEpisodes, 10);
    const count = isNaN(parsed) ? (anime?.episodes_watched || 0) : parsed;
    if (count !== (anime?.episodes_watched || 0)) {
      saveEpisodeCount(count);
    } else {
      setLocalEpisodes(count);
    }
  }

  function handleEpisodeKeyDown(e) {
    if (e.key === "Enter") {
      e.target.blur();
    }
  }

  async function handleScoreChange(scoreVal) {
    if (!anime) return;
    const score = scoreVal === "" ? null : Number(scoreVal);
    try {
      setSaving(true);
      await updateWatchlistItem(anime.id, { score });
      setAnime((prev) => ({
        ...prev,
        user_score: score
      }));
      setActionMessage("Rating saved");
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setError(err.message || "Failed to update score.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!anime) return;
    if (!window.confirm(`Remove "${resolvedEnglishTitle}" from your watchlist?`)) return;
    try {
      setSaving(true);
      await removeFromWatchlist(anime.id);
      setAnime((prev) => ({
        ...prev,
        in_watchlist: false,
        watchlist_status: null,
        episodes_watched: 0,
        user_score: null
      }));
      setLocalEpisodes(0);
      setActionMessage("Removed from watchlist");
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setError(err.message || "Failed to remove from watchlist.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="details-page-view">
        <div className="details-loading font-mono">
          <span>Loading anime details...</span>
        </div>
      </main>
    );
  }

  if (error && !anime) {
    return (
      <main className="details-page-view">
        <div className="details-back-bar">
          <Link to="/search" className="back-nav-link font-headline">
            ← Back to Explore
          </Link>
        </div>
        <div className="details-error-box font-mono">
          <span>{error || "Anime not found in catalogue."}</span>
        </div>
      </main>
    );
  }

  const posterImg = anime.main_picture?.large || anime.main_picture?.medium;
  const mediaType = anime.media_type ? anime.media_type.toUpperCase() : null;
  const releaseYear = anime.start_date
    ? anime.start_date.slice(0, 4)
    : anime.start_season?.year || null;
  const statusDisplay = formatStatus(anime.status);
  const seasonDisplay = formatSeason(anime.start_season);
  const studioNames = anime.studios?.map((s) => s.name).join(", ");
  const sourceMaterial = anime.source ? formatStatus(anime.source) : null;

  return (
    <main className="details-page-view">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="toast-notification font-headline">
          <span>✓ {actionMessage}</span>
        </div>
      )}

      {/* Top Back Navigation */}
      <div className="details-back-bar">
        <Link to="/search" className="back-nav-link font-headline">
          ← Back to Explore
        </Link>
      </div>

      {/* ======================================================================
          SECTION A: ANIME IDENTITY & HERO
          Clean two-column composition: artwork anchor on left, English title,
          Japanese title underneath, and key metadata on right.
          ====================================================================== */}
      <section className="details-hero-section">
        {/* Left Column: Artwork & Score */}
        <div className="details-art-column">
          <div className="details-poster-frame">
            {posterImg ? (
              <img
                src={posterImg}
                alt={resolvedEnglishTitle}
                className="details-img"
              />
            ) : (
              <div className="details-empty-poster font-mono">No Artwork</div>
            )}

            {/* Score Strip */}
            {anime.mean && (
              <div className="details-score-badge font-mono">
                <span className="star-icon">★</span>
                <span className="score-val">{Number(anime.mean).toFixed(2)}</span>
                <span className="score-total">/ 10</span>
              </div>
            )}
          </div>

          {/* Optional Rank / Popularity below artwork */}
          {(anime.rank || anime.popularity) && (
            <div className="details-rank-pills font-mono">
              {anime.rank ? <span>Rank #{anime.rank}</span> : null}
              {anime.popularity ? <span>Popularity #{anime.popularity}</span> : null}
            </div>
          )}
        </div>

        {/* Right Column: Title, Metadata, Summary */}
        <div className="details-identity-column">
          {/* Subtle Top Metadata Line */}
          <div className="details-meta-line font-mono">
            {mediaType && <span className="meta-type-tag">{mediaType}</span>}
            {releaseYear && <span>{releaseYear}</span>}
            {anime.num_episodes && <span>• {anime.num_episodes} eps</span>}
            {statusDisplay && <span>• {statusDisplay}</span>}
          </div>

          {/* Primary English Heading */}
          <h1 className="details-primary-title font-condensed">
            {resolvedEnglishTitle}
          </h1>

          {/* Japanese Subtitle (only if provided) */}
          {japaneseTitle && (
            <h2 className="details-japanese-title font-jp">
              {japaneseTitle}
            </h2>
          )}

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="details-genres-row font-headline">
              {anime.genres.map((g) => (
                <Link
                  key={g.id || g.name}
                  to={`/search?q=${encodeURIComponent(g.name)}`}
                  className="genre-tag-link"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          {/* Concise Metadata Summary */}
          <div className="details-summary-strip font-mono">
            {studioNames && (
              <div className="summary-item">
                <span className="summary-label">Studio:</span>
                <strong className="summary-val font-headline">{studioNames}</strong>
              </div>
            )}
            {seasonDisplay && (
              <div className="summary-item">
                <span className="summary-label">Season:</span>
                <span className="summary-val">{seasonDisplay}</span>
              </div>
            )}
            {sourceMaterial && (
              <div className="summary-item">
                <span className="summary-label">Source:</span>
                <span className="summary-val">{sourceMaterial}</span>
              </div>
            )}
          </div>

          {/* ======================================================================
              SECTION B: WATCHLIST INTERACTION
              Grouped, practical controls; saves without triggering excess requests.
              ====================================================================== */}
          <div className="details-watchlist-section">
            {!anime.in_watchlist ? (
              <div className="watchlist-cta-box">
                <button
                  type="button"
                  className="btn-add-watchlist-action font-headline"
                  onClick={handleAddToWatchlist}
                  disabled={saving}
                >
                  + Add to Watchlist
                </button>
                <span className="watchlist-cta-hint font-mono">
                  Save to track episode progress, rating, and status.
                </span>
              </div>
            ) : (
              <div className="watchlist-active-deck">
                <div className="watchlist-controls-row font-headline">
                  {/* Status Dropdown */}
                  <div className="deck-control-group">
                    <label htmlFor="details-status-select" className="deck-label font-mono">
                      Status:
                    </label>
                    <select
                      id="details-status-select"
                      value={anime.watchlist_status || "plan_to_watch"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={saving}
                      className="deck-select"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Episode Stepper & Input */}
                  <div className="deck-control-group">
                    <label htmlFor="details-episodes-input" className="deck-label font-mono">
                      Episodes:
                    </label>
                    <div className="deck-ep-box font-mono">
                      <button
                        type="button"
                        className="ep-step-btn minus"
                        onClick={() => handleEpisodeStep(-1)}
                        disabled={saving || (anime.episodes_watched || 0) <= 0}
                        aria-label="Decrease episode"
                      >
                        -
                      </button>
                      <input
                        id="details-episodes-input"
                        type="number"
                        min="0"
                        max={anime.num_episodes || 9999}
                        value={localEpisodes}
                        onChange={(e) => setLocalEpisodes(e.target.value)}
                        onBlur={handleEpisodeInputBlur}
                        onKeyDown={handleEpisodeKeyDown}
                        disabled={saving}
                        className="deck-ep-input"
                      />
                      <span className="ep-total-label">
                        / {anime.num_episodes || "?"}
                      </span>
                      <button
                        type="button"
                        className="ep-step-btn plus"
                        onClick={() => handleEpisodeStep(1)}
                        disabled={
                          saving ||
                          Boolean(anime.num_episodes && (anime.episodes_watched || 0) >= anime.num_episodes)
                        }
                        aria-label="Increase episode"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  {/* User Rating */}
                  <div className="deck-control-group">
                    <label htmlFor="details-score-select" className="deck-label font-mono">
                      My Rating:
                    </label>
                    <select
                      id="details-score-select"
                      value={anime.user_score ?? ""}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      disabled={saving}
                      className="deck-select"
                    >
                      <option value="">No score</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                        <option key={s} value={s}>
                          ★ {s} / 10
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Remove Action */}
                  <button
                    type="button"
                    className="btn-remove-deck-action font-headline"
                    onClick={handleRemove}
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          LOWER CONTENT: SECTIONS C & D
          ====================================================================== */}
      <div className="details-body-grid">
        {/* ====================================================================
            SECTION C: SYNOPSIS
            Dedicated readable prose section with comfortable line length
            ==================================================================== */}
        <section className="details-synopsis-section">
          <h3 className="details-section-heading font-condensed">SYNOPSIS</h3>
          <div className="synopsis-prose font-body">
            {anime.synopsis ? (
              anime.synopsis
                .split("\n\n")
                .filter((p) => p.trim().length > 0)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))
            ) : (
              <p className="synopsis-empty font-mono">No synopsis available for this title.</p>
            )}
          </div>
        </section>

        {/* ====================================================================
            SECTION D: ANIME INFORMATION (SPECIFICATIONS)
            Clean, structured specification list; only displays supplied fields.
            ==================================================================== */}
        <section className="details-specs-section">
          <h3 className="details-section-heading font-condensed">ANIME INFORMATION</h3>
          <dl className="specs-list font-mono">
            {japaneseTitle && (
              <div className="specs-row">
                <dt className="specs-term">Japanese Title</dt>
                <dd className="specs-desc font-jp">{japaneseTitle}</dd>
              </div>
            )}

            {mediaType && (
              <div className="specs-row">
                <dt className="specs-term">Media Type</dt>
                <dd className="specs-desc">{mediaType}</dd>
              </div>
            )}

            {anime.num_episodes ? (
              <div className="specs-row">
                <dt className="specs-term">Episodes</dt>
                <dd className="specs-desc">{anime.num_episodes}</dd>
              </div>
            ) : null}

            {statusDisplay && (
              <div className="specs-row">
                <dt className="specs-term">Status</dt>
                <dd className="specs-desc">{statusDisplay}</dd>
              </div>
            )}

            {(anime.start_date || anime.end_date) && (
              <div className="specs-row">
                <dt className="specs-term">Airing Period</dt>
                <dd className="specs-desc">
                  {anime.start_date || "?"} to {anime.end_date || "Present"}
                </dd>
              </div>
            )}

            {seasonDisplay && (
              <div className="specs-row">
                <dt className="specs-term">Season</dt>
                <dd className="specs-desc">{seasonDisplay}</dd>
              </div>
            )}

            {studioNames && (
              <div className="specs-row">
                <dt className="specs-term">Studios</dt>
                <dd className="specs-desc font-headline">{studioNames}</dd>
              </div>
            )}

            {sourceMaterial && (
              <div className="specs-row">
                <dt className="specs-term">Source Material</dt>
                <dd className="specs-desc">{sourceMaterial}</dd>
              </div>
            )}

            {anime.genres && anime.genres.length > 0 && (
              <div className="specs-row">
                <dt className="specs-term">Genres</dt>
                <dd className="specs-desc">
                  {anime.genres.map((g) => g.name).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </main>
  );
}
