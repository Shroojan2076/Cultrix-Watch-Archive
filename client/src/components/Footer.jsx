import { Link } from "react-router-dom";

export default function Footer() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Distro Column */}
        <div className="footer-col-about">
          <div className="footer-brand">
            <span className="jp-brand-mark">月刊</span>
            <span className="footer-title font-display">GEKKAN ANIME</span>
          </div>
          <p className="footer-manifesto">
            An independent anime catalogue and personal tracker. Curated for those who appreciate
            storytelling depth, bold art direction, and hand-drawn animation craft.
          </p>
          <div className="footer-meta font-mono">
            <span>Powered by the MyAnimeList API</span>
          </div>
        </div>

        {/* Explore Links */}
        <div className="footer-col-links">
          <span className="footer-heading font-headline">Explore</span>
          <ul>
            <li>
              <Link to="/search">All Anime</Link>
            </li>
            <li>
              <Link to="/search?q=Cyberpunk">Cyberpunk</Link>
            </li>
            <li>
              <Link to="/search?q=Psychological">Psychological</Link>
            </li>
            <li>
              <Link to="/search?q=Mecha">Mecha</Link>
            </li>
            <li>
              <Link to="/search?q=Retro">80s & 90s Classics</Link>
            </li>
          </ul>
        </div>

        {/* Account / Archive Links */}
        <div className="footer-col-links">
          <span className="footer-heading font-headline">Navigation</span>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/search">Browse Catalogue</Link>
            </li>
            <li>
              <Link to="/watchlist">My Watchlist</Link>
            </li>
          </ul>

          <button
            type="button"
            className="footer-top-btn font-mono"
            onClick={scrollToTop}
          >
            ↑ Back to Top
          </button>
        </div>
      </div>

      <div className="footer-bottom font-mono">
        <span>© {new Date().getFullYear()} GEKKAN ANIME. All anime data & artwork via MyAnimeList.</span>
      </div>
    </footer>
  );
}
