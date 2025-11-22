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

const { width: screenWidth } = Dimensions.get("window");

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
    fontSize: 15,
    fontWeight: "500",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2D3748",
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: "#2D3748",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Error
  errorContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 28,
    borderRadius: 16,
    alignItems: "center",
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2D3748",
    paddingHorizontal: 32,
    paddingVertical: 12,
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

  // Event Card
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    width: 90,
    backgroundColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  dateContainer: {
    alignItems: "center",
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateDay: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 34,
    marginBottom: 2,
  },
  dateYear: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  cardRight: {
    flex: 1,
  },
  cardContent: {
    padding: 16,
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D3748",
    lineHeight: 23,
    marginBottom: 12,
  },
  metaRow: {
    gap: 10,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
    flex: 1,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2D3748",
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Load More
  loadMoreContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  endContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  endText: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "500",
  },
});