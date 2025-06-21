export const Colors = {
  light: {
    primary: "rgb(0, 100, 200)", // A vibrant blue
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(200, 225, 255)",
    onPrimaryContainer: "rgb(0, 30, 60)",
    secondary: "rgb(80, 120, 150)", // A complementary muted blue/gray
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(210, 230, 240)",
    onSecondaryContainer: "rgb(10, 30, 45)",
    tertiary: "rgb(0, 128, 128)", // Teal for accents
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(180, 230, 230)",
    onTertiaryContainer: "rgb(0, 40, 40)",
    error: "rgb(200, 0, 0)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 200, 200)",
    onErrorContainer: "rgb(60, 0, 0)",
    background: "rgb(248, 249, 250)", // Off-white for a softer background
    onBackground: "rgb(25, 25, 25)", // Dark gray for text
    surface: "rgb(255, 255, 255)", // White for card backgrounds
    onSurface: "rgb(25, 25, 25)",
    surfaceVariant: "rgb(230, 235, 240)",
    onSurfaceVariant: "rgb(60, 70, 80)", // Used for inactive icons
    outline: "rgb(180, 190, 200)", // Lighter outline
    outlineVariant: "rgb(200, 210, 220)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(40, 45, 50)",
    inverseOnSurface: "rgb(240, 240, 240)",
    inversePrimary: "rgb(150, 200, 255)",
    elevation: {
      level0: "transparent",
      level1: "rgb(242, 245, 248)", // Subtle elevation steps
      level2: "rgb(238, 242, 245)",
      level3: "rgb(232, 238, 242)",
      level4: "rgb(230, 236, 240)",
      level5: "rgb(225, 232, 238)",
    },
    surfaceDisabled: "rgba(25, 25, 25, 0.12)",
    onSurfaceDisabled: "rgba(25, 25, 25, 0.38)",
    backdrop: "rgba(40, 45, 50, 0.4)",

    // Enhanced Glassmorphism & Apple-like aesthetic additions
    glassSurface: "rgba(255, 255, 255, 0.25)", // More transparent for better glass effect
    onGlassSurface: "rgb(0, 0, 0)", // Black text on light glass
    glassOutline: "rgba(255, 255, 255, 0.3)", // More subtle outline
    inputBackgroundGlass: "rgba(255, 255, 255, 0.2)", // More transparent for inputs
    inputBorderGlass: "rgba(200, 200, 200, 0.4)", // Softer border for inputs on glass
    placeholderGlass: "rgba(0, 0, 0, 0.4)", // Placeholder text on light glass inputs

    // New glass colors for enhanced effects
    glassHeader: "rgba(242, 242, 247, 0.65)", // Apple-like light vibrant blur, increased transparency
    glassTabBar: "rgba(255, 255, 255, 0.15)", // More transparent for liquid effect
    rainGlass: "rgba(255, 255, 255, 0.1)", // Rain-like effect

    activeTabIcon: "rgb(0, 100, 200)", // Same as primary
    inactiveTabIcon: "rgb(142, 142, 147)", // Apple's gray for inactive icons
  },
  dark: {
    primary: "rgb(18, 18, 19)", // Lighter blue for dark mode
    onPrimary: "rgb(0, 40, 80)",
    primaryContainer: "rgb(4, 10, 16)",
    onPrimaryContainer: "rgb(200, 225, 255)",
    secondary: "rgb(160, 190, 210)", // Lighter muted blue/gray
    onSecondary: "rgb(20, 40, 55)",
    secondaryContainer: "rgb(50, 80, 100)",
    onSecondaryContainer: "rgb(210, 230, 240)",
    tertiary: "rgb(100, 200, 200)", // Lighter teal
    onTertiary: "rgb(0, 50, 50)",
    tertiaryContainer: "rgb(0, 80, 80)",
    onTertiaryContainer: "rgb(180, 230, 230)",
    error: "rgb(255, 150, 150)",
    onError: "rgb(80, 0, 0)",
    errorContainer: "rgb(120, 0, 0)",
    onErrorContainer: "rgb(255, 200, 200)",
    background: "rgb(18, 18, 18)", // Very dark gray, almost black
    onBackground: "rgb(225, 225, 225)", // Light gray for text
    surface: "rgb(30, 30, 30)", // Dark gray for card backgrounds
    onSurface: "rgb(225, 225, 225)",
    surfaceVariant: "rgb(50, 55, 60)",
    onSurfaceVariant: "rgb(190, 195, 200)", // Used for inactive icons
    outline: "rgb(100, 110, 120)", // Darker outline
    outlineVariant: "rgb(60, 70, 80)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(225, 225, 230)",
    inverseOnSurface: "rgb(40, 40, 45)",
    inversePrimary: "rgb(0, 100, 200)",
    elevation: {
      level0: "transparent",
      level1: "rgb(33, 33, 33)", // Subtle elevation steps for dark mode
      level2: "rgb(38, 38, 38)",
      level3: "rgb(43, 43, 43)",
      level4: "rgb(45, 45, 45)",
      level5: "rgb(50, 50, 50)",
    },
    surfaceDisabled: "rgba(225, 225, 225, 0.12)",
    onSurfaceDisabled: "rgba(225, 225, 225, 0.38)",
    backdrop: "rgba(20, 20, 20, 0.4)",

    // Enhanced Glassmorphism & Apple-like aesthetic additions
    glassSurface: "rgba(30, 30, 30, 0.25)", // More transparent for better glass effect
    onGlassSurface: "rgb(255, 255, 255)", // White text on dark glass
    glassOutline: "rgba(70, 70, 70, 0.4)", // More subtle outline
    inputBackgroundGlass: "rgba(50, 50, 50, 0.3)", // More transparent for inputs on dark glass
    inputBorderGlass: "rgba(100, 100, 100, 0.4)", // Softer border for inputs on dark glass
    placeholderGlass: "rgba(255, 255, 255, 0.4)", // Placeholder text on dark glass inputs

    // New glass colors for enhanced effects
    glassHeader: "rgba(28, 28, 30, 0.8)", // Apple-like dark vibrant blur
    glassTabBar: "rgba(20, 20, 20, 0.2)", // More transparent for liquid effect
    rainGlass: "rgba(255, 255, 255, 0.05)", // Rain-like effect

    activeTabIcon: "rgb(130, 190, 255)", // Same as primary
    inactiveTabIcon: "rgb(142, 142, 147)", // Apple's gray for inactive icons, or use onSurfaceVariant
  },
};