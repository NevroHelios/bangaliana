import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { usePathname, useRouter, withLayoutContext } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerNavigator = createDrawerNavigator().Navigator;
const Drawer = withLayoutContext(DrawerNavigator);

export const unstable_settings = {
  initialRouteName: '(drawer)/index',
};

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { bottom, top } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const primaryContainerColor = useThemeColor({}, 'primaryContainer');
  const onPrimaryContainerColor = useThemeColor({}, 'onPrimaryContainer');
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
  const onSurfaceColor = useThemeColor({}, 'onSurface');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: top }}>
        <View style={styles.header}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=random`}} 
            style={styles.avatar}
          />
          <ThemedText style={[styles.userName, { color: 'white' }]}>{user?.name}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: 'white' as string}]}>{user?.email}</ThemedText>
        </View>

        <View style={styles.separator} />

        <Pressable 
          style={[styles.drawerItem, pathname === '/' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/' as any)}
        >
          <Ionicons 
            name="home-outline" 
            size={22} 
            color={pathname === '/' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/' ? '700' : '500',
            }
          ]}>Home</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.drawerItem, pathname === '/feed' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/feed' as any)}
        >
          <Ionicons 
            name="newspaper-outline" 
            size={22} 
            color={pathname === '/feed' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/feed' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/feed' ? '700' : '500',
            }
          ]}>Feed</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.drawerItem, pathname === '/bookmarks' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/bookmarks' as any)}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={22} 
            color={pathname === '/bookmarks' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/bookmarks' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/bookmarks' ? '700' : '500',
            }
          ]}>Bookmarks</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.drawerItem, pathname === '/explore' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/explore' as any)}
        >
          <Ionicons 
            name="compass-outline" 
            size={22} 
            color={pathname === '/explore' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/explore' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/explore' ? '700' : '500',
            }
          ]}>Explore</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.drawerItem, pathname === '/spaces' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/spaces' as any)}
        >
          <Ionicons 
            name="grid-outline" 
            size={22} 
            color={pathname === '/spaces' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/spaces' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/spaces' ? '700' : '500',
            }
          ]}>Spaces</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.drawerItem, pathname === '/upload' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/upload' as any)}
        >
          <Ionicons 
            name="cloud-upload-outline" 
            size={22} 
            color={pathname === '/upload' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/upload' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/upload' ? '700' : '500',
            }
          ]}>Upload</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.drawerItem, pathname === '/profile' && { backgroundColor: primaryContainerColor as string}]}
          onPress={() => router.push('/profile' as any)}
        >
          <Ionicons 
            name="person-outline" 
            size={22} 
            color={pathname === '/profile' ? onPrimaryContainerColor as string : theme.onSurfaceVariant} 
          />
          <ThemedText style={[
            styles.drawerItemText, 
            { 
              color: pathname === '/profile' ? onPrimaryContainerColor as string : onSurfaceColor as string,
              fontWeight: pathname === '/profile' ? '700' : '500',
            }
          ]}>Profile</ThemedText>
        </Pressable>

      </DrawerContentScrollView>
      
      <View style={[styles.footer, { paddingBottom: bottom + 10 }]}>
        <View style={styles.separator} />
        <Pressable onPress={handleLogout} style={styles.drawerItem}>
          <Ionicons name="log-out-outline" size={22} color={onSurfaceVariantColor as string} />
          <ThemedText style={[styles.drawerItemText, { color: onSurfaceColor as string }]}>Logout</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const DrawerLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerLeft: undefined,
        headerRight: () => null,
        headerStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.onBackground,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="feed"
        options={{
          title: 'Feed',
        }}
      />
      <Drawer.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
      <Drawer.Screen
        name="spaces"
        options={{
          title: 'Spaces',
        }}
      />
      <Drawer.Screen
        name="upload"
        options={{
          title: 'Upload',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
  },
  avatar: {
    backgroundColor: "white",
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: 'white'
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.outlineVariant,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  drawerItemText: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
  },
});

export default DrawerLayout;