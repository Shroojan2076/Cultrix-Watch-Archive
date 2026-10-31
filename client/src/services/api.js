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