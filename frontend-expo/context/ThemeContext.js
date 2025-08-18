import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const THEME_MODE_KEY = '@theme_mode';

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('automatic');
  const [isDark, setIsDark] = useState(false);

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (savedThemeMode) {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };
    loadThemeMode();
  }, []);

  // Update isDark based on theme mode and system theme
  useEffect(() => {
    if (themeMode === 'automatic') {
      setIsDark(systemTheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemTheme]);

  const toggleTheme = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const theme = {
    isDark,
    themeMode,
    toggleTheme,
    colors: isDark ? {
      background: '#121212',
      text: '#ffffff',
      primary: '#8e2a6b',
      card: '#1e1e1e',
      border: '#333333',
      notification: '#8e2a6b',
    } : {
      background: '#fbefff',
      text: '#000000',
      primary: '#8e2a6b',
      card: '#ffffff',
      border: '#f0f0f0',
      notification: '#8e2a6b',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 