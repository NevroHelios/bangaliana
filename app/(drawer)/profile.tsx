import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
        <View style={[styles.glassContainer, styles.headerGlass]}>
            <View style={styles.header}>
                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff` }}
                    style={styles.avatar}
                />
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={[styles.statNumber, styles.glassText]}>{userPhotos.length}</Text>
                        <Text style={[styles.statLabel, styles.glassText]}>Photos</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statNumber, styles.glassText]}>1k</Text>
                        <Text style={[styles.statLabel, styles.glassText]}>Followers</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statNumber, styles.glassText]}>312</Text>
                        <Text style={[styles.statLabel, styles.glassText]}>Following</Text>
                    </View>
                </View>
            </View>
            <Text style={[styles.userName, styles.glassText]}>{user?.name}</Text>
            <Text style={[styles.userBio, styles.glassText]}>
                Discovering the soul of Bengal, one photo at a time.
            </Text>
            <View style={styles.buttonRow}>
                 <Pressable style={[styles.profileButton, styles.glassButton]}>
                    <Text style={[styles.buttonText, styles.glassText]}>Edit Profile</Text>
                </Pressable>
                 <Pressable style={[styles.profileButton, styles.glassButton]}>
                    <Text style={[styles.buttonText, styles.glassText]}>Share Profile</Text>
                </Pressable>
            </View>
        </View>
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
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                source={require('@/assets/images/nordic-forest.webp')}
                style={styles.backgroundImage}
            />
            
            {/* Dark Overlay */}
            <LinearGradient
                colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
                style={styles.backgroundOverlay}
            />

            {/* Content */}
            <FlatList
                style={styles.contentContainer}
                ListHeaderComponent={
                    <>
                        <View style={{height: headerHeight}} />
                        <ProfileHeader />
                        <View style={[styles.tabContainer, styles.glassContainer]}>
                            <Pressable 
                                onPress={() => { setActiveTab('photos'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}} 
                                style={[styles.tab, { borderBottomColor: activeTab === 'photos' ? 'rgba(255, 255, 255, 0.8)' : 'transparent'}]}
                            >
                                <Ionicons name="grid" size={20} color={activeTab === 'photos' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'} />
                            </Pressable>
                             <Pressable 
                                onPress={() => { setActiveTab('liked'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}} 
                                style={[styles.tab, { borderBottomColor: activeTab === 'liked' ? 'rgba(255, 255, 255, 0.8)' : 'transparent'}]}
                            >
                                <Ionicons name="heart" size={22} color={activeTab === 'liked' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    backgroundOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    glassContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        margin: 12,
        padding: 16,
    },
    headerGlass: {
        marginTop: 8,
    },
    glassText: {
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    glassButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
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
        marginTop: 10,
    },
    userBio: {
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    profileButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
        paddingTop: 8,
        paddingBottom: 8,
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
        borderRadius: 8,
    },
});