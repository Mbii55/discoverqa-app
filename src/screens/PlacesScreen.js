// src/screens/PlacesScreen.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getPopularPlaces } from "../api/serpapiPlaces";
import { getPlacePhotos } from "../api/serpapiPhotos";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;

// Simplified PlaceCard that receives thumbnail as prop
const PlaceCard = React.memo(({ place, thumbnail, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContainer}>
        {thumbnail === undefined ? (
          <View style={styles.placeholderContainer}>
            <ActivityIndicator size="small" color="#2D3748" />
          </View>
        ) : thumbnail ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: thumbnail }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.imageOverlay} />
            {place.rating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {place.rating}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>🏛️</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {place.title}
          </Text>

          {place.type && (
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>{place.type}</Text>
            </View>
          )}

          <View style={styles.infoSection}>
            {place.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
            )}

            {place.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {place.phone}
                </Text>
              </View>
            )}

            {place.reviews && (
              <Text style={styles.reviewsText}>
                {place.reviews} reviews
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function PlacesScreen() {
  const navigation = useNavigation();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnails, setThumbnails] = useState({});

  const loadPlaces = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // For PlacesScreen, we want all available results (don't pass limit)
      const data = await getPopularPlaces();
      console.log(`[PlacesScreen] API returned ${data?.length || 0} places`);
      setPlaces(data || []);
      
      // Reset thumbnails when loading new data
      if (!isRefresh) {
        setThumbnails({});
      }
    } catch (err) {
      console.error("loadPlaces error", err);
      setError("Failed to load places");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load thumbnails in batches
  useEffect(() => {
    if (places.length === 0) return;

    let mounted = true;
    const batchSize = 10; // Load 10 images at a time
    let currentBatch = 0;

    async function loadThumbnailsBatch() {
      while (currentBatch * batchSize < places.length && mounted) {
        const start = currentBatch * batchSize;
        const end = Math.min(start + batchSize, places.length);
        const batch = places.slice(start, end);

        // Load this batch in parallel
        const batchPromises = batch.map(async (place) => {
          const placeId = place.place_id || place.data_id || place.cid || place.data_cid;
          
          if (!place.photos_link) {
            return { placeId, thumbnail: null };
          }

          try {
            const photos = await getPlacePhotos(place.photos_link);
            return { placeId, thumbnail: photos[0] || null };
          } catch (err) {
            console.log(`Error loading thumbnail for ${place.title}:`, err);
            return { placeId, thumbnail: null };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        if (mounted) {
          setThumbnails(prev => {
            const newThumbnails = { ...prev };
            batchResults.forEach(({ placeId, thumbnail }) => {
              if (placeId) {
                newThumbnails[placeId] = thumbnail;
              }
            });
            return newThumbnails;
          });
        }

        currentBatch++;
        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    loadThumbnailsBatch();

    return () => {
      mounted = false;
    };
  }, [places]);

  useEffect(() => {
    loadPlaces(false);
  }, [loadPlaces]);

  // Memoize renderItem to prevent recreating on every render
  const renderItem = useCallback(
    ({ item }) => {
      const placeId = item.place_id || item.data_id || item.cid || item.data_cid;
      const thumbnail = thumbnails[placeId];
      
      return (
        <PlaceCard
          place={item}
          thumbnail={thumbnail}
          onPress={() => navigation.navigate("PlaceDetail", { place: item })}
        />
      );
    },
    [navigation, thumbnails]
  );

  // Memoize keyExtractor to prevent recreating on every render
  const keyExtractor = useCallback((item, index) => {
    // SerpAPI uses different ID fields
    const stableId =
      item.place_id ||
      item.data_id ||
      item.cid ||
      item.data_cid;

    // ensure a unique, string key per item
    return stableId ? `place-${stableId}` : `place-${index}`;
  }, []);

  if (loading && places.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#2D3748" />
          <Text style={styles.loadingText}>Discovering amazing places...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Places in Qatar</Text>
          <Text style={styles.headerSubtitle}>
            {places.length} destinations to explore
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPlaces(false)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={places}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPlaces(true)}
            tintColor="#2D3748"
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={100}
        initialNumToRender={15}
        windowSize={5}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#4A5568",
    fontSize: isTablet ? 16 : 15,
    fontWeight: "500",
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 24 : 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 34 : 28,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: "#718096",
    fontWeight: "500",
  },

  // Error
  errorContainer: {
    backgroundColor: "#FFFFFF",
    margin: isTablet ? 32 : 20,
    padding: isTablet ? 32 : 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: isTablet ? '90%' : 'auto',
  },
  errorIcon: {
    fontSize: isTablet ? 60 : 48,
    marginBottom: 12,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: isTablet ? 16 : 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2D3748",
    paddingHorizontal: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 12 : 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
  },

  // List
  listContent: {
    padding: isTablet ? 32 : 20,
    paddingBottom: 40,
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },

  // Card
  card: {
    marginBottom: isTablet ? 24 : 16,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: isTablet ? 300 : 200,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  ratingBadge: {
    position: "absolute",
    top: isTablet ? 16 : 12,
    right: isTablet ? 16 : 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 8 : 7,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: isTablet ? 14 : 13,
    fontWeight: "700",
    color: "#2D3748",
  },
  placeholderContainer: {
    width: "100%",
    height: isTablet ? 300 : 200,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: isTablet ? 80 : 64,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: isTablet ? 14 : 13,
    color: "#A0AEC0",
    fontWeight: "500",
  },

  // Card Content
  cardContent: {
    padding: isTablet ? 24 : 16,
  },
  title: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: isTablet ? 10 : 8,
    lineHeight: isTablet ? 28 : 24,
  },
  typeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: 10,
    marginBottom: isTablet ? 14 : 12,
  },
  typeText: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoSection: {
    gap: isTablet ? 10 : 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: isTablet ? 16 : 14,
    marginRight: isTablet ? 8 : 6,
  },
  infoText: {
    fontSize: isTablet ? 15 : 13,
    color: "#718096",
    fontWeight: "500",
    flex: 1,
  },
  reviewsText: {
    fontSize: isTablet ? 13 : 12,
    color: "#A0AEC0",
    fontWeight: "500",
    marginTop: 4,
  },
});