import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchCourseDetail } from '../utils/api';

const CourseDetailScreen = ({ route }) => {
  const { courseCode } = route.params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseDetail();
  }, []);

  const loadCourseDetail = async () => {
    try {
      const response = await fetchCourseDetail(courseCode);
      if (response.success) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error('Failed to load course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="purple" style={{ flex: 1 }} />;
  }

  if (!course) {
    return (
      <View style={styles.centered}>
        <Text>Course not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{course.course_name} ({course.course_code})</Text>
      <Text style={styles.subTitle}>Total Enrolled: {course.total_enrolled}</Text>

      {course.phases.map((phase, index) => (
        <View key={index} style={styles.phaseCard}>
          <Text style={styles.phaseName}>{phase.phase_name}</Text>
          <Text style={styles.description}>{phase.phase_description}</Text>
          <Text>💰 Commitment Fee: ₹{phase.commitment_fee}</Text>
          <Text>📈 Avg Progress: {phase.avg_progress_percentage}%</Text>
          <Text>✅ Verified: {phase.verified_count}</Text>
          <Text>📤 Pending: {phase.verification_pending_count}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8e2a6b',
    marginBottom: 10
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 20
  },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2
  },
  phaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  description: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 6
  }
});

export default CourseDetailScreen;
