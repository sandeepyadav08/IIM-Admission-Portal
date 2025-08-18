import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../frontend-expo/config';

const NOTIFICATION_STORAGE_KEY = '@notifications';
const baseURL = API_URL || 'http://localhost:5000';

export const saveNotification = async (notification) => {
  try {
    const existingNotifications = await getNotifications();
    const updatedNotifications = [notification, ...existingNotifications];
    await AsyncStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );
    return true;
  } catch (error) {
    console.error('Error saving notification:', error);
    return false;
  }
};

export const getNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));
    await AsyncStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    await AsyncStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Fetch recent activities from backend
export const fetchRecentActivities = async () => {
  try {
    const response = await fetch(`${baseURL}/api/notifications/recent-activities`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

// Fetch important dates from backend
export const fetchImportantDates = async () => {
  try {
    const response = await fetch(`${baseURL}/api/notifications/important-dates`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching important dates:', error);
    return [];
  }
};

// Convert activities to notifications and save them
export const syncActivitiesAsNotifications = async () => {
  try {
    const activities = await fetchRecentActivities();
    const notifications = activities.map((activity, index) => ({
      id: `activity_${Date.now()}_${index}`,
      title: activity.title,
      body: activity.description,
      data: {
        type: 'activity',
        category: activity.category || 'general',
        program: activity.program || 'General'
      },
      timestamp: activity.time || new Date().toISOString(),
      isRead: false
    }));

    // Save new notifications
    for (const notification of notifications) {
      await saveNotification(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error syncing activities as notifications:', error);
    return [];
  }
};