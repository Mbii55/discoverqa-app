// src/screens/EventsScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getQatarEvents, fetchByUrl } from "../api/predicthq";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  return date.toLocaleString();
}

function getAddress(event) {
  if (event.geo && event.geo.address && event.geo.address.formatted_address) {
    return event.geo.address.formatted_address;
  }

  if (event.entities && event.entities.length > 0) {
    const venue = event.entities.find((e) => e.type === "venue") || event.entities[0];
    if (venue.formatted_address) return venue.formatted_address;
    if (venue.name) return venue.name;
  }

  return "Doha, Qatar";
}

function EventCard({ event, onPress }) {
  const startDate = new Date(event.start_local || event.start);
  const location = event.geo?.address?.locality || event.city || "Qatar";
  
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = monthNames[startDate.getMonth()];
  const day = startDate.getDate();
  const year = startDate.getFullYear();
  
  const time = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateMonth}>{month}</Text>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateYear}>{year}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {location}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>{time}</Text>
            </View>
          </View>

          {event.category && (
            <View style={styles.categoryContainer}>
              <View style={styles.categoryDot} />
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getQatarEvents({ limit: 10, offset: 0 });

      setEvents(data.results || []);
      setNextUrl(data.next || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;

    try {
      setLoadingMore(true);

      const data = await fetchByUrl(nextUrl);

      setEvents((prev) => [...prev, ...(data.results || [])]);
      setNextUrl(data.next || null);
    } catch (err) {
      console.error("loadMore error", err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  useEffect(() => {
    loadEvents(false);
  }, [loadEvents]);

  if (loading && !refreshing && events.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top", "left", "right"]}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#2D3748" />
          </View>
          <Text style={styles.loadingText}>Discovering events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{events.length}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadEvents(false)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigation.navigate("EventDetail", { event: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            tintColor="#2D3748"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator color="#2D3748" size="small" />
            </View>
          ) : nextUrl ? null : events.length > 0 ? (
            <View style={styles.endContainer}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>No more events</Text>
              <View style={styles.endLine} />
            </View>
          ) : null
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
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    color: "#4A5568",
    fontSize: isTablet ? 16 : 15,
    fontWeight: "500",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 24 : 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 38 : 32,
    fontWeight: "700",
    color: "#2D3748",
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: "#2D3748",
    paddingHorizontal: isTablet ? 18 : 14,
    paddingVertical: isTablet ? 10 : 8,
    borderRadius: 20,
    minWidth: isTablet ? 60 : 50,
    alignItems: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: isTablet ? 16 : 15,
    fontWeight: "700",
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

  // List
  listContent: {
    padding: isTablet ? 32 : 20,
    paddingBottom: 40,
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },

  // Event Card
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 20 : 16,
    marginBottom: isTablet ? 20 : 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    width: isTablet ? 120 : 90,
    backgroundColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isTablet ? 24 : 20,
  },
  dateContainer: {
    alignItems: "center",
  },
  dateMonth: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
    marginBottom: isTablet ? 6 : 4,
  },
  dateDay: {
    fontSize: isTablet ? 40 : 32,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: isTablet ? 42 : 34,
    marginBottom: 2,
  },
  dateYear: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  cardRight: {
    flex: 1,
  },
  cardContent: {
    padding: isTablet ? 24 : 16,
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: isTablet ? 20 : 17,
    fontWeight: "600",
    color: "#2D3748",
    lineHeight: isTablet ? 26 : 23,
    marginBottom: isTablet ? 14 : 12,
  },
  metaRow: {
    gap: isTablet ? 12 : 10,
    marginBottom: isTablet ? 12 : 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    fontSize: isTablet ? 15 : 13,
    marginRight: isTablet ? 8 : 6,
  },
  metaText: {
    fontSize: isTablet ? 15 : 13,
    color: "#718096",
    fontWeight: "500",
    flex: 1,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: isTablet ? 6 : 4,
  },
  categoryDot: {
    width: isTablet ? 7 : 6,
    height: isTablet ? 7 : 6,
    borderRadius: isTablet ? 3.5 : 3,
    backgroundColor: "#2D3748",
    marginRight: isTablet ? 10 : 8,
  },
  categoryText: {
    fontSize: isTablet ? 13 : 12,
    fontWeight: "600",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Load More
  loadMoreContainer: {
    paddingVertical: isTablet ? 32 : 24,
    alignItems: "center",
  },
  endContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: isTablet ? 32 : 24,
    gap: isTablet ? 16 : 12,
  },
  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  endText: {
    fontSize: isTablet ? 13 : 12,
    color: "#A0AEC0",
    fontWeight: "500",
  },
});