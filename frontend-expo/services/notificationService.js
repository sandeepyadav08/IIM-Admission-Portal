import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = '@notifications';

// Get all notifications
export const getNotifications = async () => {
  try {
    const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    return updatedNotifications;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
}; 