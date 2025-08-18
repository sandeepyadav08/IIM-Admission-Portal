import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../src/config';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Registered! Please login.');
        navigation.replace('Login');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#fbefff' }]} edges={['top', 'bottom']}>
      <StatusBar style="dark-content" />
      <View style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 16)
        }
      ]}>
        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>
          <TextInput 
            style={[styles.input, errors.username && styles.inputError]} 
            placeholder="Username" 
            value={username} 
            onChangeText={setUsername} 
            autoCapitalize="none"
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          <TextInput 
            style={[styles.input, errors.email && styles.inputError]} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.passwordContainer}>
            <TextInput 
              style={[styles.input, styles.passwordInput, errors.password && styles.inputError]} 
              placeholder="Password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#8e2a6b" 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity style={styles.btn} onPress={handleRegister}>
            <Text style={styles.btnText}>REGISTER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbefff',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fbefff', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  card: {
    width: width * 0.9,
    minHeight: 350,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#a1a1a1',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontSize: 28, 
    color: '#8e2a6b', 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#e0d3e6', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 5, 
    backgroundColor: '#faf6fb',
    fontSize: 16
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 5,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: '35%',
    transform: [{ translateY: -15 }],
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: { 
    backgroundColor: '#8e2a6b', 
    borderRadius: 12, 
    paddingVertical: 15, 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: 10 
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  link: { 
    color: '#8e2a6b', 
    marginTop: 10, 
    textDecorationLine: 'underline'
  },
}); 