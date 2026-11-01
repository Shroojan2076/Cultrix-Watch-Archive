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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (like server-to-server, mobile testing tools, or postman/curl)
      if (!origin) {
        return callback(null, true);
      }

      // Normalize the origin string
      const normalized = origin.trim().replace(/\/$/, "").toLowerCase();

      // STRICT CHECK: Exclusively allow only this Vercel deployment
      if (normalized === "https://vercel.app") {
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