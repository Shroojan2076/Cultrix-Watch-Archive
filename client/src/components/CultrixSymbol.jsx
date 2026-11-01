import { useMode } from "../context/useMode";

export default function CultrixSymbol({
  size = 28,
  className = "",
  mode: modeProp,
  accentColor,
  strokeColor,
  ...props
}) {
  let contextMode = "anime";
  try {
    // Hook access to current active discovery medium
    const modeContext = useMode();
    if (modeContext && modeContext.mode) {
      contextMode = modeContext.mode;
    }
  } catch {
    // Graceful fallback if rendered outside ModeProvider
  }

  const activeMode = modeProp || contextMode || "anime";
  const isCinema = activeMode === "cinema";

  // Dynamic colors: Vermilion in Anime Mode, Film Gold/Amber in Cinema Mode
  const resolvedAccent = accentColor || (isCinema ? "#E5A93C" : "#E23826");
  const resolvedStroke = strokeColor || (isCinema ? "#F7F5F0" : "#F4F2EC");
  const cutoutColor = isCinema ? "#07090C" : "transparent";

  if (isCinema) {
    // ------------------------------------------------------------------------
    // CINEMA MODE X: 35mm Celluloid Film Frame with Widescreen Gate & Sprocket Perfs
    // ------------------------------------------------------------------------
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`cultrix-symbol cultrix-symbol-cinema ${className}`}
        aria-hidden="true"
        {...props}
      >
        {/* Celluloid Ribbon 1 (Top-Left to Bottom-Right) */}
        <polygon points="5,4 9.5,4 27,28 22.5,28" fill={resolvedStroke} />

        {/* Precision 35mm Film Sprocket Perforations */}
        <rect
          x="6"
          y="7.5"
          width="2"
          height="2.5"
          rx="0.4"
          fill={cutoutColor}
          transform="rotate(-45 7 8.75)"
        />
        <rect
          x="23"
          y="22.5"
          width="2"
          height="2.5"
          rx="0.4"
          fill={cutoutColor}
          transform="rotate(-45 24 23.75)"
        />

        {/* Celluloid Ribbon 2: Lower Ascending Arm */}
        <polygon points="5,28 9.5,28 13.5,22.5 9.5,22.5" fill={resolvedStroke} />
        <rect
          x="6"
          y="22.5"
          width="2"
          height="2.5"
          rx="0.4"
          fill={cutoutColor}
          transform="rotate(45 7 23.75)"
        />

        {/* Celluloid Ribbon 2: Upper Ascending Arm in 35mm Film Gold/Amber */}
        <polygon points="18.5,9.5 22.5,9.5 27,4 22.5,4" fill={resolvedAccent} />
        <rect
          x="23"
          y="7.5"
          width="2"
          height="2.5"
          rx="0.4"
          fill={cutoutColor}
          transform="rotate(45 24 8.75)"
        />

        {/* Anamorphic Widescreen Projector Gate / Aperture (Golden Frame) */}
        <rect x="11" y="13.5" width="10" height="5.5" rx="1" fill={resolvedAccent} />
        <rect x="13" y="14.5" width="6" height="3.5" rx="0.5" fill={cutoutColor} />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // ANIME MODE X: Tokyo Underground Graphic Matrix with Precision Razor Cuts
  // --------------------------------------------------------------------------
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cultrix-symbol cultrix-symbol-anime ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Primary diagonal ribbon (Top-Left to Bottom-Right) */}
      <polygon points="6,5 10.5,5 26,27 21.5,27" fill={resolvedStroke} />

      {/* Secondary diagonal lower arm (Bottom-Left toward Center) */}
      <polygon points="6,27 10.5,27 14,21.5 10,21.5" fill={resolvedStroke} />

      {/* Secondary diagonal upper arm in signature CULTRIX Vermilion */}
      <polygon points="18,10.5 22,10.5 26,5 21.5,5" fill={resolvedAccent} />

      {/* Central matrix intersection core */}
      <rect x="14" y="14" width="4" height="4" fill={resolvedAccent} />
    </svg>
  );
}
