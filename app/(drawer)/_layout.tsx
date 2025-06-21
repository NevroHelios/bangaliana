import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter, withLayoutContext } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerNavigator = createDrawerNavigator().Navigator;
const Drawer = withLayoutContext(DrawerNavigator);

export const unstable_settings = {
  initialRouteName: '(drawer)/index',
};

const DRAWER_ITEMS = [
    { name: 'index', title: 'Home', icon: 'home-outline' },
    { name: 'photos', title: 'Photos', icon: 'camera-outline' },
    { name: 'explore', title: 'Explore', icon: 'compass-outline' },
    { name: 'spaces', title: 'Spaces', icon: 'grid-outline' },
    { name: 'upload', title: 'Upload Post', icon: 'cloud-upload-outline' },
    { name: 'profile', title: 'Profile', icon: 'person-outline' },
];

function CustomDrawerContent(props: any) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { bottom, top } = useSafeAreaInsets();
    
    const primaryContainerColor = useThemeColor({}, 'primaryContainer');
    const onPrimaryContainerColor = useThemeColor({}, 'onPrimaryContainer');
    const onSurfaceColor = useThemeColor({}, 'onSurface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const backgroundColor = useThemeColor({}, 'background');

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    }

    return (
        <View style={{ flex: 1, backgroundColor: backgroundColor as string }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: top }}>
                <View style={styles.header}>
                    <Image 
                        source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=random`}} 
                        style={styles.avatar}
                    />
                    <ThemedText style={styles.userName}>{user?.name}</ThemedText>
                    <ThemedText style={[styles.userEmail, { color: onSurfaceVariantColor as string}]}>{user?.email}</ThemedText>
                </View>

                <View style={styles.separator} />

                {DRAWER_ITEMS.map((item) => {
                    const path = item.name === 'index' ? '/' : `/${item.name}`;
                    const isActive = pathname === path;
                    return (
                        <Pressable 
                            key={item.name} 
                            style={[styles.drawerItem, isActive && { backgroundColor: primaryContainerColor as string}]}
                            onPress={() => router.push(path as any)}
                        >
                            <Ionicons 
                                name={item.icon as any} 
                                size={22} 
                                color={isActive ? onPrimaryContainerColor as string : onSurfaceVariantColor as string} 
                            />
                            <ThemedText style={[
                                styles.drawerItemText, 
                                { 
                                    color: isActive ? onPrimaryContainerColor as string : onSurfaceColor as string,
                                    fontWeight: isActive ? '700' : '500',
                                }
                            ]}>{item.title}</ThemedText>
                        </Pressable>
                    )
                })}
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
  const onBackgroundColor = useThemeColor({}, 'onBackground');
  const glassHeaderColor = useThemeColor({}, 'glassHeader');
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerStyle: {
          backgroundColor: glassHeaderColor as string,
        },
        headerTintColor: onBackgroundColor as string,
        drawerStyle: {
            width: '85%'
        },
        headerLeft: () => (
            <Pressable onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 16 }}>
                 <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.menuButton}>
                    <Ionicons name="menu-outline" size={22} color={onBackgroundColor as string} />
                 </BlurView>
            </Pressable>
        ),
      })}
    >
      <Drawer.Screen name="index" options={{ title: 'Home' }} />
      <Drawer.Screen name="photos" options={{ title: 'Photos' }} />
      <Drawer.Screen name="explore" options={{ title: 'Explore' }} />
      <Drawer.Screen name="spaces" options={{ title: 'Heritage AI' }} />
      <Drawer.Screen name="upload" options={{ title: 'Upload Post' }} />
      <Drawer.Screen name="profile" options={{ title: 'Profile' }} />
    </Drawer>
  );
};

const styles = StyleSheet.create({
    header: {
        padding: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
    },
    userEmail: {
        fontSize: 14,
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
    menuButton: {
        padding: 8,
        borderRadius: 100,
        overflow: 'hidden',
    },
})

export default DrawerLayout;
