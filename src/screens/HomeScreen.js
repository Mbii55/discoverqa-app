// src/screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getQatarEvents } from "../api/predicthq";
import { getPopularPlaces } from "../api/serpapiPlaces";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isAndroid = Platform.OS === "android";
const isTablet = screenWidth >= 600;

// Component to handle individual place card with image loading
function PlaceCardItem({ place, onPress }) {
  return (
    <TouchableOpacity
      style={styles.placeCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.placeImageContainer}>
        {place.thumbnail ? (
          <>
            <Image
              source={{ uri: place.thumbnail }}
              style={styles.placeImage}
              resizeMode="cover"
            />
            <View style={styles.imageGradient} />
          </>
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderIcon}>🏛</Text>
          </View>
        )}
        {place.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {place.rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.placeContent}>
        <Text style={styles.placeTitle} numberOfLines={1}>
          {place.title}
        </Text>
        <Text style={styles.placeSubtitle} numberOfLines={1}>
          {place.type || place.address || "Doha, Qatar"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();

  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Places state
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoadingEvents(true);
        setEventsError(null);
        const json = await getQatarEvents({ limit: 8, offset: 0 });
        if (active) {
          setEvents(json.results || []);
        }
      } catch (err) {
        console.log("[Home] loadEvents error:", err);
        if (active) setEventsError("Failed to load events");
      } finally {
        if (active) setLoadingEvents(false);
      }
    }

    async function loadPlaces() {
      try {
        setLoadingPlaces(true);
        setPlacesError(null);
        const list = await getPopularPlaces({ limit: 8 });
        setPlaces(list || []);
      } catch (err) {
        console.log("[Home] loadPlaces error:", err);
        setPlacesError("Failed to load places");
      } finally {
        setLoadingPlaces(false);
      }
    }

    loadEvents();
    loadPlaces();

    return () => {
      active = false;
    };
  }, []);

  const handleOpenEvent = (event) => {
    navigation.navigate("EventDetail", { event });
  };

  const handleOpenPlace = (place) => {
    navigation.navigate("PlaceDetail", { place });
  };

  const isLoggedIn = !!user;
  const firstName = profile?.full_name || user?.user_metadata?.full_name || user?.email;
  const displayName = firstName ? firstName.split(" ")[0] : null;

  const greeting = isLoggedIn ? "Welcome back" : "Welcome to";
  const nameOrApp = displayName || "DiscoverQA";

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO HEADER */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground} />
          <View style={styles.heroContent}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{nameOrApp}</Text>
            <Text style={styles.heroSubtitle}>
              Explore the best of Qatar
            </Text>
          </View>
        </View>

        {/* QUICK NAVIGATION */}
        <View style={styles.navContainer}>
          <QuickNavButton
            label="Places"
            icon="📍"
            onPress={() => navigation.navigate("Places")}
          />
          <QuickNavButton
            label="Events"
            icon="🎫"
            onPress={() => navigation.navigate("Events")}
          />
          <QuickNavButton
            label="Favorites"
            icon="♥"
            onPress={() => navigation.navigate("Favorites")}
          />
        </View>

        {/* INSIGHTS CARD */}
        <View style={styles.insightsCard}>
          <View style={styles.insightItem}>
            <Text style={styles.insightNumber}>{events.length}</Text>
            <Text style={styles.insightLabel}>Events this week</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Text style={styles.insightNumber}>{places.length}</Text>
            <Text style={styles.insightLabel}>Top destinations</Text>
          </View>
        </View>

        {/* EVENTS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <Text style={styles.sectionSubtitle}>Don't miss out</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("Events")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loadingEvents ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4A5568" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : eventsError ? (
            <Text style={styles.errorText}>{eventsError}</Text>
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>No events available</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {events.map((event, index) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  activeOpacity={0.8}
                  onPress={() => handleOpenEvent(event)}
                >
                  <View style={styles.eventGradientBar} />
                  <View style={styles.eventContent}>
                    <View style={styles.eventDateSection}>
                      <Text style={styles.eventMonth}>
                        {new Date(event.start_local || event.start)
                          .toLocaleDateString(undefined, { month: "short" })
                          .toUpperCase()}
                      </Text>
                      <Text style={styles.eventDay}>
                        {new Date(event.start_local || event.start).getDate()}
                      </Text>
                      <Text style={styles.eventYear}>
                        {new Date(event.start_local || event.start).getFullYear()}
                      </Text>
                    </View>
                    <View style={styles.eventDivider} />
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTitle} numberOfLines={3}>
                        {event.title}
                      </Text>
                      <View style={styles.eventFooter}>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationIcon}>📍</Text>
                          <Text style={styles.eventLocation} numberOfLines={1}>
                            {event.geo?.address?.locality || event.city || "Qatar"}
                          </Text>
                        </View>
                        {event.category && (
                          <View style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{event.category}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* PLACES SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Popular Places</Text>
              <Text style={styles.sectionSubtitle}>Worth visiting</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("Places")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loadingPlaces ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4A5568" />
              <Text style={styles.loadingText}>Loading places...</Text>
            </View>
          ) : placesError ? (
            <Text style={styles.errorText}>{placesError}</Text>
          ) : places.length === 0 ? (
            <Text style={styles.emptyText}>No places available</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
            {places.map((place, index) => {
              // SerpAPI uses different ID fields
              const stableId =
                place.place_id ||
                place.data_id ||
                place.cid ||
                place.data_cid;

              return (
                <PlaceCardItem
                  key={stableId ? `home-place-${stableId}` : `home-place-${index}`}
                  place={place}
                  onPress={() => handleOpenPlace(place)}
                />
              );
            })}

            </ScrollView>
          )}
        </View>

        {/* BOTTOM TIP CARD */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Text style={styles.tipIconText}>💡</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Quick Tip</Text>
            <Text style={styles.tipText}>
              Save your favorite spots to build a personalized Qatar guide
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function QuickNavButton({ label, icon, onPress }) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
}


