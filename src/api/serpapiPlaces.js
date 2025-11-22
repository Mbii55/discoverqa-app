// src/api/serpapiPlaces.js

import { saveCache, loadCache } from "../lib/cache";

const CACHE_KEY_PLACES = "serpapi_places";
const CACHE_TTL_PLACES = 1000 * 60 * 60 * 12; // 12 hours

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";
const SERPAPI_API_KEY = process.env.EXPO_PUBLIC_SERPAPI_KEY;


async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.log("SerpAPI error:", res.status, text);
    throw new Error(`SerpAPI error ${res.status}`);
  }

  return res.json();
}

/**
 * Get popular places in Qatar (Google Maps via SerpAPI)
 * Returns an ARRAY of place objects (local_results), already sliced by limit.
 *
 * HomeScreen expects to call: getPopularPlaces({ limit: 8 })
 */
export async function getPopularPlaces({ limit = 8 } = {}) {
  const cached = await loadCache(CACHE_KEY_PLACES);
  if (cached) return cached.slice(0, limit);

  const query = [
    "engine=google_maps",
    "type=search",
    "q=" + encodeURIComponent("popular places in qatar"),
    "hl=en",
    "ll=@25.2854,51.5310,11z",
    "api_key=" + SERPAPI_API_KEY,
  ].join("&");

  const url = `${SERPAPI_BASE_URL}?${query}`;

  const json = await fetchJson(url);
  const results = json.local_results || [];

  // Save to cache
  await saveCache(CACHE_KEY_PLACES, results, CACHE_TTL_PLACES);

  return results.slice(0, limit);
}


/**
 * (Optional) If you still want a "full JSON" version somewhere else
 * you can keep this helper.
 */
export async function getPopularPlacesInQatar() {
  const query = [
    "engine=google_maps",
    "type=search",
    "q=" + encodeURIComponent("popular places in qatar"),
    "hl=en",
    "ll=@25.2854,51.5310,11z",
    "api_key=" + SERPAPI_API_KEY,
  ].join("&");

  const url = `${SERPAPI_BASE_URL}?${query}`;
  return fetchJson(url); // full JSON: { local_results, search_metadata, ... }
}

// Optional: if later SerpAPI gives you pagination links like serpapi_pagination.next_link
export async function fetchPlacesByUrl(fullUrl) {
  return fetchJson(fullUrl);
}
