// src/lib/favorites.js
// Helper functions for favorites (events + places)

import { supabase } from '../../config'; // adjust path if needed

// ---------- ID helpers ----------

export function getEventExternalId(event) {
  // PredictHQ event.id (from API)
  return event.id;
}

export function getPlaceExternalId(place) {
  // SerpAPI: prefer place_id, fallback to data_id or position
  return place.place_id || place.data_id || String(place.position);
}

// ---------- Core helpers ----------

// Check if item is already favorited
export async function isFavorited({ userId, itemType, externalId }) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('external_id', externalId)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.log('isFavorited error:', error);
  }

  return !!data;
}

// ---------- Event favorites ----------

export async function addEventFavorite(userId, event) {
  const externalId = getEventExternalId(event);

  const payload = {
    user_id: userId,
    item_type: 'event',
    external_id: externalId,
    source: 'predicthq',
    title: event.title,
    subtitle: event.category || null,
    image_url: event.image_url || null,
    address:
      event.geo?.address?.formatted_address ||
      event.venue_name ||
      event.city ||
      null,
    raw_data: event,
  };

  const { error } = await supabase.from('favorites').insert(payload);
  if (error) throw error;
}

export async function removeEventFavorite(userId, event) {
  const externalId = getEventExternalId(event);

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', 'event')
    .eq('external_id', externalId);

  if (error) throw error;
}

// ---------- Place favorites ----------

export async function addPlaceFavorite(userId, place) {
  const externalId = getPlaceExternalId(place);

  const payload = {
    user_id: userId,
    item_type: 'place',
    external_id: externalId,
    source: 'serpapi',
    title: place.title,
    subtitle: place.type || null,
    image_url: place.serpapi_thumbnail || place.thumbnail || null,
    address: place.address || null,
    raw_data: place,
  };

  const { error } = await supabase.from('favorites').insert(payload);
  if (error) throw error;
}

export async function removePlaceFavorite(userId, place) {
  const externalId = getPlaceExternalId(place);

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', 'place')
    .eq('external_id', externalId);

  if (error) throw error;
}
