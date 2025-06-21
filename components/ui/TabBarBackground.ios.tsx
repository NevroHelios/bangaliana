import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <BlurView
      tint={colorScheme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}
      intensity={100}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colorScheme === 'dark' 
            ? 'rgba(28, 28, 30, 0.7)' 
            : 'rgba(255, 255, 255, 0.7)',
        }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 100; // Fixed padding for floating tab bar
}
