import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchDashboardOverview } from '../utils/api'; // Make sure IP is correct in api.js

const DashboardScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetchDashboardOverview();
      console.log('📦 Dashboard API Response:', response);

      if (response.success && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        console.warn('⚠️ API returned unexpected structure:', response);
        setData([]);
      }
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="purple" />
        <Text style={{ marginTop: 10 }}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.length === 0 ? (
        <Text style={styles.noDataText}>No dashboard data available.</Text>
      ) : (
        data.map((course) => (
          <View key={course.course_code} style={styles.card}>
            <Text style={styles.title}>{course.course_name} ({course.course_code})</Text>
            <Text>Total Enrolled: {course.total_enrolled}</Text>

            {Array.isArray(course.phases) && course.phases.length > 0 ? (
              course.phases.map((phase) => (
                <View key={phase.phase_name} style={styles.phase}>
                  <Text style={styles.phaseName}>{phase.phase_name}</Text>
                  <Text>✅ Verified: {phase.verified_count}</Text>
                  <Text>📤 Pending: {phase.verification_pending_count}</Text>
                  <Text>📈 Progress: {phase.avg_progress_percentage}%</Text>
                </View>
              ))
            ) : (
              <Text style={{ fontStyle: 'italic', marginTop: 5 }}>No phase data.</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f3f3f3',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e2a6b',
    marginBottom: 10,
  },
  phase: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  phaseName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 30,
  },
});

export default DashboardScreen;
