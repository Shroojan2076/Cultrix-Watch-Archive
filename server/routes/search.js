import express from "express";
import { searchAnime, getNextPage, getAnimeRanking } from "../services/mal.js";

const router = express.Router();

router.get("/ranking", async (req, res) => {
    const rankingType = req.query.type || "all";
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    try {
        const result = await getAnimeRanking(rankingType, limit);
        return res.json({
            data: result.data || [],
            nextUrl: result.paging?.next || null
        });
    } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || "Failed to load rankings.";
        console.error("Ranking API error:", status, errorMessage);
        return res.status(status).json({ error: errorMessage });
    }
});

router.get("/", async (req, res) => {
    const query = req.query.q || req.query.query;

    if (!query || !query.trim()) {
        return res.json({ data: [], nextUrl: null });
    }

    try {
        const result = await searchAnime(query.trim());
        return res.json({
            data: result.data || [],
            nextUrl: result.paging?.next || null
        });
    } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || "Search failed.";
        console.error("Search API error:", status, errorMessage);
        return res.status(status).json({ error: errorMessage });
    }
});

router.post("/", async (req, res) => {
    const query = req.body["search-anime"] || req.body.query || req.body.q;

    if (!query || !query.trim()) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const result = await searchAnime(query.trim());
        return res.json({
            data: result.data || [],
            nextUrl: result.paging?.next || null
        });
    } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || "Search failed.";
        console.error("Search API error:", status, errorMessage);
        return res.status(status).json({ error: errorMessage });
    }
});

router.get("/next", async (req, res) => {
    const nextUrl = req.query.url;

    if (!nextUrl) {
        return res.status(400).json({ error: "Pagination next URL is required (?url=...)" });
    }

    try {
        const result = await getNextPage(nextUrl);
        return res.json({
            data: result.data || [],
            nextUrl: result.paging?.next || null
        });
    } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || "Failed to load more anime.";
        console.error("Next page API error:", status, errorMessage);
        return res.status(status).json({ error: errorMessage });
    }
});

export default router;