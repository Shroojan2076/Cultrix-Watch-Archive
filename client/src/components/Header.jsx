import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setMobileMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="masthead-container">
        {/* Brand Link */}
        <div className="masthead-brand">
          <Link to="/" className="brand-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="jp-brand-mark">月刊</span>
            <div className="brand-text">
              <span className="brand-title font-display">GEKKAN ANIME</span>
              <span className="brand-sub font-mono">ANIME ARCHIVE</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active font-headline" : "nav-item font-headline"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive ? "nav-item active font-headline" : "nav-item font-headline"
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/watchlist"
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
              placeholder="Search anime..."
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
          <NavLink
            to="/"
            end
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore
          </NavLink>
          <NavLink
            to="/watchlist"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Watchlist
          </NavLink>
        </div>
      )}
    </header>
  );
}
