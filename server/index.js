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

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

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