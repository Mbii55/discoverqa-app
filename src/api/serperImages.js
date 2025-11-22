// src/api/serperImages.js
// Fetch images for a place using Serper Images API
// with simple AsyncStorage-based caching.

import { saveCache, loadCache } from "../lib/cache";

const SERPER_API_KEY = process.env.EXPO_PUBLIC_SERPER_KEY;
const SERPER_BASE_URL = "https://google.serper.dev";

// 12 hours cache for images (they don't change often)
const IMAGES_CACHE_TTL = 1000 * 60 * 60 * 12; // 12h
const CACHE_KEY_PREFIX = "serper_place_images:";

// Extract image URLs from Serper image objects
function extractImageUrl(image) {
  if (!image || typeof image !== "object") return null;

  // Serper returns images with imageUrl field
  return image.imageUrl || image.thumbnailUrl || null;
}

/**
 * Get images for a place using Serper Images API
 * @param {string} placeName - The name of the place to search for images
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function getPlaceImages(placeName) {
  try {
    if (!placeName) {
      console.log("[getPlaceImages] No place name provided");
      return [];
    }
    if (!SERPER_API_KEY) {
      console.warn("[getPlaceImages] SERPER_API_KEY is missing");
      return [];
    }

    // Build a cache key unique per place
    const cacheKey = CACHE_KEY_PREFIX + placeName;

    // 1) Try cache first
    const cached = await loadCache(cacheKey);
    if (cached && Array.isArray(cached)) {
      // console.log("[getPlaceImages] Using cached images:", cached.length);
      return cached;
    }

    // 2) Not cached or expired → fetch from Serper
    const url = `${SERPER_BASE_URL}/images`;

    const body = {
      q: placeName + " qatar", // Add "qatar" to get more relevant results
      gl: "qa",
      hl: "en",
      num: 20, // Request up to 20 images
    };

    // console.log("[getPlaceImages] Fetching images for:", placeName);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("[getPlaceImages] HTTP error:", res.status, text);
      return [];
    }

    const json = await res.json();
    // console.log("[getPlaceImages] Response keys:", Object.keys(json || {}));

    const rawImages = json.images || [];

    if (!Array.isArray(rawImages)) {
      console.log("[getPlaceImages] images payload is not an array");
      return [];
    }

    const urls = rawImages.map(extractImageUrl).filter(Boolean);
    // console.log("[getPlaceImages] Extracted images count:", urls.length);

    // 3) Save to cache
    await saveCache(cacheKey, urls, IMAGES_CACHE_TTL);

    return urls;
  } catch (err) {
    console.log("[getPlaceImages] Error:", err);
    return [];
  }
}