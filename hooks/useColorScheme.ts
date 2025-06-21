import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext'; // Adjust path if necessary

export function useColorScheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ThemeProvider');
  }
  return context.theme;
}

export function useThemeActions() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  return { toggleTheme: context.toggleTheme, setTheme: context.setTheme };
}