export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    paddingBottom: 40,
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center', 
  },

  // Hero Section
  heroSection: {
    height: isTablet ? 220 : (isAndroid ? screenHeight * 0.25 : screenHeight * 0.17),
    marginBottom: 24,
    overflow: "hidden",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#2D3748",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: isTablet ? 42 : (isAndroid ? 30 : 36),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },

  // Quick Navigation
  navContainer: {
    flexDirection: "row",
    paddingHorizontal: isTablet ? 40 : 20,
    gap: isTablet ? 20 : 12,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
    marginBottom: 24,
    marginTop: -16,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3748",
  },

  // Insights Card
  insightsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: isTablet ? 40 : 20,
    borderRadius: isAndroid ? 14 : 16,
    padding: isTablet ? 32 : (isAndroid ? 16 : 20),
    marginBottom: isAndroid ? 28 : 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: isTablet ? '90%' : 'auto',
  },
  insightItem: {
    flex: 1,
    alignItems: "center",
  },
  insightNumber: {
    fontSize: isTablet ? 40 : (isAndroid ? 28 : 32),
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: isAndroid ? 11 : 12,
    color: "#718096",
    fontWeight: "500",
    textAlign: "center",
  },
  insightDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: isAndroid ? 12 : 16,
  },

  // Section
  section: {
    marginBottom: isAndroid ? 28 : 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isAndroid ? 14 : 16,
  },
  sectionTitle: {
    fontSize: isTablet ? 26 : (isAndroid ? 20 : 22),
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: isAndroid ? 12 : 13,
    color: "#718096",
    fontWeight: "500",
  },
  viewAllButton: {
    paddingVertical: isAndroid ? 6 : 8,
    paddingHorizontal: isAndroid ? 14 : 16,
    backgroundColor: "#F7F8FA",
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: isAndroid ? 12 : 13,
    fontWeight: "600",
    color: "#4A5568",
  },

  // Horizontal Scroll
  horizontalScroll: {
    paddingLeft: isTablet ? 40 : 20,
    paddingRight: 8,
  },

  // Loading/Error/Empty
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: isAndroid ? 13 : 14,
    color: "#718096",
  },
  errorText: {
    fontSize: isAndroid ? 13 : 14,
    color: "#E53E3E",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: isAndroid ? 13 : 14,
    color: "#718096",
    paddingHorizontal: 20,
  },

  // Event Card
  eventCard: {
    width: isTablet ? 400 : screenWidth * 0.75,
    backgroundColor: "#FFFFFF",
    borderRadius: isAndroid ? 18 : 20,
    marginRight: isAndroid ? 12 : 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  eventGradientBar: {
    height: isAndroid ? 5 : 6,
    backgroundColor: "#2D3748",
  },
  eventContent: {
    flexDirection: "row",
    padding: isAndroid ? 16 : 18,
  },
  eventDateSection: {
    width: isAndroid ? 65 : 70,
    alignItems: "center",
    paddingTop: 4,
  },
  eventMonth: {
    fontSize: isAndroid ? 10 : 11,
    fontWeight: "700",
    color: "#718096",
    letterSpacing: 1,
    marginBottom: 4,
  },
  eventDay: {
    fontSize: isAndroid ? 32 : 36,
    fontWeight: "800",
    color: "#2D3748",
    lineHeight: isAndroid ? 34 : 38,
    marginBottom: 2,
  },
  eventYear: {
    fontSize: isAndroid ? 10 : 11,
    fontWeight: "600",
    color: "#A0AEC0",
  },
  eventDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: isAndroid ? 14 : 16,
  },
  eventDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: isAndroid ? 15 : 16,
    fontWeight: "600",
    color: "#2D3748",
    lineHeight: isAndroid ? 20 : 22,
    marginBottom: 12,
  },
  eventFooter: {
    gap: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    fontSize: isAndroid ? 12 : 13,
    marginRight: 4,
  },
  eventLocation: {
    fontSize: isAndroid ? 12 : 13,
    color: "#718096",
    fontWeight: "500",
    flex: 1,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: isAndroid ? 8 : 10,
    paddingVertical: isAndroid ? 4 : 5,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: isAndroid ? 9 : 10,
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Place Card
  placeCard: {
    width: isTablet ? 350 : screenWidth * 0.68,
    backgroundColor: "#FFFFFF",
    borderRadius: isAndroid ? 18 : 20,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  placeImageContainer: {
    width: "100%",
    height: isAndroid ? 160 : 180,
    position: "relative",
  },
  placeImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: isAndroid ? 44 : 48,
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: isAndroid ? 8 : 10,
    paddingVertical: isAndroid ? 5 : 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: isAndroid ? 11 : 12,
    fontWeight: "700",
    color: "#2D3748",
  },
  placeContent: {
    padding: isAndroid ? 12 : 14,
  },
  placeTitle: {
    fontSize: isAndroid ? 15 : 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  placeSubtitle: {
    fontSize: isAndroid ? 12 : 13,
    color: "#718096",
    fontWeight: "500",
  },

  // Tip Card
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: isTablet ? 40 : 20,
    borderRadius: isAndroid ? 14 : 16,
    padding: isTablet ? 24 : (isAndroid ? 14 : 16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: isTablet ? '90%' : 'auto',
  },
  tipIcon: {
    width: isAndroid ? 44 : 48,
    height: isAndroid ? 44 : 48,
    borderRadius: isAndroid ? 22 : 24,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: isAndroid ? 12 : 14,
  },
  tipIconText: {
    fontSize: isAndroid ? 22 : 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: isAndroid ? 13 : 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  tipText: {
    fontSize: isAndroid ? 12 : 13,
    color: "#718096",
    lineHeight: isAndroid ? 16 : 18,
  },
});