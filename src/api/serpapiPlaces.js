// src/api/serpapiPlaces.js

import { saveCache, loadCache } from "../lib/cache";
import { getPlacePhotos } from "./serpapiPhotos";

const CACHE_KEY_PLACES = "serpapi_places_with_photos";
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
 * Fetch thumbnails for multiple places in batches
 */
async function enrichPlacesWithThumbnails(places) {
  console.log(`[SerpAPI] Enriching ${places.length} places with thumbnails...`);
  
  const batchSize = 5; // Process 5 places at a time
  const enrichedPlaces = [];
  
  for (let i = 0; i < places.length; i += batchSize) {
    const batch = places.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (place) => {
      if (!place.photos_link) {
        return { ...place, thumbnail: null };
      }
      
      try {
        const photos = await getPlacePhotos(place.photos_link);
        return {
          ...place,
          thumbnail: photos[0] || null, // Add first photo as thumbnail
        };
      } catch (err) {
        console.log(`[SerpAPI] Error fetching photos for ${place.title}:`, err);
        return { ...place, thumbnail: null };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    enrichedPlaces.push(...batchResults);
    
    console.log(`[SerpAPI] Processed ${enrichedPlaces.length}/${places.length} places`);
    
    // Small delay between batches to prevent rate limiting
    if (i + batchSize < places.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`[SerpAPI] Finished enriching places with thumbnails`);
  return enrichedPlaces;
}

/**
 * Get popular places in Qatar (Google Maps via SerpAPI)
 * Returns an ARRAY of place objects (local_results) WITH thumbnails already loaded.
 * If limit is provided and not Infinity, returns only that many results.
 * If limit is not provided or Infinity, returns ALL available results.
 *
 * HomeScreen expects to call: getPopularPlaces({ limit: 8 })
 * PlacesScreen expects to call: getPopularPlaces() to get all results
 */
export async function getPopularPlaces({ limit } = {}) {
  console.log('🔍 [CACHE CHECK] Looking for cached places...');
  
  const cached = await loadCache(CACHE_KEY_PLACES);
  
  if (cached) {
    console.log('✅ [CACHE HIT] Using cached places:', cached.length);
    console.log('✅ [CACHE HIT] First place has thumbnail:', !!cached[0]?.thumbnail);
    
    if (limit && limit !== Infinity && typeof limit === 'number') {
      return cached.slice(0, limit);
    }
    return cached;
  }

  console.log('❌ [CACHE MISS] No cache found, fetching from API...');
  console.log('📡 [API CALL] Making SerpAPI request...');
  
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
  
  console.log(`[SerpAPI] Fetched ${results.length} places from API`);

  // Enrich places with thumbnails before caching
  const enrichedResults = await enrichPlacesWithThumbnails(results);

  // Save enriched results (with thumbnails) to cache
  await saveCache(CACHE_KEY_PLACES, enrichedResults, CACHE_TTL_PLACES);
  console.log(`[SerpAPI] Cached ${enrichedResults.length} places with thumbnails`);

  // If limit is specified and is a finite number, slice; otherwise return all
  if (limit && limit !== Infinity && typeof limit === 'number') {
    return enrichedResults.slice(0, limit);
  }
  return enrichedResults;
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