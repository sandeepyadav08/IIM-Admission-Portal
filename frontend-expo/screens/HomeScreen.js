import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import dashboardService from "../services/dashboardService";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-width));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Fetch dashboard data
    fetchDashboardData();
    fetchRecentActivities();
    fetchImportantDates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getHomeSummary();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default data if API fails
      setDashboardData({
        quickStats: {
          totalApplications: 0,
          totalAdmitted: 0,
          totalUnderReview: 0,
        },
        programStats: [
          { program: "PGP", applications: 0, percentage: 0 },
          { program: "PhD", applications: 0, percentage: 0 },
          { program: "EPhD", applications: 0, percentage: 0 },
          { program: "EMBA", applications: 0, percentage: 0 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activities = await dashboardService.getRecentActivities();
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Set default activities if API fails
      setRecentActivities([
        {
          title: "New Application Received",
          description: "PGP - Computer Science",
          timeAgo: "2 hours ago",
          icon: "checkmark-circle",
          color: "#4CAF50",
        },
        {
          title: "Document Verification",
          description: "PhD - 5 Applications",
          timeAgo: "3 hours ago",
          icon: "document-text",
          color: "#2196F3",
        },
        {
          title: "Application Deadline Reminder",
          description: "15 days remaining",
          timeAgo: "5 hours ago",
          icon: "alert-circle",
          color: "#FF9800",
        },
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchImportantDates = async () => {
    try {
      setDatesLoading(true);
      const dates = await dashboardService.getImportantDates();
      setImportantDates(dates);
    } catch (error) {
      console.error("Error fetching important dates:", error);
      // Set default dates if API fails
      setImportantDates([
        {
          title: "Application Deadline",
          formattedDate: "March 15, 2025",
          description: "Final submission date",
          icon: "calendar",
          color: "#8e2a6b",
        },
        {
          title: "Admission Committee Meeting",
          formattedDate: "March 20, 2025",
          description: "Review of applications",
          icon: "school",
          color: "#8e2a6b",
        },
        {
          title: "Document Verification",
          formattedDate: "March 25, 2025",
          description: "Final verification process",
          icon: "document-text",
          color: "#8e2a6b",
        },
      ]);
    } finally {
      setDatesLoading(false);
    }
  };

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -width : 0;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    navigation.replace("Login");
  };

  const menuItems = [
    {
      icon: "school",
      title: "PGP",
      onPress: () =>
        navigation.navigate("CourseDashboard", { courseName: "PGP" }),
    },
    {
      icon: "school",
      title: "PhD",
      onPress: () =>
        navigation.navigate("CourseDashboard", { courseName: "PhD" }),
    },
    {
      icon: "school",
      title: "EPhD",
      onPress: () =>
        navigation.navigate("CourseDashboard", { courseName: "EPhD" }),
    },
    {
      icon: "school",
      title: "EMBA",
      onPress: () =>
        navigation.navigate("CourseDashboard", { courseName: "EMBA" }),
    },
    {
      icon: "settings",
      title: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: "log-out",
      title: "Logout",
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar style="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Admin Portal
          </Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("AdminNotificationScreen")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Hamburger Menu */}
        <Animated.View
          style={[
            styles.menu,
            {
              transform: [{ translateX: menuAnimation }],
              backgroundColor: colors.card,
            },
          ]}
        >
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.primary }]}>
                Menu
              </Text>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  item.onPress();
                  toggleMenu();
                }}
              >
                <Ionicons name={item.icon} size={24} color={colors.primary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.primary}
                  style={styles.menuArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Main Content */}
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.contentContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Welcome Section */}
              <View style={styles.welcomeCard}>
                <View style={styles.welcomeContent}>
                  <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Manage college admissions efficiently
                  </Text>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="people" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.statTextContainer}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#4CAF50" />
                    ) : (
                      <Text style={[styles.statNumber, { color: "#4CAF50" }]}>
                        {dashboardData?.quickStats?.totalApplications || 0}
                      </Text>
                    )}
                    <Text style={styles.statLabel}>Total Applications</Text>
                  </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#2196F3"
                    />
                  </View>
                  <View style={styles.statTextContainer}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#2196F3" />
                    ) : (
                      <Text style={[styles.statNumber, { color: "#2196F3" }]}>
                        {dashboardData?.quickStats?.totalAdmitted || 0}
                      </Text>
                    )}
                    <Text style={styles.statLabel}>Admitted</Text>
                  </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="time" size={24} color="#FF9800" />
                  </View>
                  <View style={styles.statTextContainer}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FF9800" />
                    ) : (
                      <Text style={[styles.statNumber, { color: "#FF9800" }]}>
                        {dashboardData?.quickStats?.totalUnderReview || 0}
                      </Text>
                    )}
                    <Text style={styles.statLabel}>Under Review</Text>
                  </View>
                </View>
              </View>

              {/* Program-wise Applications */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    Program-wise Applications
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      fetchDashboardData();
                      fetchRecentActivities();
                      fetchImportantDates();
                    }}
                  >
                    <Text style={styles.seeAllText}>Refresh All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.programList}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#8e2a6b" />
                      <Text style={styles.loadingText}>
                        Loading program data...
                      </Text>
                    </View>
                  ) : (
                    dashboardData?.programStats?.map((program, index) => {
                      // Dynamic color based on percentage
                      const getProgressColor = (percentage) => {
                        if (percentage >= 40) return "#4CAF50"; // Green for high
                        if (percentage >= 25) return "#2196F3"; // Blue for medium
                        if (percentage >= 15) return "#FF9800"; // Orange for low
                        return "#9C27B0"; // Purple for very low
                      };

                      return (
                        <View key={index} style={styles.programItem}>
                          <View style={styles.programInfo}>
                            <Text style={styles.programName}>
                              {program.program}
                            </Text>
                            <Text style={styles.programStats}>
                              {program.applications} Applications (
                              {program.percentage}%)
                            </Text>
                          </View>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${Math.max(program.percentage, 5)}%`, // Minimum 5% for visibility
                                  backgroundColor: getProgressColor(
                                    program.percentage
                                  ),
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>

              {/* Recent Activities */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Recent Activities</Text>
                  <TouchableOpacity onPress={fetchRecentActivities}>
                    <Text style={styles.seeAllText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
                {activitiesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#8e2a6b" />
                    <Text style={styles.loadingText}>
                      Loading activities...
                    </Text>
                  </View>
                ) : recentActivities.length === 0 ? (
                  <Text style={styles.noDataText}>
                    No recent activities found.
                  </Text>
                ) : (
                  recentActivities.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: activity.color },
                        ]}
                      >
                        <Ionicons name={activity.icon} size={24} color="#fff" />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>
                          {activity.title}
                        </Text>
                        <Text style={styles.activityTime}>
                          {activity.description} • {activity.timeAgo}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Important Dates */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Important Dates</Text>
                  <TouchableOpacity onPress={fetchImportantDates}>
                    <Text style={styles.seeAllText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
                {datesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#8e2a6b" />
                    <Text style={styles.loadingText}>Loading dates...</Text>
                  </View>
                ) : importantDates.length === 0 ? (
                  <Text style={styles.noDataText}>
                    No important dates found.
                  </Text>
                ) : (
                  importantDates.map((dateItem, index) => (
                    <View key={index} style={styles.dateItem}>
                      <View style={styles.dateIcon}>
                        <Ionicons
                          name={dateItem.icon}
                          size={24}
                          color={dateItem.color}
                        />
                      </View>
                      <View style={styles.dateContent}>
                        <Text style={styles.dateTitle}>{dateItem.title}</Text>
                        <Text style={styles.dateTime}>
                          {dateItem.formattedDate}
                        </Text>
                        {dateItem.description && (
                          <Text style={styles.dateDescription}>
                            {dateItem.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileButton: {
    padding: 5,
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.75,
    height: height,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuContent: {
    flex: 1,
    padding: 20,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: Platform.OS === "ios" ? 50 : 15,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  menuArrow: {
    marginLeft: "auto",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  welcomeCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#8e2a6b",
  },
  welcomeContent: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    width: "30%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statTextContainer: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8e2a6b",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8e2a6b",
  },
  seeAllText: {
    color: "#8e2a6b",
    fontSize: 14,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dateContent: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 12,
    color: "#666",
  },

  programList: {
    marginTop: 10,
  },
  programItem: {
    marginBottom: 15,
  },
  programInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  programName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  programStats: {
    fontSize: 14,
    color: "#666",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  dateDescription: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
});
