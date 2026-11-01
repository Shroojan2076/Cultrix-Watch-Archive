const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getAnimeRanking(rankingType = "all", limit = 10) {
    try {
        const response = await fetch(
            `${API_URL}/ranking?type=${encodeURIComponent(rankingType)}&limit=${limit}`,
            {
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch {
        // Fall back gracefully to search if ranking route is unavailable
    }

    const fallbackQuery = rankingType === "airing" ? "Airing" : rankingType === "bypopularity" ? "Popular" : "Top";
    return searchAnime(fallbackQuery);
}

export async function searchAnime(query) {
    const response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: query
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to search anime");
    }

    return data;
}

export async function loadMoreAnime(nextUrl) {
    if (!nextUrl) {
        throw new Error("No next page URL provided");
    }

    const response = await fetch(
        `${API_URL}/next?url=${encodeURIComponent(nextUrl)}`,
        {
            headers: {
                "Accept": "application/json"
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to load more anime");
    }

    return data;
}

export async function getAnimeDetails(malId) {
    const response = await fetch(`${API_URL}/anime/${malId}`, {
        headers: {
            "Accept": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to load anime details");
    }

    return data.data;
}

export async function getWatchlist() {
    const response = await fetch(`${API_URL}/watchlist`, {
        headers: {
            "Accept": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to load watchlist");
    }

    return data.data || [];
}

export async function addToWatchlist(animeData) {
    const response = await fetch(`${API_URL}/watchlist/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(animeData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to add anime to watchlist");
    }

    return data;
}

export async function updateWatchlistItem(malId, updates) {
    const response = await fetch(`${API_URL}/watchlist/${malId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to update watchlist item");
    }

    return data;
}

export async function removeFromWatchlist(malId) {
    const response = await fetch(`${API_URL}/watchlist/${malId}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to remove anime from watchlist");
    }

    return data;
}

/* ==========================================================================
   Cinema / TMDB API Methods
   ========================================================================== */

export async function getCinemaTrending(timeWindow = "week", page = 1) {
    const response = await fetch(`${API_URL}/api/cinema/trending?window=${timeWindow}&page=${page}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trending movies");
    }
    return data.data;
}

export async function getCinemaPopular(page = 1) {
    const response = await fetch(`${API_URL}/api/cinema/popular?page=${page}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch popular movies");
    }
    return data.data;
}

export async function getCinemaTopRated(page = 1) {
    const response = await fetch(`${API_URL}/api/cinema/top-rated?page=${page}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch top-rated movies");
    }
    return data.data;
}

export async function getCinemaUpcoming(page = 1) {
    const response = await fetch(`${API_URL}/api/cinema/upcoming?page=${page}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch upcoming movies");
    }
    return data.data;
}

export async function getCinemaNowPlaying(page = 1) {
    const response = await fetch(`${API_URL}/api/cinema/now-playing?page=${page}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch now-playing movies");
    }
    return data.data;
}

export async function getCinemaGenres() {
    const response = await fetch(`${API_URL}/api/cinema/genres`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch movie genres");
    }
    return data.data;
}

export async function discoverMoviesByGenre(genreId, page = 1, sortBy = "popularity.desc") {
    const response = await fetch(`${API_URL}/api/cinema/discover?genre_id=${genreId}&page=${page}&sort_by=${sortBy}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to discover movies by genre");
    }
    return data.data;
}

export async function searchMovies(query, page = 1) {
    const response = await fetch(`${API_URL}/api/cinema/search?q=${encodeURIComponent(query)}&page=${page}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to search movies");
    }
    return data.data;
}

export const searchCinema = searchMovies;

export async function getMovieDetails(tmdbId, mediaType) {
    const typeQuery = mediaType ? `?type=${encodeURIComponent(mediaType)}` : "";
    const response = await fetch(`${API_URL}/api/cinema/movie/${tmdbId}${typeQuery}`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cinema details");
    }
    return data.data;
}

export const getCinemaDetails = getMovieDetails;

/* ==========================================================================
   Movie Watchlist API Methods
   ========================================================================== */

export async function getMovieWatchlist() {
    const response = await fetch(`${API_URL}/api/cinema/watchlist`, {
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch movie watchlist");
    }
    return data.data || [];
}

export async function addMovieToWatchlist(movieData) {
    const response = await fetch(`${API_URL}/api/cinema/watchlist/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(movieData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to add movie to watchlist");
    }
    return data;
}

export async function updateMovieWatchlistItem(tmdbId, updates) {
    const response = await fetch(`${API_URL}/api/cinema/watchlist/${tmdbId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to update movie watchlist item");
    }
    return data;
}

export async function removeMovieFromWatchlist(tmdbId) {
    const response = await fetch(`${API_URL}/api/cinema/watchlist/${tmdbId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to remove movie from watchlist");
    }
    return data;
}
