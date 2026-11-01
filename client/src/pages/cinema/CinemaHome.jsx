import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import {
  getCinemaTrending,
  getCinemaTopRated,
  discoverMoviesByGenre
} from "../../services/api";

const CURATED_GENRES = [
  { id: 878, name: "Sci-Fi" },
  { id: 28, name: "Action" },
  { id: 53, name: "Thriller" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 80, name: "Crime" },
  { id: 16, name: "Animation" }
];

export default function CinemaHome() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState(CURATED_GENRES[0]);
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCinemaData() {
      try {
        setLoading(true);
        setError(null);

        const [trendingRes, topRatedRes, initialGenreRes] = await Promise.allSettled([
          getCinemaTrending("week", 1),
          getCinemaTopRated(1),
          discoverMoviesByGenre(CURATED_GENRES[0].id, 1)
        ]);

        if (!isMounted) return;

        const trendingList = trendingRes.status === "fulfilled" ? trendingRes.value.results || [] : [];
        const topRatedList = topRatedRes.status === "fulfilled" ? topRatedRes.value.results || [] : [];
        const genreList = initialGenreRes.status === "fulfilled" ? initialGenreRes.value.results || [] : [];

        // Pick hero movie with high vote and backdrop
        const candidateHero = trendingList.find(m => m.backdrop_path && m.overview) || trendingList[0];
        setHeroMovie(candidateHero || null);

        // Deduplicate movies from hero
        const filteredTrending = trendingList
          .filter(m => !candidateHero || m.id !== candidateHero.id)
          .slice(0, 6);
        setTrendingMovies(filteredTrending);

        const filteredTopRated = topRatedList
          .filter(m => !candidateHero || m.id !== candidateHero.id)
          .slice(0, 5);
        setTopRatedMovies(filteredTopRated);

        setGenreMovies(genreList.slice(0, 5));

        if (!trendingList.length && !topRatedList.length) {
          setError("Could not load cinema catalogue. Please verify backend connection.");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load cinema catalogue.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCinemaData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGenreSelect(genre) {
    if (genre.id === activeGenre.id || genreLoading) return;
    try {
      setActiveGenre(genre);
      setGenreLoading(true);
      const res = await discoverMoviesByGenre(genre.id, 1);
      setGenreMovies((res.results || []).slice(0, 5));
    } catch {
      // Keep existing list on failure
    } finally {
      setGenreLoading(false);
    }
  }

  return (
    <div className="v5-home-page cinema-home">
      {/* ======================================================================
          SECTION 1: CINEMA HERO SPOTLIGHT
          Widescreen backdrop + high-contrast typography and specs
          ====================================================================== */}
      <section className="spotlight-section">
        {loading ? (
          <div className="section-loading font-mono">
            <span>Loading cinema spotlight...</span>
          </div>
        ) : error ? (
          <div className="section-error font-mono">
            <span>{error}</span>
            <button
              type="button"
              className="btn-retry font-headline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : heroMovie ? (
          <div className="cinema-hero-spread">
            {/* Backdrop Artwork with Dark Gradient Mask */}
            <div className="cinema-hero-backdrop-container">
              {heroMovie.backdrop_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w1280${heroMovie.backdrop_path}`}
                  alt={heroMovie.title}
                  className="cinema-hero-backdrop-img"
                />
              ) : (
                <div className="cinema-hero-fallback-bg" />
              )}
              <div className="cinema-hero-overlay" />
            </div>

            {/* Hero Foreground Content */}
            <div className="cinema-hero-content-wrap">
              <div className="spotlight-poster-frame">
                {heroMovie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${heroMovie.poster_path}`}
                    alt={heroMovie.title}
                    className="spotlight-poster-img"
                  />
                ) : (
                  <div className="poster-empty font-mono">No Poster</div>
                )}
                {heroMovie.vote_average && (
                  <div className="spotlight-rating-badge font-mono">
                    ★ {Number(heroMovie.vote_average).toFixed(1)}
                  </div>
                )}
              </div>

              <div className="spotlight-info-column">
                <div className="spotlight-meta-row font-mono">
                  <span className="spotlight-badge-primary">FEATURED FILM</span>
                  {heroMovie.release_date && (
                    <span className="spotlight-meta-item">
                      {heroMovie.release_date.slice(0, 4)}
                    </span>
                  )}
                  {heroMovie.original_language && (
                    <span className="spotlight-meta-item">
                      {heroMovie.original_language.toUpperCase()}
                    </span>
                  )}
                  {heroMovie.vote_count && (
                    <span className="spotlight-meta-item">
                      {heroMovie.vote_count.toLocaleString()} VOTES
                    </span>
                  )}
                </div>

                <h1 className="spotlight-title font-display">
                  {heroMovie.title}
                </h1>

                {heroMovie.original_title && heroMovie.original_title !== heroMovie.title && (
                  <p className="cinema-hero-sub font-mono">
                    ORIGINAL: {heroMovie.original_title}
                  </p>
                )}

                {heroMovie.overview && (
                  <p className="spotlight-synopsis">
                    {heroMovie.overview.length > 260
                      ? `${heroMovie.overview.slice(0, 260)}...`
                      : heroMovie.overview}
                  </p>
                )}

                <div className="spotlight-action-row">
                  <Link
                    to={`/cinema/${heroMovie.id}`}
                    className="btn-spotlight-primary font-headline"
                  >
                    View Details →
                  </Link>
                  <Link
                    to="/cinema/explore"
                    className="btn-spotlight-secondary font-headline"
                  >
                    Explore Cinema
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* ======================================================================
          SECTION 2: TRENDING THIS WEEK
          Uniform 5-column poster grid
          ====================================================================== */}
      <section className="section-block">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <span className="section-eyebrow font-mono">01 // BOX OFFICE & STREAMING</span>
            <h2 className="section-title font-headline">Trending Films</h2>
          </div>
          <Link to="/cinema/explore" className="section-view-all font-mono">
            View All Films →
          </Link>
        </div>

        {loading ? (
          <div className="section-loading font-mono">
            <span>Loading trending films...</span>
          </div>
        ) : (
          <div className="cinema-landscape-grid">
            {trendingMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} variant="landscape" showSynopsis={true} />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================================
          SECTION 3: CRITICALLY ACCLAIMED / HIGH CONTRAST PAPER SECTION
          Editorial section celebrating cinema masterworks
          ====================================================================== */}
      <section className="paper-contrast-section">
        <div className="paper-inner-wrap">
          <div className="section-header-row paper-header">
            <div className="section-title-wrap">
              <span className="paper-eyebrow font-mono">02 // CANONICAL SELECTIONS</span>
              <h2 className="paper-title font-headline">Top Rated Cinema</h2>
            </div>
            <Link to="/cinema/explore?genre=top_rated" className="paper-view-all font-mono">
              Browse All-Time Best →
            </Link>
          </div>

          {loading ? (
            <div className="section-loading font-mono paper-loading">
              <span>Loading top rated masterworks...</span>
            </div>
          ) : (
            <div className="uniform-poster-grid">
              {topRatedMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================================
          SECTION 4: CURATED GENRE SPOTLIGHT
          Interactive genre pills with instant spotlight grid
          ====================================================================== */}
      <section className="section-block">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <span className="section-eyebrow font-mono">03 // GENRE ARCHIVE</span>
            <h2 className="section-title font-headline">Explore by Genre</h2>
          </div>
        </div>

        {/* Genre Selector Pills */}
        <div className="theme-pills-bar font-mono" role="tablist">
          {CURATED_GENRES.map(genre => (
            <button
              key={genre.id}
              type="button"
              role="tab"
              aria-selected={activeGenre.id === genre.id}
              className={`theme-pill ${activeGenre.id === genre.id ? "active" : ""}`}
              onClick={() => handleGenreSelect(genre)}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Genre Movies Grid */}
        {genreLoading ? (
          <div className="section-loading font-mono">
            <span>Loading {activeGenre.name} selections...</span>
          </div>
        ) : (
          <div className="uniform-poster-grid">
            {genreMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
