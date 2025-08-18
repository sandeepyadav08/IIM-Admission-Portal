import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import OneSignal from 'react-native-onesignal';
import {
  getNotifications,
  clearAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  saveNotification,
} from '../services/notificationService';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    setupOneSignalHandlers();
  }, []);

  const setupOneSignalHandlers = () => {
    // Handle notification received while app is open
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      console.log('New notification received:', event);
      const notification = {
        id: event.notification.notificationId,
        title: event.notification.title,
        message: event.notification.body,
        isRead: false,
        timestamp: new Date().toISOString(),
      };
      handleNewNotification(notification);
      event.complete(event.notification);
    });

    // Handle notification opened
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('Notification clicked:', event);
      if (event.notification.notificationId) {
        handleMarkAsRead(event.notification.notificationId);
      }
    });
  };

  const handleNewNotification = async (notification) => {
    console.log('Saving new notification:', notification);
    try {
      await saveNotification(notification);
      await loadNotifications();
    } catch (error) {
      console.error('Error saving new notification:', error);
    }
  };

  const loadNotifications = async () => {
    console.log('Loading notifications...');
    try {
      setLoading(true);
      const storedNotifications = await getNotifications();
      console.log('Loaded notifications:', storedNotifications);
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log('Marking all notifications as read...');
    try {
      const success = await markAllNotificationsAsRead();
      if (success) {
        await loadNotifications();
        Alert.alert('Success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            console.log('Clearing all notifications...');
            try {
              const success = await clearAllNotifications();
              if (success) {
                setNotifications([]);
                Alert.alert('Success', 'All notifications cleared');
              }
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleMarkAsRead = async (notificationId) => {
    console.log('Marking notification as read:', notificationId);
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        console.log('Successfully marked as read, reloading notifications...');
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.isRead ? '#f8f8f8' : '#fff' },
      ]}
      onPress={() => {
        console.log('Notification pressed:', item.id);
        handleMarkAsRead(item.id);
      }}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleMarkAllAsRead}>
            <Text style={styles.headerButtonText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.clearButton]}
            onPress={handleClearAll}>
            <Text style={[styles.headerButtonText, styles.clearButtonText]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          onRefresh={loadNotifications}
          refreshing={loading}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8e8e8',
    minWidth: 120,
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FFE5E5',
  },
  clearButtonText: {
    color: '#FF3B30',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    alignSelf: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationScreen; 