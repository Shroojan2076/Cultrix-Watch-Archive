import express from "express";
import "dotenv/config";
import cors from "cors";

import searchRoutes from "./routes/search.js";
import animeRoutes from "./routes/anime.js";
import watchlistRoutes from "./routes/watchlist.js";
import cinemaRoutes from "./routes/cinema.js";
import movieWatchlistRoutes from "./routes/movieWatchlist.js";

const app = express();
const port = process.env.PORT || 3000;

// Explicit CORS Allowlist: Local Development + Configured Production Frontend
const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, "")).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...localOrigins, ...configuredOrigins]));

function isAllowedOrigin(origin) {
  // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
  if (!origin) {
    return true;
  }

  const normalized = origin.trim().replace(/\/$/, "");

  // 1. Check exact allowed origins (local development + explicitly configured URLs)
  if (allowedOrigins.includes(normalized)) {
    return true;
  }

  // 2. Constrained Vercel preview match:
  // If and only if a trusted Vercel URL is specified in CLIENT_URL,
  // allow previews that strictly belong to that exact project scope.
  try {
    const parsedOrigin = new URL(normalized);
    if (parsedOrigin.protocol !== "https:" || !parsedOrigin.hostname.endsWith(".vercel.app")) {
      return false;
    }

    const originHostname = parsedOrigin.hostname.toLowerCase();

    return configuredOrigins.some((configured) => {
      try {
        const confUrl = new URL(configured);
        if (!confUrl.hostname.endsWith(".vercel.app")) return false;

        const baseProject = confUrl.hostname.toLowerCase().replace(/\.vercel\.app$/, "");
        if (!baseProject || baseProject.length < 2) return false;

        // Escape regex special chars
        const safeProject = baseProject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Strict preview pattern: <project>.vercel.app or <project>-<preview-slug>.vercel.app
        const previewRegex = new RegExp(`^${safeProject}(-[a-z0-9-]+)?\\.vercel\\.app$`, "i");
        return previewRegex.test(originHostname);
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      // Reject all unauthorized origins
      const corsError = new Error(`Origin ${origin} is not allowed by CORS policy`);
      corsError.status = 403;
      return callback(corsError);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
  })
);

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// API Routes
app.use(searchRoutes);
app.use(animeRoutes);
app.use(watchlistRoutes);
app.use(cinemaRoutes);
app.use(movieWatchlistRoutes);

// 404 Not Found JSON Handler
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized JSON Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err.stack || err.message);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: err.message || "Internal server error" });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});