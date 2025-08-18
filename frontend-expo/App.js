import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import ApplicantsScreen from './screens/ApplicantsScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import CourseDashboard from './screens/CourseDashboard';
import SettingsScreen from './screens/SettingsScreen';
import AdminNotificationScreen from './screens/AdminNotificationScreen';
import { ThemeProvider } from './context/ThemeContext';
import DashboardScreen from './screens/DashboardScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Component with Safe Area
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      paddingBottom: Math.max(insets.bottom, 8),
      paddingTop: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: 'row',
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'Applicants') {
          iconName = isFocused ? 'people' : 'people-outline';
        } else if (route.name === 'Schedule') {
          iconName = isFocused ? 'calendar' : 'calendar-outline';
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 6,
              justifyContent: 'center',
              minHeight: 44,
            }}
          >
            <Ionicons 
              name={iconName} 
              size={22} 
              color={isFocused ? '#8e2a6b' : '#666'} 
            />
            <Text style={{
              fontSize: 10,
              fontWeight: '600',
              color: isFocused ? '#8e2a6b' : '#666',
              marginTop: 2,
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Bottom Tab Navigator Component
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Applicants" component={ApplicantsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="dark-content" />
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Login" 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#fbefff' }
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="CourseDashboard" component={CourseDashboard} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AdminNotificationScreen" component={AdminNotificationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
