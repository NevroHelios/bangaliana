import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { withLayoutContext } from 'expo-router';

const DrawerNavigator = createDrawerNavigator().Navigator;
const Drawer = withLayoutContext(DrawerNavigator);

export const unstable_settings = {
  initialRouteName: '(drawer)/index',
};

const DrawerLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? theme.glassHeader : theme.background,
        },
        headerTintColor: theme.onBackground,
        drawerActiveBackgroundColor: theme.primary,
        drawerActiveTintColor: theme.onPrimary,
        drawerInactiveTintColor: theme.onSurfaceVariant,
        drawerLabelStyle: {
          marginLeft: 0,
          fontFamily: 'Roboto-Medium',
          fontSize: 15,
        },
        drawerContentStyle: {
          backgroundColor: theme.surface,
        }
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="photos"
        options={{
          title: 'Photos',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="camera-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="compass-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="spaces"
        options={{
          title: 'Spaces',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="upload"
        options={{
          title: 'Upload',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="cloud-upload-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerIcon: ({ color }: { color: string }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
