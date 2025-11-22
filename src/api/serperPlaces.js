// src/api/serperPlaces.js

import { saveCache, loadCache } from "../lib/cache";

const CACHE_KEY_PLACES = "serper_places";
const CACHE_TTL_PLACES = 1000 * 60 * 60 * 12; // 12 hours

const SERPER_BASE_URL = "https://google.serper.dev";
const SERPER_API_KEY = process.env.EXPO_PUBLIC_SERPER_KEY;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    console.log("Serper API error:", res.status, text);
    throw new Error(`Serper API error ${res.status}`);
  }

  return res.json();
}

/**
 * Get popular places in Qatar (Google Maps via Serper API)
 * Fetches all available pages and returns combined results.
 *
 * HomeScreen expects to call: getPopularPlaces({ limit: 8 })
 */
export async function getPopularPlaces({ limit = 8 } = {}) {
  const cached = await loadCache(CACHE_KEY_PLACES);
  if (cached) return cached.slice(0, limit);

  const url = `${SERPER_BASE_URL}/places`;
  const allResults = [];
  let currentPage = 1;
  let hasMorePages = true;

  // Fetch all pages
  while (hasMorePages) {
    const body = {
      q: "popular places in qatar",
      gl: "qa", // Qatar country code
      hl: "en", // English language
      page: currentPage,
    };

    try {
      const json = await fetchJson(url, {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const pageResults = json.places || [];
      
      if (pageResults.length > 0) {
        allResults.push(...pageResults);
        console.log(`Fetched page ${currentPage}: ${pageResults.length} results`);
        
        // Check if there are more pages
        // Usually Serper returns less than 10 results on the last page
        // or includes pagination info in the response
        if (pageResults.length < 10 || currentPage >= 10) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      } else {
        hasMorePages = false;
      }
    } catch (error) {
      console.log(`Error fetching page ${currentPage}:`, error);
      hasMorePages = false;
    }
  }

  console.log(`Total places fetched: ${allResults.length} from ${currentPage} pages`);

  // Save all results to cache
  await saveCache(CACHE_KEY_PLACES, allResults, CACHE_TTL_PLACES);

  return allResults.slice(0, limit);
}

/**
 * (Optional) If you still want a "full JSON" version somewhere else
 * you can keep this helper.
 */
export async function getPopularPlacesInQatar() {
  const url = `${SERPER_BASE_URL}/places`;

  const body = {
    q: "popular places in qatar",
    gl: "qa",
    hl: "en",
  };

  return fetchJson(url, {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}