import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

const userPhotos = [
    { id: '1', source: require('@/assets/images/kolkata.jpg') },
    { id: '2', source: require('@/assets/images/durgapujo.jpg') },
    { id: '3', source: require('@/assets/images/play.jpg') },
    { id: '4', source: require('@/assets/images/krishna.jpg') },
    { id: '5', source: require('@/assets/images/heritage2.avif') },
    { id: '6', source: require('@/assets/images/bg.jpg') },
];

const likedPhotos = [
    { id: '7', source: require('@/assets/images/durgapujo.jpg') },
    { id: '8', source: require('@/assets/images/play.jpg') },
];

const ProfileHeader = () => {
    const { user } = useAuth();
    const surfaceColor = useThemeColor({}, 'surface');
    const onSurfaceColor = useThemeColor({}, 'onSurface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const primaryColor = useThemeColor({}, 'primary');

    return (
        <ThemedView style={{ backgroundColor: surfaceColor as string, paddingBottom: 20 }}>
            <View style={styles.header}>
                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff` }}
                    style={styles.avatar}
                />
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statNumber}>{userPhotos.length}</ThemedText>
                        <ThemedText style={[styles.statLabel, {color: onSurfaceVariantColor as string}]}>Photos</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statNumber}>1.2k</ThemedText>
                        <ThemedText style={[styles.statLabel, {color: onSurfaceVariantColor as string}]}>Followers</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statNumber}>312</ThemedText>
                        <ThemedText style={[styles.statLabel, {color: onSurfaceVariantColor as string}]}>Following</ThemedText>
                    </View>
                </View>
            </View>
            <ThemedText style={styles.userName}>{user?.name}</ThemedText>
            <ThemedText style={[styles.userBio, {color: onSurfaceVariantColor as string}]}>
                Discovering the soul of Bengal, one photo at a time.
            </ThemedText>
            <View style={styles.buttonRow}>
                 <Pressable style={[styles.profileButton, {backgroundColor: primaryColor as string}]}>
                    <ThemedText style={{color: useThemeColor({}, 'onPrimary') as string, fontWeight: '600'}}>Edit Profile</ThemedText>
                </Pressable>
                 <Pressable style={[styles.profileButton, {backgroundColor: useThemeColor({}, 'surfaceVariant') as string}]}>
                    <ThemedText style={{color: onSurfaceColor as string, fontWeight: '600'}}>Share Profile</ThemedText>
                </Pressable>
            </View>
        </ThemedView>
    );
}

export default function ProfileScreen() {
    const [activeTab, setActiveTab] = React.useState('photos');
    const backgroundColor = useThemeColor({}, 'background');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const primaryColor = useThemeColor({}, 'primary');
    const headerHeight = useHeaderHeight();

    const renderItem = ({ item }: { item: any }) => (
        <Pressable style={styles.photoContainer}>
            <Image source={item.source} style={styles.photo} />
        </Pressable>
    );

    return (
        <ThemedView style={[styles.container, {backgroundColor: backgroundColor as string}]}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={{height: headerHeight}} />
                        <ProfileHeader />
                        <View style={styles.tabContainer}>
                            <Pressable 
                                onPress={() => { setActiveTab('photos'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}} 
                                style={[styles.tab, { borderBottomColor: activeTab === 'photos' ? primaryColor as string : 'transparent'}]}
                            >
                                <Ionicons name="grid" size={20} color={activeTab === 'photos' ? primaryColor as string : onSurfaceVariantColor as string} />
                            </Pressable>
                             <Pressable 
                                onPress={() => { setActiveTab('liked'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}} 
                                style={[styles.tab, { borderBottomColor: activeTab === 'liked' ? primaryColor as string : 'transparent'}]}
                            >
                                <Ionicons name="heart" size={22} color={activeTab === 'liked' ? primaryColor as string : onSurfaceVariantColor as string} />
                            </Pressable>
                        </View>
                    </>
                }
                data={activeTab === 'photos' ? userPhotos : likedPhotos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                key={activeTab}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    userBio: {
        paddingHorizontal: 20,
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    profileButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    tab: {
        paddingVertical: 12,
        alignItems: 'center',
        width: '50%',
        borderBottomWidth: 2,
    },
    photoContainer: {
        width: width / 3,
        height: width / 3,
        padding: 1,
    },
    photo: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});