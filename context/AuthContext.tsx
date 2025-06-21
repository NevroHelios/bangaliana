import { User } from '@/types';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@/config/config';

const BACKEND_URL = "http://192.168.174.91:10000";
const TOKEN_KEY = 'jwt-token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateBookmarks: (bookmarkedPosts: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({ id: '1', email: 'test@test.com', name: 'Test User' });
  const [token, setToken] = useState<string | null>('dummy-token');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async (currentToken: string) => {
    if (!currentToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  /* useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      setToken(storedToken);
      if (storedToken) {
        await fetchUser(storedToken);
      } else {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []); */

  const login = async (email: string, password: string) => {
    console.log('Attempting to log in with email:', email);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
        return true;
      } else {
        throw new Error(data.message || 'An unexpected error occurred.');
      }
    } catch (e) {
      const error = e as Error;
      console.error('Login error:', error.message);
      Alert.alert('Login Failed', error.message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('Attempting to register with:', { name, email });
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Register response status:', response.status);
      console.log('Register response data:', data);

      if (response.ok && data.token) {
        setToken(data.token);
        setUser(data.user);
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
        return true;
      } else {
        throw new Error(data.message || 'An unexpected error occurred during registration.');
      }
    } catch (e) {
      const error = e as Error;
      console.error('Registration error:', error.message);
      Alert.alert('Registration Failed', error.message);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const updateBookmarks = (bookmarkedPosts: string[]) => {
    if (user) {
      const updatedUser = { ...user, bookmarkedPosts };
      setUser(updatedUser);
      SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateBookmarks }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};