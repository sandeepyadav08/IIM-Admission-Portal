import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../src/config';

const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'remembered_email';

// Helper function to store token securely
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

// Helper function to retrieve stored token
export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Helper function to delete stored token and email
export const deleteStoredToken = async () => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(EMAIL_KEY)
    ]);
    return true;
  } catch (error) {
    console.error('Error deleting stored data:', error);
    return false;
  }
};

// Store email
export const saveEmail = async (email) => {
  try {
    await SecureStore.setItemAsync(EMAIL_KEY, email);
    return true;
  } catch (error) {
    console.error('Error saving email:', error);
    return false;
  }
};

// Get stored email
export const getStoredEmail = async () => {
  try {
    return await SecureStore.getItemAsync(EMAIL_KEY);
  } catch (error) {
    console.error('Error getting email:', error);
    return null;
  }
};

// Main login function with remember me functionality
export const rememberMeLogin = async (email, password, rememberMe = false) => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Assuming the server returns a JWT token in the response
    const { token } = data;

    if (rememberMe && token) {
      // If rememberMe is true, store both token and email
      await Promise.all([
        saveToken(token),
        saveEmail(email)
      ]);
    } else {
      // If rememberMe is false, clear any stored data
      await Promise.all([
        deleteStoredToken(),
        SecureStore.deleteItemAsync(EMAIL_KEY)
      ]);
    }

    return {
      success: true,
      token,
      user: data.user, // If the server returns user data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An error occurred during login',
    };
  }
};

// Check if user is already logged in
export const checkAuthStatus = async () => {
  try {
    const token = await getStoredToken();
    if (!token) {
      return { isLoggedIn: false };
    }

    // Verify token with the backend
    const response = await fetch(`${API_URL}/api/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await deleteStoredToken(); // Clear invalid token
      return { isLoggedIn: false };
    }

    const data = await response.json();
    return {
      isLoggedIn: true,
      user: data.user,
      token,
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isLoggedIn: false, error: error.message };
  }
};

// Logout function
export const logout = async () => {
  try {
    await deleteStoredToken();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 