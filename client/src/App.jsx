import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { ModeProvider } from "./context/ModeContext";
import { useMode } from "./context/useMode";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Anime Mode Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import AnimeDetails from "./pages/AnimeDetails";
import Watchlist from "./pages/Watchlist";

// Cinema Mode Pages
import CinemaHome from "./pages/cinema/CinemaHome";
import CinemaExplore from "./pages/cinema/CinemaExplore";
import MovieDetails from "./pages/cinema/MovieDetails";
import MovieWatchlist from "./pages/cinema/MovieWatchlist";

function RootRedirect() {
  const { mode } = useMode();
  return <Navigate to={`/${mode}`} replace />;
}

function LegacySearchRedirect() {
  const [searchParams] = useSearchParams();
  const { mode } = useMode();
  const q = searchParams.get("q");
  const target = mode === "cinema" ? "/cinema/explore" : "/anime/explore";
  return (
    <Navigate
      to={q ? `${target}?q=${encodeURIComponent(q)}` : target}
      replace
    />
  );
}

function LegacyWatchlistRedirect() {
  const { mode } = useMode();
  const target = mode === "cinema" ? "/cinema/watchlist" : "/anime/watchlist";
  return <Navigate to={target} replace />;
}

function AppRoutes() {
  return (
    <>
      <Header />
      <Routes>
        {/* Root Redirect to active medium */}
        <Route path="/" element={<RootRedirect />} />

        {/* Anime Mode Routes */}
        <Route path="/anime" element={<Home />} />
        <Route path="/anime/explore" element={<Search />} />
        <Route path="/anime/:mal_id" element={<AnimeDetails />} />
        <Route path="/anime/watchlist" element={<Watchlist />} />

        {/* Cinema Mode Routes */}
        <Route path="/cinema" element={<CinemaHome />} />
        <Route path="/cinema/explore" element={<CinemaExplore />} />
        <Route path="/cinema/:tmdb_id" element={<MovieDetails />} />
        <Route path="/cinema/watchlist" element={<MovieWatchlist />} />

        {/* Legacy / Backward Compatible Routes */}
        <Route path="/search" element={<LegacySearchRedirect />} />
        <Route path="/watchlist" element={<LegacyWatchlistRedirect />} />

        {/* Fallback 404 */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ModeProvider>
      <AppRoutes />
    </ModeProvider>
  );
}

export default App;
