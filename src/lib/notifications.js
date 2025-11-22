// src/lib/notifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// How notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Ask the user for notification permissions (call once on app start)
export async function requestNotificationPermissionsIfNeeded() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a local notification for a specific Date.
 * @param {Object} params
 * @param {Date} params.date - When to fire the notification
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @returns {Promise<string | null>} - notificationId or null if failed
 */
export async function scheduleEventReminder({ date, title, body }) {
  try {
    const hasPermission = await requestNotificationPermissionsIfNeeded();
    if (!hasPermission) {
      console.log('Notifications not permitted');
      return null;
    }

    // iOS requires a date trigger object; Android accepts Date directly
    const trigger =
      Platform.OS === 'ios'
        ? {
            date,
          }
        : date;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger,
    });

    console.log('Scheduled notification with id:', id);
    return id;
  } catch (e) {
    console.log('scheduleEventReminder error:', e);
    return null;
  }
}

/**
 * Cancel a scheduled notification by id.
 */
export async function cancelReminder(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.log('cancelReminder error:', e);
  }
}
