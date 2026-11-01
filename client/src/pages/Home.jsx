import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import { searchAnime, getAnimeRanking } from "../services/api";
import { getAnimeTitle } from "../utils/animeTitles";

const THEMES = [
  { title: "Cyberpunk", query: "Cyberpunk" },
  { title: "Psychological", query: "Psychological" },
  { title: "Retro Classics", query: "Retro" },
  { title: "Mecha", query: "Mecha" },
  { title: "Sci-Fi", query: "Sci-Fi" },
  { title: "Action", query: "Action" },
  { title: "Dark Fantasy", query: "Fantasy" },
  { title: "Seinen", query: "Seinen" }
];

export default function Home() {
  const [featuredAnime, setFeaturedAnime] = useState(null);
  const [popularList, setPopularList] = useState([]);
  const [themeList, setThemeList] = useState([]);
  const [activeTheme, setActiveTheme] = useState("Cyberpunk");
  const [loading, setLoading] = useState(true);
  const [themeLoading, setThemeLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch real ranking data & initial theme spotlight
        const [popularRes, topRes, themeRes] = await Promise.allSettled([
          getAnimeRanking("bypopularity", 10),
          getAnimeRanking("all", 10),
          searchAnime("Cyberpunk")
        ]);

        if (!isMounted) return;

        const popularData = popularRes.status === "fulfilled" ? popularRes.value.data || [] : [];
        const topData = topRes.status === "fulfilled" ? topRes.value.data || [] : [];
        const themeData = themeRes.status === "fulfilled" ? themeRes.value.data || [] : [];

        // Global deduplication to ensure zero repeated titles
        const seenIds = new Set();

        function takeUnique(list, count) {
          const results = [];
          for (const item of list) {
            const id = item?.node?.id;
            if (id && !seenIds.has(id)) {
              seenIds.add(id);
              results.push(item);
              if (results.length >= count) break;
            }
          }
          return results;
        }

        // 1. Featured Spotlight Anime (Hero)
        const heroPool = takeUnique(popularData, 1);
        if (heroPool.length > 0) {
          setFeaturedAnime(heroPool[0]?.node || null);
        }

        // 2. Popular Collection (5 or 10 Disciplined Cards)
        const popPool = takeUnique(topData.length ? topData : popularData, 5);
        setPopularList(popPool);

        // 3. Thematic Spotlight Collection (5 Disciplined Cards)
        const themePool = takeUnique(themeData, 5);
        setThemeList(themePool);

        if (!heroPool.length && !popPool.length && !themePool.length) {
          setError("Could not load anime catalogue. Please check your network connection.");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load catalogue.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleThemeSelect(theme) {
    if (theme.title === activeTheme || themeLoading) return;
    try {
      setActiveTheme(theme.title);
      setThemeLoading(true);
      const res = await searchAnime(theme.query);
      const results = (res.data || []).slice(0, 5);
      setThemeList(results);
    } catch {
      // Fallback silently if search fails
    } finally {
      setThemeLoading(false);
    }
  }

  return (
    <div className="v5-home-page">
      {/* ======================================================================
          SECTION 1: HERO SPOTLIGHT (FEATURED ANIME)
          Disciplined, immersive opening spread with prominent artwork and clear actions.
          ====================================================================== */}
      <section className="spotlight-section">
        {loading ? (
          <div className="section-loading font-mono">
            <span>Loading featured anime...</span>
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
        ) : featuredAnime ? (
          <div className="spotlight-hero-spread">
            {/* Prominent Poster Artwork */}
            <div className="spotlight-poster-frame">
              {featuredAnime.main_picture?.large || featuredAnime.main_picture?.medium ? (
                <img
                  src={featuredAnime.main_picture.large || featuredAnime.main_picture?.medium}
                  alt={getAnimeTitle(featuredAnime)}
                  className="spotlight-poster-img"
                />
              ) : (
                <div className="poster-empty font-mono">No Image</div>
              )}
              {featuredAnime.mean && (
                <div className="spotlight-rating-badge font-mono">
                  ★ {Number(featuredAnime.mean).toFixed(1)}
                </div>
              )}
            </div>

            {/* Content & Actions */}
            <div className="spotlight-details">
              <div className="spotlight-meta-tags font-mono">
                {featuredAnime.media_type && (
                  <span className="meta-pill">{featuredAnime.media_type}</span>
                )}
                {featuredAnime.start_date && (
                  <span>{featuredAnime.start_date.slice(0, 4)}</span>
                )}
                {featuredAnime.num_episodes && (
                  <span>• {featuredAnime.num_episodes} eps</span>
                )}
                {featuredAnime.studios?.[0]?.name && (
                  <span>• {featuredAnime.studios[0].name}</span>
                )}
              </div>

              <h1 className="spotlight-title font-condensed">
                {getAnimeTitle(featuredAnime)}
              </h1>

              {featuredAnime.synopsis && (
                <p className="spotlight-synopsis">
                  {featuredAnime.synopsis.slice(0, 220)}...
                </p>
              )}

              <div className="spotlight-actions">
                <Link
                  to={`/anime/${featuredAnime.id}`}
                  className="btn-primary-action font-headline"
                >
                  View Details →
                </Link>
                <Link
                  to="/anime/explore"
                  className="btn-secondary-action font-headline"
                >
                  Explore Catalogue
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* ======================================================================
          SECTION 2: POPULAR ANIME (DISCIPLINED POSTER GRID ON AGED PAPER)
          High-contrast editorial slab with 100% uniform 2:3 aspect ratio cards.
          ====================================================================== */}
      {popularList.length > 0 && (
        <section className="paper-section paper-slab">
          <div className="paper-section-inner">
            <div className="section-title-row">
              <h2 className="section-title-condensed font-condensed">POPULAR ANIME</h2>
              <Link to="/anime/explore?q=Popular" className="section-view-all font-headline">
                View All →
              </Link>
            </div>

            {/* Consistent, disciplined poster grid */}
            <div className="uniform-poster-grid">
              {popularList.map((anime) => (
                <AnimeCard
                  key={anime.node.id}
                  anime={anime}
                  variant="default"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================
          SECTION 3: DISCOVERY BY THEME
          Restrained genre/theme navigation with a clean 5-poster spotlight row.
          ====================================================================== */}
      <section className="theme-discovery-section">
        <div className="theme-discovery-inner">
          <div className="section-title-row">
            <div>
              <h2 className="section-title-condensed font-condensed">BROWSE BY THEME</h2>
              <p className="section-desc font-mono">Curated gateways into distinct anime subcultures.</p>
            </div>
            <button
              type="button"
              className="section-view-all font-headline btn-link"
              onClick={() => navigate(`/search?q=${encodeURIComponent(activeTheme)}`)}
            >
              Explore {activeTheme} →
            </button>
          </div>

          {/* Simple, restrained theme pills */}
          <div className="theme-tabs-row font-headline">
            {THEMES.map((t) => {
              const isActive = t.title === activeTheme;
              return (
                <button
                  key={t.title}
                  type="button"
                  className={`theme-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleThemeSelect(t)}
                >
                  <span>{t.title}</span>
                  {isActive && <span className="theme-tab-indicator">•</span>}
                </button>
              );
            })}
          </div>

          {/* Spotlight collection for active theme */}
          {themeLoading ? (
            <div className="section-loading font-mono">
              <span>Loading {activeTheme} anime...</span>
            </div>
          ) : (
            <div className="uniform-poster-grid">
              {themeList.map((anime) => (
                <AnimeCard
                  key={anime.node.id}
                  anime={anime}
                  variant="default"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================================
          SECTION 4: ABOUT BRAND NOTE
          Clean, honest community statement.
          ====================================================================== */}
      <section className="about-footer-strip">
        <div className="about-strip-content">
          <div className="about-brand-tag">
            <span className="jp-brand-mark">月刊</span>
            <span className="font-condensed about-brand-title">YŪGEN INDEX</span>
          </div>
          <p className="about-tagline">
            An independent anime catalogue and personal watchlist. Built for enthusiasts who care about
            storytelling depth, art direction, and hand-drawn animation craft. Powered by MyAnimeList.
          </p>
        </div>
      </section>
    </div>
  );
}
