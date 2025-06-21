import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemTheme = useSystemColorScheme() ?? 'light';
  const [theme, setThemeState] = useState<Theme>(systemTheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('app-theme') as Theme | null;
        if (storedTheme) {
          setThemeState(storedTheme);
        } else {
          setThemeState(systemTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
        setThemeState(systemTheme);
      }
    };
    loadTheme();
  }, [systemTheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem('app-theme').then(storedTheme => {
        if (!storedTheme) { // Only update if no user preference is set
          setThemeState(colorScheme ?? 'light');
        }
      });
    });
    return () => subscription.remove();
  }, []);

  const storeTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      storeTheme(newTheme);
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storeTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
