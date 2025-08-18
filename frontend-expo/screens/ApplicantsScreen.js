import React, { useState, useEffect, Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");

const ApplicantsScreen = () => {
  const insets = useSafeAreaInsets(); // Move this to the top

  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    program: "all",
    status: "all",
    gender: "all",
    source: "all",
    offer_issued: "all",
    fee_paid: "all",
  });

  const programs = ["all", "PGP", "PhD", "EMBA", "EPhD"];
  const statuses = ["all", "submitted", "under_review", "admitted", "rejected"];
  const genders = ["all", "male", "female", "other"];
  const sources = ["all", "online", "offline", "referral"];

  useEffect(() => {
    fetchApplicants();
  }, [currentPage, filters]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, applicants]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/applicants`);

      if (response.data.success) {
        const applicantsData = response.data.data.applicants.map(
          (applicant) => ({
            ...applicant,
            id: applicant.applicant_id, // Use applicant_id as the main ID for UI
            offer_issued: Boolean(applicant.offer_issued), // Convert to boolean
            fee_paid: Boolean(applicant.fee_paid), // Convert to boolean
          })
        );

        setApplicants(applicantsData);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        throw new Error(response.data.message || "Failed to fetch applicants");
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      Alert.alert(
        "Error",
        "Failed to fetch applicants data. Please check if the backend is running."
      );

      // Fallback to empty data
      setApplicants([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    let filtered = applicants;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.program !== "all") {
      filtered = filtered.filter(
        (applicant) => applicant.program_applied_for === filters.program
      );
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (applicant) => applicant.application_status === filters.status
      );
    }
    if (filters.gender !== "all") {
      filtered = filtered.filter(
        (applicant) => applicant.gender === filters.gender
      );
    }
    if (filters.source !== "all") {
      filtered = filtered.filter(
        (applicant) => applicant.source === filters.source
      );
    }
    if (filters.offer_issued !== "all") {
      const offerFilter = filters.offer_issued === "yes";
      filtered = filtered.filter(
        (applicant) => applicant.offer_issued === offerFilter
      );
    }
    if (filters.fee_paid !== "all") {
      const feeFilter = filters.fee_paid === "yes";
      filtered = filtered.filter(
        (applicant) => applicant.fee_paid === feeFilter
      );
    }

    setFilteredApplicants(filtered);
  };

  const toggleOfferStatus = async (applicantId) => {
    try {
      const applicant = filteredApplicants.find((a) => a.id === applicantId);
      const newStatus = !applicant.offer_issued;

      const response = await axios.patch(
        `${API_URL}/api/applicants/${applicantId}/offer`,
        {
          offer_issued: newStatus,
        }
      );

      if (response.data.success) {
        setFilteredApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === applicantId
              ? { ...applicant, offer_issued: newStatus }
              : applicant
          )
        );
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === applicantId
              ? { ...applicant, offer_issued: newStatus }
              : applicant
          )
        );
      } else {
        Alert.alert("Error", "Failed to update offer status");
      }
    } catch (error) {
      console.error("Error updating offer status:", error);
      Alert.alert("Error", "Failed to update offer status");
    }
  };

  const toggleFeeStatus = async (applicantId) => {
    try {
      const applicant = filteredApplicants.find((a) => a.id === applicantId);
      const newStatus = !applicant.fee_paid;

      const response = await axios.patch(
        `${API_URL}/api/applicants/${applicantId}/fee`,
        {
          fee_paid: newStatus,
        }
      );

      if (response.data.success) {
        setFilteredApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === applicantId
              ? { ...applicant, fee_paid: newStatus }
              : applicant
          )
        );
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === applicantId
              ? { ...applicant, fee_paid: newStatus }
              : applicant
          )
        );
      } else {
        Alert.alert("Error", "Failed to update fee status");
      }
    } catch (error) {
      console.error("Error updating fee status:", error);
      Alert.alert("Error", "Failed to update fee status");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchApplicants();
  };

  const renderApplicantCard = ({ item }) => (
    <View style={styles.applicantCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.applicantName}>{item.name}</Text>
        <Text style={styles.applicantId}>ID: {item.id}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardText}>Email: {item.email}</Text>
        <Text style={styles.cardText}>Program: {item.program_applied_for}</Text>
        <Text
          style={[
            styles.cardText,
            styles.statusText,
            { color: getStatusColor(item.application_status) },
          ]}
        >
          Status: {item.application_status.toUpperCase()}
        </Text>
        <Text style={styles.cardText}>Applied: {item.applied_date}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            item.offer_issued && styles.activeToggle,
          ]}
          onPress={() => toggleOfferStatus(item.id)}
        >
          <Text
            style={[
              styles.toggleText,
              item.offer_issued && styles.activeToggleText,
            ]}
          >
            Offer {item.offer_issued ? "Issued" : "Pending"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, item.fee_paid && styles.activeToggle]}
          onPress={() => toggleFeeStatus(item.id)}
        >
          <Text
            style={[
              styles.toggleText,
              item.fee_paid && styles.activeToggleText,
            ]}
          >
            Fee {item.fee_paid ? "Paid" : "Pending"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "admitted":
        return "#4CAF50";
      case "under_review":
        return "#FF9800";
      case "rejected":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading applicants...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { paddingTop: Platform.OS === "ios" ? 0 : 10 },
            ]}
          >
            <Text style={styles.headerTitle}>Applicants Management</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={20} color="#fff" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Results Count */}
          <Text style={styles.resultsCount}>
            Showing {filteredApplicants.length} applicants
          </Text>

          {/* Applicants List */}
          <FlatList
            data={filteredApplicants}
            renderItem={renderApplicantCard}
            keyExtractor={(item) => item.id}
            style={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No applicants found</Text>
                <TouchableOpacity 
                  style={styles.emptyAddButton}
                  onPress={() => setShowFilters(true)}
                >
                  <Text style={styles.emptyAddButtonText}>Adjust Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Filter Modal */}
          <Modal
            visible={showFilters}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilters(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Applicants</Text>

                <Text style={styles.filterLabel}>Program:</Text>
                <Picker
                  selectedValue={filters.program}
                  onValueChange={(value) =>
                    setFilters({ ...filters, program: value })
                  }
                  style={styles.picker}
                >
                  {programs.map((program) => (
                    <Picker.Item
                      key={program}
                      label={program.toUpperCase()}
                      value={program}
                    />
                  ))}
                </Picker>

                <Text style={styles.filterLabel}>Status:</Text>
                <Picker
                  selectedValue={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                  style={styles.picker}
                >
                  {statuses.map((status) => (
                    <Picker.Item
                      key={status}
                      label={status.toUpperCase()}
                      value={status}
                    />
                  ))}
                </Picker>

                <Text style={styles.filterLabel}>Gender:</Text>
                <Picker
                  selectedValue={filters.gender}
                  onValueChange={(value) =>
                    setFilters({ ...filters, gender: value })
                  }
                  style={styles.picker}
                >
                  {genders.map((gender) => (
                    <Picker.Item
                      key={gender}
                      label={gender.toUpperCase()}
                      value={gender}
                    />
                  ))}
                </Picker>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setFilters({
                        program: "all",
                        status: "all",
                        gender: "all",
                        source: "all",
                        offer_issued: "all",
                        fee_paid: "all",
                      });
                    }}
                  >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => setShowFilters(false)}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#8e2a6b", // Status bar area color
  },
  container: {
    flex: 1,
    backgroundColor: "#fbefff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbefff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8e2a6b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#8e2a6b",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fbefff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#8e2a6b",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#8e2a6b",
    backgroundColor: "#fbefff",
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  applicantCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#8e2a6b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8e2a6b",
    flex: 1,
  },
  applicantId: {
    fontSize: 12,
    color: "#8e2a6b",
    backgroundColor: "#f8f0f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "600",
  },
  cardContent: {
    marginBottom: 16,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusText: {
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleButton: {
    flex: 1,
    backgroundColor: "#f8f0f5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeToggle: {
    backgroundColor: "#8e2a6b",
    borderColor: "#8e2a6b",
  },
  toggleText: {
    fontSize: 12,
    color: "#8e2a6b",
    fontWeight: "600",
  },
  activeToggleText: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#8e2a6b",
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ApplicantsScreen;
