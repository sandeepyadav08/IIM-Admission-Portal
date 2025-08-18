import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../src/config';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password must be at least 6 characters long
    return password.length >= 6;
  };

  const handleSendOtp = async () => {
    if (isSendingOtp) return;
    
    // Clear previous errors
    setErrors({});

    // Validate email
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your email');
        setStep(2);
        setCanResend(false);
        setResendTimer(30);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
        setIsSendingOtp(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP resent to your email');
        setCanResend(false);
        setResendTimer(20);
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  const handleVerifyOtp = async () => {
    // Clear previous errors
    setErrors({});

    // Validate OTP
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    setErrors({});

    // Validate password
    if (!newPassword) {
      setErrors({ password: 'Password is required' });
      return;
    }

    if (!validatePassword(newPassword)) {
      setErrors({ password: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password reset successful');
        navigation.replace('Login');
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password');
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
          <Text style={styles.title}>Forgot Password</Text>
          {step === 1 && (
            <>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              <TouchableOpacity 
                style={[styles.btn, isSendingOtp && styles.btnDisabled]} 
                onPress={handleSendOtp}
                disabled={isSendingOtp}
              >
                <Text style={[styles.btnText, isSendingOtp && styles.btnTextDisabled]}>
                  {isSendingOtp ? 'SENDING...' : 'SEND OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {step === 2 && (
            <>
              <TextInput
                style={[styles.input, errors.otp && styles.inputError]}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
              <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp}>
                <Text style={styles.btnText}>VERIFY OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.resendBtn, !canResend && styles.resendBtnDisabled]} 
                onPress={handleResendOtp}
                disabled={!canResend}
              >
                <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                  {canResend ? 'RESEND OTP' : `RESEND OTP (${resendTimer}s)`}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {step === 3 && (
            <>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <TouchableOpacity style={styles.btn} onPress={handleResetPassword}>
                <Text style={styles.btnText}>RESET PASSWORD</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.link}>Back to Login</Text>
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
    minHeight: 250,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#a1a1a1',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 28, color: '#8e2a6b', fontWeight: 'bold', marginBottom: 30 },
  input: { width: '100%', borderWidth: 1, borderColor: '#e0d3e6', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#faf6fb' },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 10,
    fontSize: 14,
  },
  btn: { backgroundColor: '#8e2a6b', borderRadius: 8, paddingVertical: 12, alignItems: 'center', width: '100%', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#8e2a6b', marginTop: 10, textDecorationLine: 'underline' },
  resendBtn: {
    backgroundColor: '#8e2a6b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  resendBtnDisabled: {
    backgroundColor: '#e0d3e6',
  },
  resendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resendTextDisabled: {
    color: '#a1a1a1',
  },
  btnDisabled: {
    backgroundColor: '#e0d3e6',
  },
  btnTextDisabled: {
    color: '#a1a1a1',
  },
}); 