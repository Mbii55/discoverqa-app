// src/screens/PlaceDetailScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "../context/AuthContext";
import {
  isFavorited,
  addPlaceFavorite,
  removePlaceFavorite,
  getPlaceExternalId,
} from "../lib/favorites";
import { getPlacePhotos } from "../api/serpapiPhotos";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isAndroid = Platform.OS === 'android';
const isTablet = SCREEN_WIDTH >= 600;

function cleanQuotedText(text) {
  if (!text) return null;
  return text.replace(/^"|"$/g, "");
}

function getOpeningHours(place) {
  // SerpAPI uses 'hours' field
  if (Array.isArray(place.hours)) return place.hours;
  if (Array.isArray(place.opening_hours)) return place.opening_hours;
  if (Array.isArray(place.operating_hours)) return place.operating_hours;
  return null;
}

export default function PlaceDetailScreen({ route }) {
  const { place } = route.params;
  const { user } = useAuth();

  const [isFav, setIsFav] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // SerpAPI uses gps_coordinates object
  const coords = {
    latitude: place.gps_coordinates?.latitude || place.latitude,
    longitude: place.gps_coordinates?.longitude || place.longitude,
  };
  const openingHours = getOpeningHours(place);
  const openState = place.open_state;
  const hasCoords = !!coords.latitude && !!coords.longitude;

  // SerpAPI field names
  const phone = place.phone;
  const reviews = place.reviews;

  useEffect(() => {
    let isMounted = true;

    async function checkFavorite() {
      if (!user) return;
      try {
        const fav = await isFavorited({
          userId: user.id,
          itemType: "place",
          externalId: getPlaceExternalId(place),
        });
        if (isMounted) setIsFav(fav);
      } catch (e) {
        console.log("check favorite error (place):", e);
      }
    }

    checkFavorite();
    return () => {
      isMounted = false;
    };
  }, [user, place]);

  const handleToggleFavorite = async () => {
    if (!user) {
      console.log("Must be logged in to favorite");
      return;
    }
    if (loadingFav) return;

    try {
      setLoadingFav(true);
      if (isFav) {
        await removePlaceFavorite(user.id, place);
        setIsFav(false);
      } else {
        await addPlaceFavorite(user.id, place);
        setIsFav(true);
      }
    } catch (e) {
      console.log("toggle place favorite error:", e);
    } finally {
      setLoadingFav(false);
    }
  };

  // Load photos using SerpAPI Photos API
  useEffect(() => {
    let active = true;

    async function loadPhotos() {
      if (!place.photos_link) {
        console.log("[PlaceDetail] No photos_link available");
        setLoadingPhotos(false);
        return;
      }

      setLoadingPhotos(true);
      const urls = await getPlacePhotos(place.photos_link);
      if (active) {
        setPhotos(urls);
        setLoadingPhotos(false);
      }
    }

    loadPhotos();
    return () => {
      active = false;
    };
  }, [place.photos_link]);

  const openViewerAt = (index) => {
    if (!photos || photos.length === 0) return;
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const handleOpenWebsite = () => {
    if (!place.website) return;
    let url = place.website;
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open website", err)
    );
  };

  const handleCall = () => {
    if (!phone) return;
    const telUrl = `tel:${phone}`;
    Linking.openURL(telUrl).catch((err) =>
      console.warn("Failed to initiate call", err)
    );
  };

  const handleOpenMaps = () => {
    if (!hasCoords) return;

    const { latitude, longitude } = coords;
    const label = place.title || "Location";

    const url =
      Platform.OS === "android"
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(
            label
          )}`;

    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open maps", err)
    );
  };

  const renderViewerItem = ({ item }) => (
    <View style={styles.viewerImageWrapper}>
      <Image
        source={{ uri: item }}
        style={styles.viewerImage}
        resizeMode="contain"
      />
    </View>
  );

  // Get first photo as hero image (prioritize fetched photos over low-quality thumbnail)
  const heroImage = photos.length > 0 ? photos[0] : place.thumbnail;

  return (
    <>
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image */}
          {loadingPhotos && !heroImage ? (
            <View style={styles.noImageContainer}>
              <ActivityIndicator size="large" color="#2D3748" />
              <TouchableOpacity
                onPress={handleToggleFavorite}
                disabled={loadingFav}
                style={styles.favoriteButton}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={isFav ? "favorite" : "favorite-border"} 
                  size={isAndroid ? 24 : 26} 
                  color="#E53E3E" 
                />
              </TouchableOpacity>
            </View>
          ) : heroImage ? (
            <View style={styles.heroImageContainer}>
              <Image source={{ uri: heroImage }} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
              
              <TouchableOpacity
                onPress={handleToggleFavorite}
                disabled={loadingFav}
                style={styles.favoriteButton}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={isFav ? "favorite" : "favorite-border"} 
                  size={isAndroid ? 24 : 26} 
                  color="#E53E3E" 
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageIcon}>🏛️</Text>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                disabled={loadingFav}
                style={styles.favoriteButton}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={isFav ? "favorite" : "favorite-border"} 
                  size={isAndroid ? 24 : 26} 
                  color="#E53E3E" 
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{place.title}</Text>
            {place.type && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{place.type}</Text>
              </View>
            )}
          </View>

          {/* Rating Card */}
          {(place.rating || reviews) && (
            <View style={styles.ratingCard}>
              <View style={styles.ratingLeft}>
                <Text style={styles.ratingNumber}>{place.rating || "N/A"}</Text>
                <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
              </View>
              {reviews && (
                <View style={styles.ratingRight}>
                  <Text style={styles.reviewCount}>{reviews}</Text>
                  <Text style={styles.reviewLabel}>Reviews</Text>
                </View>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            {phone && (
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <MaterialIcons name="phone" size={isAndroid ? 22 : 24} color="#2D3748" />
                <Text style={styles.actionLabel}>Call</Text>
              </TouchableOpacity>
            )}
            {place.website && (
              <TouchableOpacity style={styles.actionButton} onPress={handleOpenWebsite}>
                <MaterialIcons name="language" size={isAndroid ? 22 : 24} color="#2D3748" />
                <Text style={styles.actionLabel}>Website</Text>
              </TouchableOpacity>
            )}
            {hasCoords && (
              <TouchableOpacity style={styles.actionButton} onPress={handleOpenMaps}>
                <MaterialIcons name="directions" size={isAndroid ? 22 : 24} color="#2D3748" />
                <Text style={styles.actionLabel}>Directions</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosScroll}
              >
                {photos.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => openViewerAt(idx)}
                    style={styles.photoItem}
                  >
                    <Image source={{ uri: url }} style={styles.photoImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            {openState && (
              <DetailRow 
                icon={<MaterialIcons name="access-time" size={22} color="#4A5568" />} 
                label="Status" 
                value={openState} 
              />
            )}

            {place.address && (
              <DetailRow 
                icon={<MaterialIcons name="place" size={22} color="#4A5568" />} 
                label="Address" 
                value={place.address} 
              />
            )}

            {phone && (
              <DetailRow 
                icon={<MaterialIcons name="phone" size={22} color="#4A5568" />} 
                label="Phone" 
                value={phone} 
              />
            )}

            {place.website && (
              <DetailRow 
                icon={<MaterialIcons name="language" size={22} color="#4A5568" />} 
                label="Website" 
                value={place.website}
                truncate
              />
            )}
          </View>

          {/* Opening Hours */}
          {openingHours && openingHours.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opening Hours</Text>
              <View style={styles.hoursContainer}>
                {openingHours.map((line, idx) => (
                  <Text key={idx} style={styles.hoursText}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {place.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{place.description}</Text>
            </View>
          )}

          {/* User Review */}
          {place.user_review && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Review</Text>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewQuote}>"</Text>
                <Text style={styles.reviewText}>
                  {cleanQuotedText(place.user_review)}
                </Text>
              </View>
            </View>
          )}

          {/* Map */}
          {hasCoords && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity activeOpacity={0.9} onPress={handleOpenMaps}>
                <MapView
                  style={styles.map}
                  pointerEvents="none"
                  initialRegion={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                    }}
                    title={place.title}
                    description={place.address}
                  />
                </MapView>
                <View style={styles.mapOverlay}>
                  <Text style={styles.mapOverlayText}>Tap to open in Maps</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Full-Screen Image Viewer */}
      <Modal
        visible={viewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={styles.viewerContainer}>
          {/* Header with close button - positioned absolutely */}
          <View style={styles.viewerHeaderContainer}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerCounter}>
                {photos.length > 0 ? viewerIndex + 1 : 0} / {photos.length}
              </Text>
              <TouchableOpacity
                onPress={() => setViewerVisible(false)}
                style={styles.viewerCloseButton}
                activeOpacity={0.7}
              >
                <Text style={styles.viewerClose}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            keyExtractor={(_, idx) => String(idx)}
            renderItem={renderViewerItem}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setViewerIndex(idx);
            }}
          />
        </View>
      </Modal>
    </>
  );
}

function DetailRow({ icon, label, value, truncate }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconContainer}>{icon}</View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={truncate ? 1 : undefined}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    maxWidth: isTablet ? 1000 : '100%',
    width: '100%',
    alignSelf: 'center',
  },

  // Hero Image
  heroImageContainer: {
    width: "100%",
    height: isTablet ? 400 : (isAndroid ? 260 : 280),
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  noImageContainer: {
    width: "100%",
    height: isTablet ? 400 : (isAndroid ? 260 : 280),
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageIcon: {
    fontSize: isTablet ? 80 : 60,
  },
  favoriteButton: {
    position: "absolute",
    top: isTablet ? 24 : 16,
    right: isTablet ? 24 : 16,
    width: isTablet ? 56 : (isAndroid ? 46 : 50),
    height: isTablet ? 56 : (isAndroid ? 46 : 50),
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 28 : (isAndroid ? 23 : 25),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: isTablet ? 24 : (isAndroid ? 18 : 20),
    paddingBottom: isTablet ? 20 : (isAndroid ? 14 : 16),
  },
  title: {
    fontSize: isTablet ? 32 : (isAndroid ? 22 : 26),
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 10,
    lineHeight: isTablet ? 38 : (isAndroid ? 28 : 32),
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: isTablet ? 14 : (isAndroid ? 10 : 12),
    paddingVertical: isTablet ? 8 : (isAndroid ? 5 : 6),
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: isTablet ? 13 : (isAndroid ? 11 : 12),
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Rating Card
  ratingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: isTablet ? 32 : 20,
    marginTop: 16,
    padding: isTablet ? 24 : (isAndroid ? 14 : 16),
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  ratingLeft: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    paddingRight: isTablet ? 24 : (isAndroid ? 14 : 16),
  },
  ratingNumber: {
    fontSize: isTablet ? 40 : (isAndroid ? 28 : 32),
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  ratingStars: {
    fontSize: isTablet ? 16 : (isAndroid ? 13 : 14),
  },
  ratingRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: isTablet ? 24 : (isAndroid ? 14 : 16),
  },
  reviewCount: {
    fontSize: isTablet ? 32 : (isAndroid ? 22 : 24),
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  reviewLabel: {
    fontSize: isTablet ? 14 : (isAndroid ? 12 : 13),
    color: "#718096",
    fontWeight: "500",
  },

  // Actions
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: isTablet ? 32 : 20,
    marginTop: 16,
    gap: isTablet ? 16 : (isAndroid ? 8 : 10),
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: isTablet ? 18 : (isAndroid ? 12 : 14),
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionLabel: {
    fontSize: isTablet ? 13 : (isAndroid ? 11 : 12),
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 4,
  },

  // Section
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    paddingHorizontal: isTablet ? 32 : 20,
    paddingVertical: isTablet ? 24 : (isAndroid ? 18 : 20),
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : (isAndroid ? 16 : 18),
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 16,
  },

  // Photos
  photosScroll: {
    gap: isTablet ? 16 : 12,
    paddingRight: isTablet ? 32 : 0,
  },
  photoItem: {
    width: isTablet ? 240 : (isAndroid ? 150 : 160),
    height: isTablet ? 180 : (isAndroid ? 110 : 120),
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photosLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photosLoadingText: {
    color: "#718096",
    fontSize: isTablet ? 15 : (isAndroid ? 13 : 14),
    fontWeight: "500",
  },

  // Detail Row
  detailRow: {
    flexDirection: "row",
    marginBottom: isTablet ? 18 : (isAndroid ? 14 : 16),
    alignItems: "center",
  },
  detailIconContainer: {
    marginRight: isTablet ? 16 : 12,
    width: isTablet ? 28 : 24,
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: isTablet ? 13 : (isAndroid ? 11 : 12),
    color: "#718096",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: isTablet ? 16 : (isAndroid ? 14 : 15),
    color: "#2D3748",
    fontWeight: "500",
  },

  // Opening Hours
  hoursContainer: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: isTablet ? 18 : (isAndroid ? 12 : 14),
  },
  hoursText: {
    fontSize: isTablet ? 15 : (isAndroid ? 13 : 14),
    color: "#4A5568",
    marginBottom: isTablet ? 8 : 6,
    fontWeight: "500",
  },

  // Description
  description: {
    fontSize: isTablet ? 16 : (isAndroid ? 14 : 15),
    color: "#4A5568",
    lineHeight: isTablet ? 26 : (isAndroid ? 22 : 24),
  },

  // Review Card
  reviewCard: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: isTablet ? 20 : (isAndroid ? 14 : 16),
    borderLeftWidth: 4,
    borderLeftColor: "#2D3748",
  },
  reviewQuote: {
    fontSize: isTablet ? 36 : (isAndroid ? 28 : 32),
    color: "#2D3748",
    fontWeight: "700",
    lineHeight: isTablet ? 36 : (isAndroid ? 28 : 32),
    marginBottom: 8,
  },
  reviewText: {
    fontSize: isTablet ? 16 : (isAndroid ? 14 : 15),
    color: "#4A5568",
    lineHeight: isTablet ? 24 : (isAndroid ? 20 : 22),
    fontStyle: "italic",
  },

  // Map
  map: {
    width: "100%",
    height: isTablet ? 300 : (isAndroid ? 180 : 200),
    borderRadius: 12,
    overflow: "hidden",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: isTablet ? 12 : (isAndroid ? 8 : 10),
    paddingHorizontal: isTablet ? 16 : (isAndroid ? 12 : 14),
    borderRadius: 8,
    alignItems: "center",
  },
  mapOverlayText: {
    fontSize: isTablet ? 14 : (isAndroid ? 12 : 13),
    color: "#2D3748",
    fontWeight: "600",
  },

  // Image Viewer
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewerHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerCounter: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewerCloseButton: {
    width: isTablet ? 50 : 44,
    height: isTablet ? 50 : 44,
    borderRadius: isTablet ? 25 : 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    fontSize: isTablet ? 28 : 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  viewerImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});