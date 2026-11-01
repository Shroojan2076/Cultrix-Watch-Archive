import { useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModeContext } from "./modeContextDef";

export function ModeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Mode is derived directly from the URL pathname, with localStorage fallback
  const mode = useMemo(() => {
    if (location.pathname.startsWith("/cinema")) return "cinema";
    if (location.pathname.startsWith("/anime")) return "anime";
    const saved = localStorage.getItem("yugen_index_mode");
    return saved === "cinema" ? "cinema" : "anime";
  }, [location.pathname]);

  // Synchronously apply data-theme attribute to DOM root to prevent visual flash
  if (typeof document !== "undefined") {
    if (document.documentElement.getAttribute("data-theme") !== mode) {
      document.documentElement.setAttribute("data-theme", mode);
    }
    if (document.body && document.body.getAttribute("data-theme") !== mode) {
      document.body.setAttribute("data-theme", mode);
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.body.setAttribute("data-theme", mode);
  }, [mode]);

  const switchMode = useCallback(
    (newMode) => {
      if (newMode === mode) return;

      localStorage.setItem("yugen_index_mode", newMode);

      // Context-sensitive path transition
      const currentPath = location.pathname;
      if (newMode === "cinema") {
        if (currentPath.includes("/explore") || currentPath.includes("/search")) {
          navigate("/cinema/explore");
        } else if (currentPath.includes("/watchlist")) {
          navigate("/cinema/watchlist");
        } else {
          navigate("/cinema");
        }
      } else {
        if (currentPath.includes("/explore") || currentPath.includes("/search")) {
          navigate("/anime/explore");
        } else if (currentPath.includes("/watchlist")) {
          navigate("/anime/watchlist");
        } else {
          navigate("/anime");
        }
      }
    },
    [mode, location.pathname, navigate]
  );

  const isAnime = mode === "anime";
  const isCinema = mode === "cinema";
  const homePath = isCinema ? "/cinema" : "/anime";
  const explorePath = isCinema ? "/cinema/explore" : "/anime/explore";
  const watchlistPath = isCinema ? "/cinema/watchlist" : "/anime/watchlist";

  const value = useMemo(
    () => ({
      mode,
      isAnime,
      isCinema,
      switchMode,
      homePath,
      explorePath,
      watchlistPath
    }),
    [mode, isAnime, isCinema, switchMode, homePath, explorePath, watchlistPath]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}
