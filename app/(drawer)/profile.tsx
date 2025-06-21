import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const currentScheme = useColorScheme();
  const router = useRouter();
  const { user, logout } = useAuth();

  const iconColor = Colors[currentScheme].primary;
  const textColor = Colors[currentScheme].onBackground;
  const glassTextColor = Colors[currentScheme].onGlassSurface;

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.title, { color: textColor }]}>Profile</ThemedText>
      
      <ThemedView variant="glass" borderRadius={20} style={styles.profileCard}>
        <View style={styles.userInfoContainer}>
          <IconSymbol name="person.crop.circle.fill" size={80} color={glassTextColor} />
          <ThemedText style={[styles.userName, { color: glassTextColor }]}>{user?.name || 'User'}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: glassTextColor, opacity: 0.8 }]}>{user?.email || 'No email'}</ThemedText>
        </View>
      </ThemedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: Colors[currentScheme].error }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="white" />
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', 
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60, 
  },
  title: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  profileCard: {
    width: '100%',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center', // Center content within the card
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  userEmail: {
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 'auto', 
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
    paddingHorizontal: 20, 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
   
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
});