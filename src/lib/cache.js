import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveCache(key, data, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  const payload = { expiresAt, data };
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}

export async function loadCache(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const { expiresAt, data } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      // expired
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (e) {
    return null;
  }
}
