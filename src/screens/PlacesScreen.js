// src/screens/PlacesScreen.js
import React, { useEffect, useState, useCallback } from "react";
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
import { getPopularPlaces } from "../api/serperPlaces";
import { getPlaceImages } from "../api/serperImages";

const { width: screenWidth } = Dimensions.get("window");

function PlaceCard({ place, onPress }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadThumbnail() {
      if (!place.title) {
        setLoadingImage(false);
        return;
      }

      try {
        const images = await getPlaceImages(place.title);
        if (mounted && images.length > 0) {
          setThumbnail(images[0]); // Use first image as thumbnail
        }
      } catch (err) {
        console.log("Error loading thumbnail:", err);
      } finally {
        if (mounted) {
          setLoadingImage(false);
        }
      }
    }

    loadThumbnail();

    return () => {
      mounted = false;
    };
  }, [place.title]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContainer}>
        {loadingImage ? (
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

            {(place.phoneNumber || place.phone) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {place.phoneNumber || place.phone}
                </Text>
              </View>
            )}

            {(place.ratingCount || place.reviews) && (
              <Text style={styles.reviewsText}>
                {place.ratingCount || place.reviews} reviews
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PlacesScreen() {
  const navigation = useNavigation();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPlaces = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Request all available results (no limit - will get all pages)
      const data = await getPopularPlaces({ limit: Infinity });
      setPlaces(data || []);
    } catch (err) {
      console.error("loadPlaces error", err);
      setError("Failed to load places");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces(false);
  }, [loadPlaces]);

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
        keyExtractor={(item) => 
          item.placeId || item.place_id || item.cid || item.data_id || String(item.position)
        }
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => navigation.navigate("PlaceDetail", { place: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPlaces(true)}
            tintColor="#2D3748"
          />
        }
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
    fontSize: 15,
    fontWeight: "500",
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },

  // Error
  errorContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2D3748",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // List
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Card
  card: {
    marginBottom: 16,
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
    height: 200,
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
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D3748",
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: "#A0AEC0",
    fontWeight: "500",
  },

  // Card Content
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 8,
    lineHeight: 24,
  },
  typeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
    flex: 1,
  },
  reviewsText: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "500",
    marginTop: 4,
  },
});