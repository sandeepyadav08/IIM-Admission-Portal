import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CourseCard = ({ course, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.courseCode}>{course.course_code}</Text>
        <Text style={styles.courseName}>{course.course_name}</Text>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.enrollmentText}>
          Total Enrolled: {course.total_enrolled}
        </Text>
      </View>
      
      <View style={styles.phases}>
        {course.phases.map((phase) => (
          <View key={phase.phase_name} style={styles.phaseItem}>
            <Text style={styles.phaseName}>{phase.phase_name}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${phase.avg_progress_percentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(phase.avg_progress_percentage)}% Complete
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    marginBottom: 10,
  },
  courseCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e2a6b',
  },
  courseName: {
    fontSize: 16,
    color: '#666',
  },
  stats: {
    marginBottom: 15,
  },
  enrollmentText: {
    fontSize: 14,
    color: '#444',
  },
  phases: {
    gap: 10,
  },
  phaseItem: {
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8e2a6b',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default CourseCard;