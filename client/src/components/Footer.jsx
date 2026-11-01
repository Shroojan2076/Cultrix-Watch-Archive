import { Link } from "react-router-dom";
import { useMode } from "../context/useMode";

export default function Footer() {
  const { switchMode, isCinema } = useMode();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Distro Column */}
        <div className="footer-col-about">
          <div className="footer-brand">
            <span className="jp-brand-mark">{isCinema ? "キネマ" : "月刊"}</span>
            <span className="footer-title font-display">YŪGEN INDEX</span>
          </div>
          <p className="footer-manifesto">
            An independent dual-medium catalogue and discovery archive. Dedicated to lovers of Japanese animation craft and boundary-pushing cinema worldwide.
          </p>
          <div className="footer-meta font-mono">
            <span>Anime data via MyAnimeList • Cinema data via TMDB</span>
          </div>
        </div>

        {/* Medium Portals */}
        <div className="footer-col-links">
          <span className="footer-heading font-headline">Medium Portals</span>
          <ul>
            <li>
              <Link to="/anime" onClick={() => switchMode("anime")}>
                ✦ Anime Archive
              </Link>
            </li>
            <li>
              <Link to="/anime/explore" onClick={() => switchMode("anime")}>
                Anime Catalogue
              </Link>
            </li>
            <li>
              <Link to="/anime/watchlist" onClick={() => switchMode("anime")}>
                Anime Watchlist
              </Link>
            </li>
            <li className="footer-divider-li"></li>
            <li>
              <Link to="/cinema" onClick={() => switchMode("cinema")}>
                🎬 Cinema Archive
              </Link>
            </li>
            <li>
              <Link to="/cinema/explore" onClick={() => switchMode("cinema")}>
                Cinema Catalogue
              </Link>
            </li>
            <li>
              <Link to="/cinema/watchlist" onClick={() => switchMode("cinema")}>
                Cinema Watchlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links & Back to Top */}
        <div className="footer-col-links">
          <span className="footer-heading font-headline">Curated Cinema</span>
          <ul>
            <li>
              <Link to="/cinema/explore?genre=878" onClick={() => switchMode("cinema")}>
                Sci-Fi
              </Link>
            </li>
            <li>
              <Link to="/cinema/explore?genre=28" onClick={() => switchMode("cinema")}>
                Action
              </Link>
            </li>
            <li>
              <Link to="/cinema/explore?genre=53" onClick={() => switchMode("cinema")}>
                Thriller
              </Link>
            </li>
            <li>
              <Link to="/cinema/explore?genre=18" onClick={() => switchMode("cinema")}>
                Drama
              </Link>
            </li>
            <li>
              <Link to="/cinema/explore?genre=27" onClick={() => switchMode("cinema")}>
                Horror
              </Link>
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
        <span>© {new Date().getFullYear()} YŪGEN INDEX // 幽玄索引. Dual-Medium Anime & Cinema Platform.</span>
      </div>
    </footer>
  );
}
