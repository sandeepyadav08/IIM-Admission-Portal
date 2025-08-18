import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { themeMode, toggleTheme, colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const themeOptions = [
    {
      id: 'automatic',
      title: 'Automatic',
      description: 'Follow system theme',
      icon: 'phone-portrait'
    },
    {
      id: 'light',
      title: 'Light',
      description: 'Always light theme',
      icon: 'sunny'
    },
    {
      id: 'dark',
      title: 'Dark',
      description: 'Always dark theme',
      icon: 'moon'
    }
  ];

  const showModal = (type) => {
    if (type === 'privacy') {
      setModalContent(
        'Privacy Policy\n\nYour privacy is important to us. We do not share your personal information with third parties. All data is securely stored and only used to improve your experience.'
      );
    } else if (type === 'terms') {
      setModalContent(
        'Terms of Service\n\nBy using this app, you agree to our terms and conditions. Please use the app responsibly and do not misuse any features.'
      );
    }
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 20)
          }}
        >
          {/* Theme Settings */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Theme</Text>
            
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.settingItem,
                  { borderBottomColor: colors.border },
                  themeMode === option.id && { backgroundColor: colors.isDark ? '#2a2a2a' : '#f8f8f8' }
                ]}
                onPress={() => toggleTheme(option.id)}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name={option.icon} size={24} color={colors.primary} />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingText, { color: colors.text }]}>{option.title}</Text>
                    <Text style={[styles.settingDescription, { color: colors.isDark ? '#999' : '#666' }]}>{option.description}</Text>
                  </View>
                </View>
                {themeMode === option.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* About Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>About</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>Version</Text>
                  <Text style={[styles.settingDescription, { color: colors.isDark ? '#999' : '#666' }]}>1.0.0</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => showModal('privacy')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => showModal('terms')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, { color: colors.text }]}>Terms of Service</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal for Privacy Policy / Terms of Service */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <ScrollView>
                <Text style={[styles.modalText, { color: colors.text }]}>{modalContent}</Text>
              </ScrollView>
              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 23, 23, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 15,
    padding: 20,
    elevation: 6,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
  },
});