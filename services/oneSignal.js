import OneSignal from 'react-native-onesignal';

// Replace with your OneSignal App ID when you have it
const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';

export const initializeOneSignal = () => {
  // Initialize OneSignal
  OneSignal.initialize(ONESIGNAL_APP_ID);

  // Request notification permissions
  OneSignal.Notifications.requestPermission(true);

  // Handle notification opened
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('OneSignal: notification clicked:', event);
  });

  // Handle notification received while app in foreground
  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
    console.log('OneSignal: notification will display in foreground:', event);
    // Complete with null means don't display alert
    // Complete with notification means display
    event.complete(event.notification);
  });
};

// Function to get push token
export const getPushToken = async () => {
  const deviceState = await OneSignal.getDeviceState();
  return deviceState.pushToken;
};

// Function to get OneSignal User ID
export const getOnesignalUserId = async () => {
  const deviceState = await OneSignal.getDeviceState();
  return deviceState.userId;
};

// Function to add external user ID
export const setExternalUserId = (externalUserId) => {
  OneSignal.login(externalUserId);
};

// Function to add user tags
export const addUserTags = (tags) => {
  OneSignal.User.addTags(tags);
};

// Function to remove external user ID
export const removeExternalUserId = () => {
  OneSignal.logout();
}; 