/**
 * Reusable utility for resolving anime titles.
 *
 * Rules:
 * 1. Prefer `alternative_titles.en` when it exists and is non-empty.
 * 2. Otherwise use `title`.
 * 3. Never display an empty or undefined title (fallback gracefully).
 *
 * Handles both unwrapped objects (e.g. details) and wrapped items (e.g. `{ node: ... }`).
 */

export function getAnimeTitle(anime, fallback = "Untitled Anime") {
  if (!anime) return fallback;
  const data = anime.node || anime;

  // 1. Prefer English title when available and non-empty
  const enTitle = data.alternative_titles?.en;
  if (typeof enTitle === "string" && enTitle.trim().length > 0) {
    return enTitle.trim();
  }

  // 2. Fall back to standard title
  const primaryTitle = data.title;
  if (typeof primaryTitle === "string" && primaryTitle.trim().length > 0) {
    return primaryTitle.trim();
  }

  // 3. Fall back to first synonym if available
  if (Array.isArray(data.alternative_titles?.synonyms) && data.alternative_titles.synonyms.length > 0) {
    const syn = data.alternative_titles.synonyms[0];
    if (typeof syn === "string" && syn.trim().length > 0) {
      return syn.trim();
    }
  }

  return fallback;
}

/**
 * Retrieves the Japanese title if available and non-empty.
 *
 * @param {Object} anime - Anime object or wrapped node
 * @returns {string|null} Japanese title or null
 */
export function getAnimeJapaneseTitle(anime) {
  if (!anime) return null;
  const data = anime.node || anime;

  const jaTitle = data.alternative_titles?.ja;
  if (typeof jaTitle === "string" && jaTitle.trim().length > 0) {
    return jaTitle.trim();
  }

  return null;
}

