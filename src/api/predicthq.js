// src/api/predicthq.js

import { saveCache, loadCache } from "../lib/cache";

const CACHE_KEY = "predictHQ_events";
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const PREDICTHQ_BASE_URL = "https://api.predicthq.com/v1";
const PREDICTHQ_TOKEN = process.env.EXPO_PUBLIC_PREDICTHQ_TOKEN;


async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${PREDICTHQ_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("PredictHQ error:", res.status, text);
    throw new Error(`PredictHQ error ${res.status}`);
  }

  return res.json();
}

// Helper: build URL for Qatar events
export async function getQatarEvents({ limit = 10, offset = 0 } = {}) {
  // Try cache
  const cached = await loadCache(CACHE_KEY);
  if (cached) return cached;

  // Make request
  const params = new URLSearchParams({
    category: "expos,conferences,festivals,concerts",
    country: "QA",
    limit: String(limit),
    offset: String(offset),
  });

  const url = `${PREDICTHQ_BASE_URL}/events/?${params.toString()}`;
  const json = await fetchJson(url);

  // Save to cache
  await saveCache(CACHE_KEY, json, CACHE_TTL);

  return json;
}


// Generic: fetch any next/previous page URL returned by PredictHQ
export async function fetchByUrl(fullUrl) {
  return fetchJson(fullUrl);
}
