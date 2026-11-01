import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import {
  getMovieDetails,
  addMovieToWatchlist,
  updateMovieWatchlistItem,
  removeMovieFromWatchlist
} from "../../services/api";

function formatRuntime(minutes) {
  if (!minutes) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function formatCurrency(amount) {
  if (!amount || amount <= 0) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

export default function MovieDetails() {
  const { tmdb_id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovieDetails(tmdb_id);
        if (isMounted) {
          setMovie(data);
          if (data.trailers && data.trailers.length > 0) {
            setSelectedTrailer(data.trailers[0]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load movie details.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [tmdb_id]);

  async function handleAddWatchlist() {
    if (!movie) return;
    try {
      setSaving(true);
      await addMovieToWatchlist({
        tmdb_id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        runtime: movie.runtime,
        status: "want_to_watch",
        score: null,
        overview: movie.overview,
        genres: movie.genres || [],
        vote_average: movie.vote_average
      });

      setMovie(prev => ({
        ...prev,
        in_watchlist: true,
        watchlist_status: "want_to_watch",
        user_score: null
      }));

      setActionMessage("Added to your Cinema Watchlist");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to add to watchlist.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus) {
    if (!movie) return;
    try {
      setSaving(true);
      await updateMovieWatchlistItem(movie.id, { status: newStatus });
      setMovie(prev => ({
        ...prev,
        watchlist_status: newStatus
      }));
      setActionMessage(`Marked as ${newStatus === "watched" ? "Watched" : "Want to Watch"}`);
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleScoreChange(newScore) {
    if (!movie) return;
    const scoreVal = newScore === "" ? null : Number(newScore);
    try {
      setSaving(true);
      await updateMovieWatchlistItem(movie.id, { score: scoreVal });
      setMovie(prev => ({
        ...prev,
        user_score: scoreVal
      }));
      setActionMessage("Rating saved");
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setError(err.message || "Failed to update rating.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveWatchlist() {
    if (!movie) return;
    if (!window.confirm(`Remove "${movie.title}" from your Cinema Watchlist?`)) return;
    try {
      setSaving(true);
      await removeMovieFromWatchlist(movie.id);
      setMovie(prev => ({
        ...prev,
        in_watchlist: false,
        watchlist_status: null,
        user_score: null
      }));
      setActionMessage("Removed from Cinema Watchlist");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to remove from watchlist.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="details-container">
        <div className="search-loading font-mono">
          <span>Loading cinema archive dossier...</span>
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="details-container">
        <div className="search-error font-mono">
          <span>{error || "Movie not found"}</span>
          <Link to="/cinema/explore" className="btn-spotlight-secondary font-headline" style={{ marginTop: "1rem" }}>
            Return to Cinema Explore
          </Link>
        </div>
      </main>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const runtimeFormatted = formatRuntime(movie.runtime);

  return (
    <main className="details-container movie-details-page">
      {/* ======================================================================
          NOTIFICATION TOAST
          ====================================================================== */}
      {actionMessage && (
        <div className="details-toast font-mono" role="status">
          ✓ {actionMessage}
        </div>
      )}

      {/* ======================================================================
          HERO BANNER & BACKDROP
          ====================================================================== */}
      <section className="details-hero">
        {backdropUrl && (
          <div className="details-hero-backdrop-wrap">
            <img
              src={backdropUrl}
              alt=""
              className="details-hero-backdrop-img"
              aria-hidden="true"
            />
            <div className="details-hero-backdrop-fade" />
          </div>
        )}

        <div className="details-hero-inner">
          {/* Poster Column */}
          <div className="details-poster-wrap">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                className="details-poster-img"
              />
            ) : (
              <div className="film-card-no-img font-mono" style={{ aspectRatio: "2/3" }}>
                <span>No Poster</span>
              </div>
            )}
            {movie.vote_average ? (
              <div className="details-poster-badge font-mono">
                ★ {Number(movie.vote_average).toFixed(1)}
              </div>
            ) : null}
          </div>

          {/* Details & Specs Column */}
          <div className="details-header-info">
            <div className="details-meta-pill-row font-mono">
              <span className="details-type-pill">FILM</span>
              {releaseYear && <span>{releaseYear}</span>}
              {runtimeFormatted && <span>{runtimeFormatted}</span>}
              {movie.original_language && (
                <span>{movie.original_language.toUpperCase()}</span>
              )}
              {movie.status && <span>{movie.status.toUpperCase()}</span>}
            </div>

            <h1 className="details-title font-display">{movie.title}</h1>

            {movie.original_title && movie.original_title !== movie.title && (
              <p className="movie-original-title font-mono">
                ORIGINAL: {movie.original_title}
              </p>
            )}

            {movie.tagline && (
              <p className="movie-tagline font-serif">
                "{movie.tagline}"
              </p>
            )}

            {movie.director && (
              <p className="movie-director-label font-mono">
                DIRECTED BY <strong className="movie-director-name font-headline">{movie.director.name}</strong>
              </p>
            )}

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="details-genres-list font-mono">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    to={`/cinema/explore?genre=${g.id}`}
                    className="details-genre-tag"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Watchlist Interaction Control Box */}
            <div className="movie-watchlist-box">
              {!movie.in_watchlist ? (
                <button
                  type="button"
                  className="btn-spotlight-primary font-headline"
                  onClick={handleAddWatchlist}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "+ Add to Cinema Watchlist"}
                </button>
              ) : (
                <div className="watchlist-active-panel">
                  <div className="watchlist-status-segmented font-mono">
                    <span className="watchlist-panel-label">WATCH STATUS:</span>
                    <button
                      type="button"
                      className={`status-segment-btn ${
                        movie.watchlist_status === "want_to_watch" ? "active" : ""
                      }`}
                      onClick={() => handleStatusChange("want_to_watch")}
                      disabled={saving}
                    >
                      Want to Watch
                    </button>
                    <button
                      type="button"
                      className={`status-segment-btn ${
                        movie.watchlist_status === "watched" ? "active" : ""
                      }`}
                      onClick={() => handleStatusChange("watched")}
                      disabled={saving}
                    >
                      Watched
                    </button>
                  </div>

                  <div className="watchlist-score-row font-mono">
                    <label htmlFor="movie-rating-select">YOUR RATING:</label>
                    <select
                      id="movie-rating-select"
                      className="watchlist-score-select font-mono"
                      value={movie.user_score || ""}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Rate (Unrated)</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          ★ {n}/10
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn-remove-watchlist font-mono"
                      onClick={handleRemoveWatchlist}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECTION 2: SYNOPSIS & TECHNICAL SPECIFICATIONS
          ====================================================================== */}
      <section className="details-body-layout movie-body-layout">
        <div className="details-body-main movie-body-main">
          {movie.overview && (
            <div className="details-synopsis-block movie-synopsis-block">
              <h2 className="movie-section-title font-display">Overview</h2>
              <p className="movie-synopsis-text">{movie.overview}</p>
            </div>
          )}

          {/* Official Trailer Section */}
          {movie.trailers && movie.trailers.length > 0 && (
            <div className="movie-trailers-section">
              <div className="section-header-row">
                <h2 className="movie-section-title font-display">
                  Trailer & Previews
                </h2>
                {movie.trailers.length > 1 && (
                  <div className="trailer-pills-row font-mono">
                    {movie.trailers.map((t, idx) => (
                      <button
                        key={t.id || idx}
                        type="button"
                        className={`trailer-tab ${
                          selectedTrailer?.key === t.key ? "active" : ""
                        }`}
                        onClick={() => setSelectedTrailer(t)}
                      >
                        {t.name.length > 25 ? `${t.name.slice(0, 25)}...` : t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTrailer && (
                <div className="trailer-video-embed-frame">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedTrailer.key}`}
                    title={selectedTrailer.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="trailer-iframe"
                  />
                </div>
              )}
            </div>
          )}

          {/* Top Billed Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="movie-cast-section">
              <h2 className="movie-section-title font-display">Top Billed Cast</h2>
              <div className="movie-cast-grid">
                {movie.cast.map((actor) => (
                  <div key={actor.id} className="movie-cast-card">
                    <div className="cast-photo-frame">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="cast-photo-placeholder font-mono">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="cast-meta">
                      <strong className="cast-name font-headline">{actor.name}</strong>
                      <span className="cast-character font-mono">{actor.character}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Technical Sidebar */}
        <aside className="details-sidebar movie-spec-sidebar font-mono">
          <div className="sidebar-spec-group">
            <h3 className="sidebar-group-title font-headline">Specifications</h3>

            <div className="spec-row">
              <span className="spec-label">Director:</span>
              <span className="spec-value">
                {movie.director ? movie.director.name : "N/A"}
              </span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Release Date:</span>
              <span className="spec-value">{movie.release_date || "N/A"}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Runtime:</span>
              <span className="spec-value">{runtimeFormatted || "N/A"}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Original Language:</span>
              <span className="spec-value">
                {movie.original_language ? movie.original_language.toUpperCase() : "N/A"}
              </span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Budget:</span>
              <span className="spec-value">{formatCurrency(movie.budget)}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Revenue:</span>
              <span className="spec-value">{formatCurrency(movie.revenue)}</span>
            </div>

            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="spec-row">
                <span className="spec-label">Studios:</span>
                <span className="spec-value">
                  {movie.production_companies.map((p) => p.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* ======================================================================
          SECTION 3: RECOMMENDATIONS / SIMILAR FILMS
          ====================================================================== */}
      {movie.recommendations && movie.recommendations.length > 0 && (
        <section className="section-block" style={{ marginTop: "4rem" }}>
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-eyebrow font-mono">RECOMMENDED</span>
              <h2 className="section-title font-headline">More Like This</h2>
            </div>
          </div>

          <div className="uniform-poster-grid">
            {movie.recommendations.slice(0, 5).map((rec) => (
              <MovieCard key={rec.id} movie={rec} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

