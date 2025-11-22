// src/api/serpapiPhotos.js
// Fetch ALL photos for a place using SerpAPI Google Maps Photos API
// with simple AsyncStorage-based caching.

import { saveCache, loadCache } from "../lib/cache";

const SERPAPI_API_KEY = process.env.EXPO_PUBLIC_SERPAPI_KEY;

// 12 hours cache for photos (they don't change often)
const PHOTOS_CACHE_TTL = 1000 * 60 * 60 * 12; // 12h
const CACHE_KEY_PREFIX = "serpapi_place_photos:";

// Extract image URLs from SerpAPI photo objects
function extractPhotoUrl(photo) {
  if (!photo || typeof photo !== "object") return null;

  // Try the most common keys SerpAPI uses
  return (
    photo.image ||
    photo.photo_url ||
    photo.original ||
    photo.thumbnail ||
    null
  );
}

export async function getPlacePhotos(photosLink) {
  try {
    if (!photosLink) {
      console.log("[getPlacePhotos] No photos_link for this place");
      return [];
    }
    if (!SERPAPI_API_KEY) {
      console.warn("[getPlacePhotos] SERPAPI_API_KEY is missing");
      return [];
    }

    // Build a cache key unique per place/photos_link
    const cacheKey = CACHE_KEY_PREFIX + photosLink;

    // 1) Try cache first
    const cached = await loadCache(cacheKey);
    if (cached && Array.isArray(cached)) {
      // console.log("[getPlacePhotos] Using cached photos:", cached.length);
      return cached;
    }

    // 2) Not cached or expired → fetch from SerpAPI
    const sep = photosLink.includes("?") ? "&" : "?";
    const url = `${photosLink}${sep}api_key=${SERPAPI_API_KEY}`;

    // console.log("[getPlacePhotos] Fetching:", url);
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.log("[getPlacePhotos] HTTP error:", res.status, text);
      return [];
    }

    const json = await res.json();
    // console.log("[getPlacePhotos] Response keys:", Object.keys(json || {}));

    const rawPhotos =
      json.photos ||
      json.images ||
      json.results ||
      json.data ||
      [];

    if (!Array.isArray(rawPhotos)) {
      console.log("[getPlacePhotos] photos payload is not an array");
      return [];
    }

    const urls = rawPhotos.map(extractPhotoUrl).filter(Boolean);
    // console.log("[getPlacePhotos] Extracted photos count:", urls.length);

    // 3) Save to cache
    await saveCache(cacheKey, urls, PHOTOS_CACHE_TTL);

    return urls;
  } catch (err) {
    console.log("[getPlacePhotos] Error:", err);
    return [];
  }
}
