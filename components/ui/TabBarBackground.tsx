import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <BlurView
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={100}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: Colors[colorScheme].glassTabBar,
        }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
