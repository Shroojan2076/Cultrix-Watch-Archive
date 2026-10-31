import { Link } from "react-router-dom";
import { getAnimeTitle } from "../utils/animeTitles";

export default function AnimeCard({
  anime,
  variant = "default",
  showSynopsis = false
}) {
  const data = anime?.node || anime;
  if (!data) return null;

  const resolvedTitle = getAnimeTitle(data);
  const posterUrl = data.main_picture?.large || data.main_picture?.medium || data.poster;
  const score = data.mean || data.score;
  const year = data.start_date ? data.start_date.slice(0, 4) : null;
  const mediaType = data.media_type ? data.media_type.toUpperCase() : "TV";
  const numEpisodes = data.num_episodes || data.episodes;
  const studioName = data.studios?.[0]?.name;

  // 1. List Row Variant (Used for Search List View)
  if (variant === "row") {
    return (
      <Link to={`/anime/${data.id || data.mal_id}`} className="anime-row-link">
        <article className="anime-row-card">
          <div className="anime-row-thumb">
            {posterUrl ? (
              <img src={posterUrl} alt={resolvedTitle} loading="lazy" />
            ) : (
              <div className="thumb-placeholder font-mono">No Image</div>
            )}
          </div>

          <div className="anime-row-content">
            <div className="anime-row-meta font-mono">
              <span className="anime-row-type">{mediaType}</span>
              {year && <span>• {year}</span>}
              {numEpisodes ? <span>• {numEpisodes} eps</span> : null}
              {studioName && <span>• {studioName}</span>}
            </div>

            <h3 className="anime-row-title font-headline">{resolvedTitle}</h3>

            {showSynopsis && data.synopsis && (
              <p className="anime-row-synopsis">
                {data.synopsis.slice(0, 160)}...
              </p>
            )}
          </div>

          <div className="anime-row-right">
            {score ? (
              <span className="anime-row-score font-mono">★ {Number(score).toFixed(1)}</span>
            ) : null}
            <span className="anime-row-arrow">→</span>
          </div>
        </article>
      </Link>
    );
  }

  // 2. Default Disciplined Poster Card (Strict 2:3 ratio, uniform height, aligned edges)
  return (
    <Link to={`/anime/${data.id || data.mal_id}`} className="anime-card-link">
      <article className="anime-card">
        {/* Strictly 2:3 poster frame */}
        <div className="anime-card-poster">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={resolvedTitle}
              className="anime-card-img"
              loading="lazy"
            />
          ) : (
            <div className="anime-card-no-img font-mono">
              <span>No Image</span>
            </div>
          )}

          {/* Clean Badges */}
          {score && (
            <div className="anime-score-badge font-mono">
              ★ {Number(score).toFixed(1)}
            </div>
          )}

          {mediaType && (
            <div className="anime-format-badge font-mono">
              {mediaType}
            </div>
          )}
        </div>

        {/* Disciplined Details: Aligned rows */}
        <div className="anime-card-details">
          <div className="anime-card-subline font-mono">
            <span>{mediaType}</span>
            {year && <span>• {year}</span>}
            {numEpisodes ? <span>• {numEpisodes} ep</span> : null}
          </div>

          <h3 className="anime-card-title font-headline" title={resolvedTitle}>
            {resolvedTitle}
          </h3>
        </div>
      </article>
    </Link>
  );
}
