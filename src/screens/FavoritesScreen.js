// src/screens/FavoritesScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from "../../config";
import { useAuth } from "../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;

function FavoriteCard({ item, onPress }) {
  const isEvent = item.item_type === "event";
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeIndicator, isEvent ? styles.typeEvent : styles.typePlace]} />
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {isEvent ? "Event" : "Place"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        {item.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}

        {item.address && (
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setFavorites(data || []);
      } catch (e) {
        console.log("loadFavorites error:", e);
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      loadFavorites(false);
    }, [loadFavorites])
  );

  const handleOpenFavorite = (fav) => {
    if (fav.item_type === "event") {
      if (!fav.raw_data) {
        console.log("No raw_data for event favorite yet");
        return;
      }
      navigation.navigate("EventDetail", { event: fav.raw_data });
    } else if (fav.item_type === "place") {
      if (!fav.raw_data) {
        console.log("No raw_data for place favorite yet");
        return;
      }
      navigation.navigate("PlaceDetail", { place: fav.raw_data });
    }
  };

  const filteredFavorites =
    filterType === "all"
      ? favorites
      : favorites.filter((f) => f.item_type === filterType);

  const placesCount = favorites.filter(f => f.item_type === "place").length;
  const eventsCount = favorites.filter(f => f.item_type === "event").length;

  if (!user) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top", "left", "right"]}>
        <View style={styles.emptyState}>
          <MaterialIcons name="lock-outline" size={64} color="#4A5568" />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>
            Please log in to save and view your favorite places and events.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top", "left", "right"]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#2D3748" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{placesCount}</Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{eventsCount}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton
          label="All"
          count={favorites.length}
          active={filterType === "all"}
          onPress={() => setFilterType("all")}
        />
        <FilterButton
          label="Places"
          count={placesCount}
          active={filterType === "place"}
          onPress={() => setFilterType("place")}
        />
        <FilterButton
          label="Events"
          count={eventsCount}
          active={filterType === "event"}
          onPress={() => setFilterType("event")}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadFavorites(false)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>
            {filterType === "all" ? "💫" : filterType === "place" ? "📍" : "🎫"}
          </Text>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            {filterType === "all"
              ? "Start exploring and save your favorite places and events!"
              : `You haven't saved any ${filterType === "place" ? "places" : "events"} yet.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={() => handleOpenFavorite(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => loadFavorites(true)}
        />
      )}
    </SafeAreaView>
  );
}

function FilterButton({ label, count, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
        {label}
      </Text>
      <View style={[styles.filterCount, active && styles.filterCountActive]}>
        <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isTablet ? 13 : 12,
    color: "#718096",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: isTablet ? 20 : 16,
  },

  // Filter
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: isTablet ? 32 : 20,
    paddingVertical: isTablet ? 20 : 16,
    gap: isTablet ? 14 : 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 16 : 12,
    borderRadius: 12,
    gap: isTablet ? 8 : 6,
  },
  filterButtonActive: {
    backgroundColor: "#2D3748",
  },
  filterLabel: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
    color: "#4A5568",
  },
  filterLabelActive: {
    color: "#FFFFFF",
  },
  filterCount: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: isTablet ? 10 : 8,
    paddingVertical: isTablet ? 3 : 2,
    borderRadius: 10,
    minWidth: isTablet ? 28 : 24,
    alignItems: "center",
  },
  filterCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterCountText: {
    fontSize: isTablet ? 13 : 12,
    fontWeight: "700",
    color: "#4A5568",
  },
  filterCountTextActive: {
    color: "#FFFFFF",
  },

  // Error
  errorContainer: {
    backgroundColor: "#FFFFFF",
    margin: isTablet ? 32 : 20,
    padding: isTablet ? 36 : 28,
    borderRadius: 16,
    alignItems: "center",
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2D3748",
    paddingHorizontal: isTablet ? 40 : 32,
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isTablet ? 60 : 40,
  },
  emptyIcon: {
    fontSize: isTablet ? 72 : 60,
  },
  emptyTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 8,
    marginTop: 16,
  },
  emptyText: {
    fontSize: isTablet ? 16 : 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: isTablet ? 24 : 22,
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
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 18 : 16,
    marginBottom: isTablet ? 16 : 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  typeIndicator: {
    width: isTablet ? 8 : 6,
    alignSelf: "stretch",
  },
  typePlace: {
    backgroundColor: "#2D3748",
  },
  typeEvent: {
    backgroundColor: "#718096",
  },
  cardHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: isTablet ? 18 : 14,
    paddingLeft: isTablet ? 16 : 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    color: "#2D3748",
    lineHeight: isTablet ? 24 : 22,
    marginRight: 10,
  },
  typeBadge: {
    backgroundColor: "#F7F8FA",
    paddingHorizontal: isTablet ? 12 : 10,
    paddingVertical: isTablet ? 6 : 5,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: isTablet ? 18 : 14,
    paddingBottom: isTablet ? 18 : 14,
    paddingLeft: isTablet ? 24 : 18,
  },
  subtitle: {
    fontSize: isTablet ? 14 : 13,
    color: "#718096",
    fontWeight: "500",
    marginBottom: isTablet ? 8 : 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIcon: {
    fontSize: isTablet ? 15 : 13,
    marginRight: isTablet ? 8 : 6,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: isTablet ? 14 : 13,
    color: "#718096",
    lineHeight: isTablet ? 20 : 18,
  },
});