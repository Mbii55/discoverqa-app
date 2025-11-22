// src/screens/EventDetailScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useAuth } from "../context/AuthContext";
import {
  isFavorited,
  addEventFavorite,
  removeEventFavorite,
  getEventExternalId,
} from "../lib/favorites";
import { scheduleEventReminder, cancelReminder } from "../lib/notifications";

const { width: screenWidth } = Dimensions.get("window");
const isAndroid = Platform.OS === 'android';

const REMINDER_OPTIONS = [
  { label: '1 hour before', value: 60, unit: 'hour' },
  { label: '3 hours before', value: 180, unit: 'hours' },
  { label: '1 day before', value: 1440, unit: 'day' },
  { label: '2 days before', value: 2880, unit: 'days' },
  { label: '1 week before', value: 10080, unit: 'week' },
];

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "-";
  const d = new Date(dateTimeString);
  return d.toLocaleString();
}

function getAddress(event) {
  if (event.geo?.address?.formatted_address) {
    return event.geo.address.formatted_address;
  }

  if (event.entities && event.entities.length > 0) {
    const venue =
      event.entities.find((e) => e.type === "venue") || event.entities[0];
    if (venue.formatted_address) return venue.formatted_address;
    if (venue.name) return venue.name;
  }

  return "Qatar";
}

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const { user } = useAuth();

  const [isFav, setIsFav] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [reminderNotificationId, setReminderNotificationId] = useState(null);
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedReminderTime, setSelectedReminderTime] = useState(null);

  const address = getAddress(event);
  const startDate = new Date(event.start_local || event.start);
  const endDate = new Date(event.end_local || event.end);

  useEffect(() => {
    let isMounted = true;

    async function check() {
      if (!user) return;
      try {
        const fav = await isFavorited({
          userId: user.id,
          itemType: "event",
          externalId: getEventExternalId(event),
        });
        if (isMounted) setIsFav(fav);
      } catch (e) {
        console.log("check favorite error (event):", e);
      }
    }

    check();
    return () => {
      isMounted = false;
    };
  }, [user, event]);

  const handleRemindMe = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to set event reminders.",
        [{ text: "OK" }]
      );
      return;
    }

    // Check notification permissions first
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to set reminders for events.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (reminderNotificationId) {
      // Remove existing reminder
      await cancelReminder(reminderNotificationId);
      setReminderNotificationId(null);
      setSelectedReminderTime(null);
      
      Alert.alert(
        "Reminder Removed",
        `Reminder for "${event.title}" has been removed.`,
        [{ text: "OK" }]
      );
    } else {
      // Show modal to select reminder time
      setShowReminderModal(true);
    }
  };

  const handleSelectReminderTime = async (option) => {
    setShowReminderModal(false);
    setLoadingReminder(true);

    try {
      const eventStartTime = startDate.getTime();
      const currentTime = Date.now();
      const minutesBeforeEvent = option.value;
      const reminderTime = new Date(eventStartTime - minutesBeforeEvent * 60 * 1000);

      // Check if reminder time is in the past
      if (reminderTime.getTime() <= currentTime) {
        Alert.alert(
          "Invalid Time",
          "The reminder time would be in the past. Please choose a different time or this event has already started.",
          [{ text: "OK" }]
        );
        setLoadingReminder(false);
        return;
      }

      // Schedule the notification
      const notificationId = await scheduleEventReminder({
        date: reminderTime,
        title: "Event Reminder",
        body: `"${event.title}" starts in ${option.label.replace(' before', '')}!`,
      });

      if (notificationId) {
        setReminderNotificationId(notificationId);
        setSelectedReminderTime(option);

        // Send immediate confirmation notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Reminder Set ✓",
            body: `We will remind you about "${event.title}" ${option.label}`,
          },
          trigger: null, // null means immediately
        });
      } else {
        Alert.alert(
          "Error",
          "Failed to set reminder. Please make sure notifications are enabled.",
          [{ text: "OK" }]
        );
      }
    } catch (e) {
      console.log("set reminder error:", e);
      Alert.alert(
        "Error",
        "Failed to set reminder. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoadingReminder(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      console.log("Must be logged in to favorite");
      return;
    }
    if (loadingFav) return;

    try {
      setLoadingFav(true);
      if (isFav) {
        await removeEventFavorite(user.id, event);
        setIsFav(false);
      } else {
        await addEventFavorite(user.id, event);
        setIsFav(true);
      }
    } catch (e) {
      console.log("toggle event favorite error:", e);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Date */}
        <View style={styles.hero}>
          <View style={styles.dateCard}>
            <Text style={styles.dateMonth}>
              {startDate.toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
            </Text>
            <Text style={styles.dateDay}>{startDate.getDate()}</Text>
            <Text style={styles.dateYear}>{startDate.getFullYear()}</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.title}>{event.title}</Text>
            {event.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
            )}

            {/* Remind Me Button */}
            <TouchableOpacity
              style={[
                styles.remindButton,
                reminderNotificationId && styles.remindButtonActive,
                loadingReminder && styles.remindButtonDisabled
              ]}
              onPress={handleRemindMe}
              disabled={loadingReminder}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={reminderNotificationId ? "notifications-active" : "notifications-none"} 
                size={20} 
                color={reminderNotificationId ? "#FFFFFF" : "#2D3748"} 
              />
              <Text style={[
                styles.remindButtonText,
                reminderNotificationId && styles.remindButtonTextActive
              ]}>
                {reminderNotificationId 
                  ? `Reminder: ${selectedReminderTime?.label}` 
                  : "Remind Me"}
              </Text>
            </TouchableOpacity>
          </View>

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

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoCard}>
            <MaterialIcons name="place" size={isAndroid ? 26 : 28} color="#2D3748" />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Location</Text>
              <Text style={styles.quickInfoValue} numberOfLines={2}>
                {address}
              </Text>
            </View>
          </View>

          <View style={styles.quickInfoCard}>
            <MaterialIcons name="access-time" size={isAndroid ? 26 : 28} color="#2D3748" />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Start Time</Text>
              <Text style={styles.quickInfoValue}>
                {startDate.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.quickInfoCard}>
            <MaterialIcons name="schedule" size={isAndroid ? 26 : 28} color="#2D3748" />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>End Time</Text>
              <Text style={styles.quickInfoValue}>
                {endDate.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.detailsGrid}>
            <DetailItem
              label="Full Start Date"
              value={formatDateTime(event.start_local || event.start)}
            />
            <DetailItem
              label="Full End Date"
              value={formatDateTime(event.end_local || event.end)}
            />

            {event.phq_attendance != null && (
              <DetailItem
                label="Estimated Attendance"
                value={event.phq_attendance.toLocaleString()}
                icon={<MaterialIcons name="people" size={22} color="#4A5568" />}
              />
            )}

            {event.predicted_event_spend != null && (
              <DetailItem
                label="Predicted Spend"
                value={`${event.predicted_event_spend} QAR`}
                icon={<MaterialIcons name="payments" size={22} color="#4A5568" />}
              />
            )}
          </View>
        </View>

        {/* Labels Section */}
        {event.phq_labels && event.phq_labels.length > 0 && (
          <View style={styles.labelsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.labelsContainer}>
              {event.phq_labels.map((label, index) => (
                <View key={index} style={styles.labelChip}>
                  <Text style={styles.labelChipText}>{label.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description Section */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}
      </ScrollView>

      {/* Reminder Time Selection Modal */}
      <Modal
        visible={showReminderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Reminder</Text>
              <TouchableOpacity
                onPress={() => setShowReminderModal(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              When would you like to be reminded?
            </Text>

            <View style={styles.reminderOptions}>
              {REMINDER_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.reminderOption}
                  onPress={() => handleSelectReminderTime(option)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="schedule" size={24} color="#2D3748" />
                  <Text style={styles.reminderOptionText}>{option.label}</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#A0AEC0" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <View style={styles.detailItem}>
      {icon && <View style={styles.detailIconContainer}>{icon}</View>}
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
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
  },

  // Hero Section
  hero: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    marginBottom: 16,
  },
  dateCard: {
    alignSelf: "flex-start",
    backgroundColor: "#2D3748",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
    minWidth: 80,
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
  },
  dateYear: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  heroContent: {
    flex: 1,
    marginBottom: 0,
    paddingRight: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2D3748",
    lineHeight: 32,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: "absolute",
    top: 24,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  favoriteIcon: {
    fontSize: 26,
  },

  // Quick Info
  quickInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: isAndroid ? 10 : 12,
  },
  quickInfoCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: isAndroid ? 14 : 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickInfoContent: {
    flex: 1,
    marginLeft: isAndroid ? 12 : 14,
  },
  quickInfoLabel: {
    fontSize: isAndroid ? 11 : 12,
    color: "#718096",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickInfoValue: {
    fontSize: isAndroid ? 14 : 15,
    color: "#2D3748",
    fontWeight: "600",
  },

  // Details Section
  detailsSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "500",
  },

  // Labels Section
  labelsSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: isAndroid ? 18 : 20,
    marginBottom: 16,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  labelChip: {
    backgroundColor: "#F7F8FA",
    paddingHorizontal: isAndroid ? 12 : 14,
    paddingVertical: isAndroid ? 7 : 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  labelChipText: {
    fontSize: isAndroid ? 12 : 13,
    color: "#4A5568",
    fontWeight: "600",
  },

  // Description Section
  descriptionSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: isAndroid ? 18 : 20,
  },
  description: {
    fontSize: isAndroid ? 14 : 15,
    color: "#4A5568",
    lineHeight: isAndroid ? 22 : 24,
  },

  // Remind Me Button - Now in Hero
  remindButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    paddingVertical: isAndroid ? 12 : 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D3748",
    gap: 8,
  },
  remindButtonActive: {
    backgroundColor: "#2D3748",
    borderColor: "#2D3748",
  },
  remindButtonDisabled: {
    opacity: 0.6,
  },
  remindButtonText: {
    fontSize: isAndroid ? 14 : 15,
    fontWeight: "700",
    color: "#2D3748",
  },
  remindButtonTextActive: {
    color: "#FFFFFF",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: isAndroid ? 20 : 22,
    fontWeight: "700",
    color: "#2D3748",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: isAndroid ? 14 : 15,
    color: "#718096",
    marginBottom: 24,
  },
  reminderOptions: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    padding: isAndroid ? 16 : 18,
    borderRadius: 12,
    gap: 12,
  },
  reminderOptionText: {
    flex: 1,
    fontSize: isAndroid ? 15 : 16,
    fontWeight: "600",
    color: "#2D3748",
  },
});