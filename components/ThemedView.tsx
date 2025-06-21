import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors'; // Import Colors
import { useColorScheme } from '@/hooks/useColorScheme'; // Import useColorScheme

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'glass';
  borderRadius?: number;
};

export function ThemedView({ style, lightColor, darkColor, variant = 'default', borderRadius = 16, ...otherProps }: ThemedViewProps) {
  const theme = useColorScheme() ?? 'light';
  const defaultBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  let viewStyle: any = { backgroundColor: defaultBackgroundColor };

  if (variant === 'glass') {
    viewStyle = {
      backgroundColor: Colors[theme].glassSurface,
      borderRadius: borderRadius,
      borderWidth: 1,
      borderColor: Colors[theme].glassOutline,
      overflow: 'hidden', // Important for containing blurred content or child borderRadius
    };
  }

  return <View style={[viewStyle, style]} {...otherProps} />;
}

// Optional: Add default styles if needed, though variant handles specifics
// const styles = StyleSheet.create({});
