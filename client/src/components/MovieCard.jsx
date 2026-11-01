import { Link } from "react-router-dom";

export default function MovieCard({
  movie,
  variant = "default",
  showSynopsis = false
}) {
  if (!movie) return null;

  const title = movie.title || movie.original_title || "Untitled";
  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : null;
  const backdropUrl = movie.backdrop_path
    ? (movie.backdrop_path.startsWith("http")
        ? movie.backdrop_path
        : `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`)
    : null;
  const score = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const tmdbId = movie.id || movie.tmdb_id;

  // 1. Landscape 16:9 Widescreen Film Still Card (Cinematic Specialization)
  if (variant === "landscape") {
    const imageUrl = backdropUrl || posterUrl;
    return (
      <Link to={`/cinema/${tmdbId}`} className="movie-landscape-card-link">
        <article className="movie-landscape-card">
          <div className="movie-landscape-frame">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="movie-landscape-img"
                loading="lazy"
              />
            ) : (
              <div className="movie-landscape-placeholder font-mono">
                No Still Available
              </div>
            )}
            <div className="movie-landscape-vignette" />

            {score && (
              <div className="movie-landscape-score font-mono">
                ★ {score}
              </div>
            )}

            <div className="movie-landscape-format font-mono">
              35MM
            </div>
          </div>

          <div className="movie-landscape-details">
            <div className="movie-landscape-meta font-mono">
              <span>FILM</span>
              {year && <span>• {year}</span>}
              {movie.original_language && (
                <span>• {movie.original_language.toUpperCase()}</span>
              )}
            </div>

            <h3 className="movie-landscape-title font-display" title={title}>
              {title}
            </h3>

            {showSynopsis && movie.overview && (
              <p className="movie-landscape-synopsis">
                {movie.overview.slice(0, 110)}...
              </p>
            )}
          </div>
        </article>
      </Link>
    );
  }

  // 2. List Row Variant (Used for Search/Explore List View)
  if (variant === "row") {
    return (
      <Link to={`/cinema/${tmdbId}`} className="film-row-link">
        <article className="film-row-card">
          <div className="film-row-thumb">
            {posterUrl ? (
              <img src={posterUrl} alt={title} loading="lazy" />
            ) : (
              <div className="film-thumb-placeholder font-mono">No Poster</div>
            )}
          </div>

          <div className="film-row-content">
            <div className="film-row-meta font-mono">
              <span className="film-row-type">FILM</span>
              {year && <span>• {year}</span>}
              {movie.runtime && <span>• {movie.runtime} min</span>}
              {movie.original_language && (
                <span>• {movie.original_language.toUpperCase()}</span>
              )}
            </div>

            <h3 className="film-row-title font-headline">{title}</h3>

            {showSynopsis && movie.overview && (
              <p className="film-row-synopsis">
                {movie.overview.slice(0, 160)}...
              </p>
            )}
          </div>

          <div className="film-row-right">
            {score && (
              <span className="film-row-score font-mono">★ {score}</span>
            )}
            <span className="film-row-arrow">→</span>
          </div>
        </article>
      </Link>
    );
  }

  // 3. Default Disciplined Film Poster Card (Strict 2:3 ratio)
  return (
    <Link to={`/cinema/${tmdbId}`} className="film-card-link">
      <article className="film-card">
        {/* Strictly 2:3 poster frame */}
        <div className="film-card-poster">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="film-card-img"
              loading="lazy"
            />
          ) : (
            <div className="film-card-no-img font-mono">
              <span>No Poster</span>
            </div>
          )}

          {/* Clean Badges */}
          {score && (
            <div className="film-score-badge font-mono">
              ★ {score}
            </div>
          )}

          <div className="film-format-badge font-mono">
            FILM
          </div>
        </div>

        {/* Disciplined Details: Aligned rows */}
        <div className="film-card-details">
          <div className="film-card-subline font-mono">
            <span>FILM</span>
            {year && <span>• {year}</span>}
          </div>

          <h3 className="film-card-title font-headline" title={title}>
            {title}
          </h3>
        </div>
      </article>
    </Link>
  );
}
