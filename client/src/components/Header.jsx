import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMode } from "../context/useMode";
import CultrixSymbol from "./CultrixSymbol";

export default function Header() {
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAnime, isCinema, switchMode, homePath, explorePath, watchlistPath } = useMode();

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) return;

    if (isCinema) {
      navigate(`/cinema/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/anime/explore?q=${encodeURIComponent(query.trim())}`);
    }
    setQuery("");
    setMobileMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="masthead-container">
        {/* Brand Link */}
        <div className="masthead-brand">
          <Link to={homePath} className="brand-link" onClick={() => setMobileMenuOpen(false)}>
            <CultrixSymbol size={26} className="brand-symbol" />
            <div className="brand-text">
              <span className="brand-title cultrix-wordmark">
                CULTRI<span className="cultrix-x">X</span>
              </span>
              <span className="brand-sub font-mono">
                {isCinema ? "CINEMA / FILM ARCHIVE" : "ANIME / ANIMATION ARCHIVE"}
              </span>
            </div>
          </Link>
        </div>

        {/* Medium / Mode Switcher */}
        <div className="medium-switcher font-mono" role="group" aria-label="Select discovery medium">
          <button
            type="button"
            className={`medium-tab ${isAnime ? "active" : ""}`}
            onClick={() => switchMode("anime")}
            aria-pressed={isAnime}
          >
            <span className="medium-tab-indicator"></span>
            ANIME
          </button>
          <button
            type="button"
            className={`medium-tab ${isCinema ? "active" : ""}`}
            onClick={() => switchMode("cinema")}
            aria-pressed={isCinema}
          >
            <span className="medium-tab-indicator"></span>
            CINEMA
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <NavLink
            to={homePath}
            end
            className={({ isActive }) =>
              isActive ? "nav-item active font-headline" : "nav-item font-headline"
            }
          >
            Home
          </NavLink>
          <NavLink
            to={explorePath}
            className={({ isActive }) =>
              isActive ? "nav-item active font-headline" : "nav-item font-headline"
            }
          >
            Explore
          </NavLink>
          <NavLink
            to={watchlistPath}
            className={({ isActive }) =>
              isActive ? "nav-item active font-headline" : "nav-item font-headline"
            }
          >
            Watchlist
          </NavLink>
        </nav>

        {/* Search & Mobile Controls */}
        <div className="masthead-tools">
          <form className="header-search-form" onSubmit={handleSubmit}>
            <svg
              className="search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isCinema ? "Search movies & TV series..." : "Search anime..."}
              className="header-search-input"
            />
          </form>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-toggle-btn font-headline"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer font-headline">
          {/* Mobile Mode Switcher */}
          <div className="mobile-medium-switcher font-mono">
            <button
              type="button"
              className={`mobile-medium-btn ${isAnime ? "active" : ""}`}
              onClick={() => {
                switchMode("anime");
                setMobileMenuOpen(false);
              }}
            >
              ANIME
            </button>
            <button
              type="button"
              className={`mobile-medium-btn ${isCinema ? "active" : ""}`}
              onClick={() => {
                switchMode("cinema");
                setMobileMenuOpen(false);
              }}
            >
              CINEMA
            </button>
          </div>

          <NavLink
            to={homePath}
            end
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to={explorePath}
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore {isCinema ? "Cinema" : "Anime"}
          </NavLink>
          <NavLink
            to={watchlistPath}
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Watchlist ({isCinema ? "Cinema" : "Anime"})
          </NavLink>
        </div>
      )}
    </header>
  );
}
