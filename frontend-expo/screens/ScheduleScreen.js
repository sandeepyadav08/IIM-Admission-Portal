import React, { useState, useEffect, Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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

// Enhanced Time Picker Component with AM/PM
const TimePicker = ({ value, onTimeChange, style }) => {
  // Convert 24-hour format to 12-hour format for display
  const convertTo12Hour = (time24) => {
    const [hour24, minute] = time24.split(":");
    const hour = parseInt(hour24);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      hour: hour12.toString(),
      minute,
      period,
    };
  };

  // Convert 12-hour format back to 24-hour format
  const convertTo24Hour = (hour12, minute, period) => {
    let hour24 = parseInt(hour12);
    if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    } else if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    }
    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };

  const { hour, minute, period } = convertTo12Hour(value);

  // Generate 12-hour format hours (1-12)
  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  // Generate all minutes from 00 to 59
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const handleHourChange = (selectedHour) => {
    const newTime = convertTo24Hour(selectedHour, minute, period);
    onTimeChange(newTime);
  };

  const handleMinuteChange = (selectedMinute) => {
    const newTime = convertTo24Hour(hour, selectedMinute, period);
    onTimeChange(newTime);
  };

  const handlePeriodChange = (selectedPeriod) => {
    const newTime = convertTo24Hour(hour, minute, selectedPeriod);
    onTimeChange(newTime);
  };

  return (
    <View style={[styles.timePickerContainer, style]}>
      <View style={styles.timePickerSection}>
        <Text style={styles.timePickerLabel}>Hour</Text>
        <Picker
          selectedValue={hour}
          onValueChange={handleHourChange}
          style={styles.timePicker}
        >
          {hours12.map((h) => (
            <Picker.Item key={h} label={h} value={h} />
          ))}
        </Picker>
      </View>

      <Text style={styles.timeSeparator}>:</Text>

      <View style={styles.timePickerSection}>
        <Text style={styles.timePickerLabel}>Minute</Text>
        <Picker
          selectedValue={minute}
          onValueChange={handleMinuteChange}
          style={styles.timePicker}
        >
          {minutes.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>
      </View>

      <View style={styles.timePickerSection}>
        <Text style={styles.timePickerLabel}>AM/PM</Text>
        <Picker
          selectedValue={period}
          onValueChange={handlePeriodChange}
          style={styles.timePicker}
        >
          {periods.map((p) => (
            <Picker.Item key={p} label={p} value={p} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const ScheduleScreen = () => {
  const insets = useSafeAreaInsets(); // Move this to the top

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [calendarView, setCalendarView] = useState("day"); // day, week, month

  // Form states
  const [eventForm, setEventForm] = useState({
    event_title: "",
    date: selectedDate,
    time: "09:00", // 9:00 AM in 24-hour format
    location: "",
    event_type: "interview",
    program_id: "all",
    notes: "",
  });

  const eventTypes = [
    "interview",
    "meeting",
    "presentation",
    "workshop",
    "exam",
  ];
  const programs = ["all", "PGP", "PhD", "EMBA", "EPhD"];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsByDate();
  }, [selectedDate, events]);

  // Update form date when selected date changes
  useEffect(() => {
    setEventForm((prev) => ({
      ...prev,
      date: selectedDate,
    }));
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/schedule`);

      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert(
        "Error",
        "Failed to fetch events data. Please check if the backend is running."
      );

      // Fallback to mock data
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockEvents = () => {
    const events = [];
    const today = new Date();

    // Generate events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      const dateStr = eventDate.toISOString().split("T")[0];

      // Generate 1-3 events per day randomly
      const numEvents = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numEvents; j++) {
        const program =
          programs[Math.floor(Math.random() * (programs.length - 1)) + 1]; // Exclude 'all'
        const eventType =
          eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
        const minute = Math.random() > 0.5 ? "00" : "30";

        events.push({
          id: `event-${i}-${j}`,
          event_title: `${program} ${
            eventType.charAt(0).toUpperCase() + eventType.slice(1)
          }`,
          date: dateStr,
          time: `${hour.toString().padStart(2, "0")}:${minute}`,
          location: `Room ${Math.floor(Math.random() * 10) + 1}`,
          event_type: eventType,
          program_id: program,
          notes: `${eventType} for ${program} program`,
          created_at: new Date().toISOString(),
        });
      }
    }

    return events.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
  };

  const filterEventsByDate = () => {
    const filtered = events.filter((event) => event.date === selectedDate);
    setFilteredEvents(filtered);
  };

  const handleAddEvent = async () => {
    if (!eventForm.event_title.trim()) {
      Alert.alert("Error", "Please enter event title");
      return;
    }

    if (!eventForm.date.trim()) {
      Alert.alert("Error", "Please enter event date");
      return;
    }

    try {
      console.log("Adding event with data:", eventForm);
      const response = await axios.post(`${API_URL}/api/schedule`, eventForm);
      console.log("Add event response:", response.data);

      if (response.data.success) {
        const newEvent = response.data.data;
        console.log("New event created:", newEvent);

        // Update events state
        setEvents((prev) => {
          const updated = [...prev, newEvent].sort((a, b) => {
            if (a.date === b.date) {
              return a.time.localeCompare(b.time);
            }
            return a.date.localeCompare(b.date);
          });
          console.log("Updated events state:", updated.length);
          return updated;
        });

        // If the new event is for the currently selected date, update filtered events immediately
        if (newEvent.date === selectedDate) {
          setFilteredEvents((prev) => {
            const updated = [...prev, newEvent].sort((a, b) =>
              a.time.localeCompare(b.time)
            );
            console.log("Updated filtered events:", updated.length);
            return updated;
          });
        }

        // Switch to the date of the newly created event to show it
        console.log("Switching to date:", newEvent.date);
        setSelectedDate(newEvent.date);

        setShowAddModal(false);
        resetForm();
        Alert.alert("Success", "Event added successfully");
      } else {
        console.error("API returned error:", response.data);
        Alert.alert("Error", response.data.message || "Failed to add event");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert(
        "Error",
        "Failed to add event. Please check if the backend is running."
      );
    }
  };

  const handleEditEvent = async () => {
    if (!eventForm.event_title.trim()) {
      Alert.alert("Error", "Please enter event title");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/schedule/${editingEvent.id}`,
        eventForm
      );

      if (response.data.success) {
        const updatedEvent = { ...editingEvent, ...eventForm };

        // Update events state
        setEvents((prev) =>
          prev.map((event) =>
            event.id === editingEvent.id ? updatedEvent : event
          )
        );

        // If the updated event is for the currently selected date, update filtered events
        if (updatedEvent.date === selectedDate) {
          setFilteredEvents((prev) =>
            prev.map((event) =>
              event.id === editingEvent.id ? updatedEvent : event
            )
          );
        } else {
          // If date changed, remove from current filtered events and switch to new date
          setFilteredEvents((prev) =>
            prev.filter((event) => event.id !== editingEvent.id)
          );
          setSelectedDate(updatedEvent.date);
        }

        setShowEditModal(false);
        setEditingEvent(null);
        resetForm();
        Alert.alert("Success", "Event updated successfully");
      } else {
        Alert.alert("Error", response.data.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event");
    }
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await axios.delete(
              `${API_URL}/api/schedule/${eventId}`
            );

            if (response.data.success) {
              setEvents((prev) => prev.filter((event) => event.id !== eventId));
              setFilteredEvents((prev) =>
                prev.filter((event) => event.id !== eventId)
              );
              Alert.alert("Success", "Event deleted successfully");
            } else {
              Alert.alert(
                "Error",
                response.data.message || "Failed to delete event"
              );
            }
          } catch (error) {
            console.error("Error deleting event:", error);
            Alert.alert("Error", "Failed to delete event");
          }
        },
      },
    ]);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      event_title: event.event_title,
      date: event.date,
      time: event.time,
      location: event.location,
      event_type: event.event_type,
      program_id: event.program_id,
      notes: event.notes,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setEventForm({
      event_title: "",
      date: selectedDate, // Use currently selected date instead of today
      time: "09:00", // 9:00 AM in 24-hour format
      location: "",
      event_type: "interview",
      program_id: "all",
      notes: "",
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getDateNavigation = () => {
    const currentDate = new Date(selectedDate);
    const prevDate = new Date(currentDate);
    const nextDate = new Date(currentDate);

    prevDate.setDate(currentDate.getDate() - 1);
    nextDate.setDate(currentDate.getDate() + 1);

    return {
      prev: prevDate.toISOString().split("T")[0],
      next: nextDate.toISOString().split("T")[0],
    };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      interview: "#2196F3",
      meeting: "#4CAF50",
      presentation: "#FF9800",
      workshop: "#9C27B0",
      exam: "#F44336",
    };
    return colors[type] || "#666";
  };

  // Helper function to format time to 12-hour format for display
  const formatTimeDisplay = (time24) => {
    const [hour24, minute] = time24.split(":");
    const hour = parseInt(hour24);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute} ${period}`;
  };

  const renderEventCard = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <View
            style={[
              styles.eventTypeIndicator,
              { backgroundColor: getEventTypeColor(item.event_type) },
            ]}
          />
          <Text style={styles.eventTitle}>{item.event_title}</Text>
        </View>
        <View style={styles.eventActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEvent(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <Text style={styles.eventTime}>🕐 {formatTimeDisplay(item.time)}</Text>
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
        <Text style={styles.eventType}>🏷️ {item.event_type.toUpperCase()}</Text>
        <Text style={styles.eventProgram}>🎓 {item.program_id}</Text>
        {item.notes && <Text style={styles.eventNotes}>📝 {item.notes}</Text>}
      </View>
    </View>
  );

  const renderCalendarHeader = () => {
    const { prev, next } = getDateNavigation();

    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setSelectedDate(prev)}
        >
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>

        <View style={styles.dateContainer}>
          <Text style={styles.selectedDate}>{formatDate(selectedDate)}</Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setSelectedDate(next)}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
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
            <Text style={styles.headerTitle}>Schedule Management</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Navigation */}
          {renderCalendarHeader()}

          {/* Events Count */}
          <Text style={styles.eventsCount}>
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""} on this date
          </Text>

          {/* Events List */}
          <FlatList
            data={filteredEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            style={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No events scheduled for this date
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyAddButtonText}>Add First Event</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Add Event Modal */}
          <Modal
            visible={showAddModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>Add New Event</Text>

                  <Text style={styles.inputLabel}>Event Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter event title"
                    value={eventForm.event_title}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, event_title: text })
                    }
                  />

                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={eventForm.date}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, date: text })
                    }
                  />

                  <Text style={styles.inputLabel}>Time</Text>
                  <TimePicker
                    value={eventForm.time}
                    onTimeChange={(time) =>
                      setEventForm({ ...eventForm, time })
                    }
                    style={styles.timePickerInput}
                  />

                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter location"
                    value={eventForm.location}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, location: text })
                    }
                  />

                  <Text style={styles.inputLabel}>Event Type</Text>
                  <Picker
                    selectedValue={eventForm.event_type}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, event_type: value })
                    }
                    style={styles.picker}
                  >
                    {eventTypes.map((type) => (
                      <Picker.Item
                        key={type}
                        label={type.toUpperCase()}
                        value={type}
                      />
                    ))}
                  </Picker>

                  <Text style={styles.inputLabel}>Program</Text>
                  <Picker
                    selectedValue={eventForm.program_id}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, program_id: value })
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

                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter notes (optional)"
                    value={eventForm.notes}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, notes: text })
                    }
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleAddEvent}
                    >
                      <Text style={styles.saveButtonText}>Add Event</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Edit Event Modal */}
          <Modal
            visible={showEditModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>Edit Event</Text>

                  <Text style={styles.inputLabel}>Event Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter event title"
                    value={eventForm.event_title}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, event_title: text })
                    }
                  />

                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={eventForm.date}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, date: text })
                    }
                  />

                  <Text style={styles.inputLabel}>Time</Text>
                  <TimePicker
                    value={eventForm.time}
                    onTimeChange={(time) =>
                      setEventForm({ ...eventForm, time })
                    }
                    style={styles.timePickerInput}
                  />

                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter location"
                    value={eventForm.location}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, location: text })
                    }
                  />

                  <Text style={styles.inputLabel}>Event Type</Text>
                  <Picker
                    selectedValue={eventForm.event_type}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, event_type: value })
                    }
                    style={styles.picker}
                  >
                    {eventTypes.map((type) => (
                      <Picker.Item
                        key={type}
                        label={type.toUpperCase()}
                        value={type}
                      />
                    ))}
                  </Picker>

                  <Text style={styles.inputLabel}>Program</Text>
                  <Picker
                    selectedValue={eventForm.program_id}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, program_id: value })
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

                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter notes (optional)"
                    value={eventForm.notes}
                    onChangeText={(text) =>
                      setEventForm({ ...eventForm, notes: text })
                    }
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowEditModal(false);
                        setEditingEvent(null);
                        resetForm();
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleEditEvent}
                    >
                      <Text style={styles.saveButtonText}>Update Event</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fbefff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#8e2a6b",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dateContainer: {
    flex: 1,
    alignItems: "center",
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8e2a6b",
    textAlign: "center",
  },
  eventsCount: {
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
  eventCard: {
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
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventTypeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8e2a6b",
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#ffebee",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#f44336",
  },
  eventDetails: {
    marginTop: 8,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventProgram: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventNotes: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyAddButton: {
    backgroundColor: "#8e2a6b",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#8e2a6b",
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  timePickerSection: {
    flex: 1,
    alignItems: "center",
    minWidth: 60,
  },
  timePickerLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  timePicker: {
    height: 120,
    width: "100%",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8e2a6b",
    marginHorizontal: 8,
    marginTop: 20,
  },
  timePickerInput: {
    marginBottom: 8,
  },
});

export default ScheduleScreen;
