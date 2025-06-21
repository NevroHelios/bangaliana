import { useThemeColor } from '@/hooks/useThemeColor';
import { MediaItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const STORAGE_KEY = 'heritage_media';
const { width } = Dimensions.get('window');

const PhotoViewerModal = ({ media, visible, onClose, onDelete, onUpload }: { media: MediaItem | null; visible: boolean; onClose: () => void; onDelete: (media: MediaItem) => void; onUpload: (media: MediaItem) => void; }) => {
    if (!media) return null;
    const { top, bottom } = useSafeAreaInsets();
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
            <BlurView intensity={100} tint="dark" style={styles.viewerContainer}>
                <Pressable onPress={onClose} style={[styles.viewerCloseButton, {top: top + 10}]}>
                    <Ionicons name="close" size={24} color="white" />
                </Pressable>
                <Image
                    source={{ uri: media.uri }}
                    style={[styles.viewerImage, { aspectRatio: media.aspectRatio }]}
                    contentFit="contain"
                />
                <View style={[styles.viewerActions, { bottom: bottom + 20 }]}>
                    <Pressable
                        onPress={() => onUpload(media)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="share-outline" size={24} color="white" />
                        <Text style={styles.actionText}>Upload to Post</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => onDelete(media)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="trash-outline" size={24} color="white" />
                        <Text style={styles.actionText}>Delete</Text>
                    </Pressable>
                </View>
            </BlurView>
        </Modal>
    );
};


export default function PhotosScreen() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const { top } = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const onSurfaceColor = useThemeColor({}, 'onSurface');
  const surfaceVariantColor = useThemeColor({}, 'surfaceVariant');
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
  const primaryColor = useThemeColor({}, 'primary');

  const loadMedia = useCallback(async () => {
    try {
      const savedMedia = await AsyncStorage.getItem(STORAGE_KEY);
      setMedia(savedMedia ? JSON.parse(savedMedia) : []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadMedia(); }, [loadMedia]));

  const saveMedia = async (newMedia: MediaItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMedia));
    } catch (error) {
      console.error('Error saving media:', error);
    }
  };

    const addMedia = (uri: string, type: 'photo' | 'video', aspectRatio?: number) => {
    const newMediaItem: MediaItem = {
      id: Date.now().toString(),
      uri,
      type,
      timestamp: Date.now(),
      aspectRatio,
      userId: 'user123', // Dummy user ID
      likes: [],
      comments: [],
    };
    const updatedMedia = [newMediaItem, ...media];
    setMedia(updatedMedia);
    saveMedia(updatedMedia);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteMedia = (mediaToDelete: MediaItem) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedMedia = media.filter(
              (item) => item.id !== mediaToDelete.id
            );
            setMedia(updatedMedia);
            saveMedia(updatedMedia);
            setSelectedMedia(null);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          },
        },
      ]
    );
  };

  const handleUpload = (mediaToUpload: MediaItem) => {
    router.push({
      pathname: '/(drawer)/upload',
      params: {
        imageUri: mediaToUpload.uri,
        imageAspectRatio: mediaToUpload.aspectRatio?.toString(),
      },
    });
    setSelectedMedia(null);
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const aspectRatio = asset.width && asset.height ? asset.width / asset.height : 1;
      addMedia(asset.uri, asset.type === 'video' ? 'video' : 'photo', aspectRatio);
    }
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo or Video', 'Choose from Library'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) router.push('/camera');
            if (buttonIndex === 2) pickMedia();
          }
        );
    } else {
        Alert.alert('Add Media', 'Choose an option', [
            { text: 'Take Photo or Video', onPress: () => router.push('/camera') },
            { text: 'Choose from Library', onPress: () => pickMedia() },
            { text: 'Cancel', style: 'cancel' }
        ])
    }
  };
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleAddPress} style={{ marginRight: 16 }}>
          <Ionicons name="add-circle" size={28} color={primaryColor as string} />
        </Pressable>
      ),
      headerTitle: () => (
         <View style={[styles.searchContainer, { backgroundColor: surfaceVariantColor as string }]}>
            <Ionicons name="search" size={18} color={onSurfaceVariantColor as string}/>
            <TextInput
                placeholder='Search Archive'
                style={[styles.searchInput, {color: onSurfaceColor as string}]}
                placeholderTextColor={onSurfaceVariantColor as string}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
      )
    });
  }, [navigation, searchQuery, onSurfaceColor, surfaceVariantColor, onSurfaceVariantColor, primaryColor]);

  const filteredMedia = media.filter(item => {
    if (searchQuery.trim() === '') {
        return true;
    }
    // FIX: Search by a user-friendly value like the date instead of the internal ID.
    // This allows searching for things like "7/25/2023" or "2023".
    // You could expand this to search other fields like a caption or comments.
    const itemDate = new Date(item.timestamp).toLocaleDateString().toLowerCase();
    return itemDate.includes(searchQuery.toLowerCase());
  });

  const leftColumnMedia = filteredMedia.filter((_, index) => index % 2 === 0);
  const rightColumnMedia = filteredMedia.filter((_, index) => index % 2 === 1);

  const renderMasonryItem = (item: MediaItem) => (
    <Pressable key={item.id} style={styles.masonryItem} onPress={() => { setSelectedMedia(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
      <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: item.aspectRatio }} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor as string }}>
        <ScrollView contentContainerStyle={{ paddingTop: headerHeight, paddingHorizontal: 8 }}>
            <View style={styles.masonryContainer}>
                <View style={styles.column}>{leftColumnMedia.map(renderMasonryItem)}</View>
                <View style={styles.column}>{rightColumnMedia.map(renderMasonryItem)}</View>
            </View>
        </ScrollView>
        <PhotoViewerModal media={selectedMedia} visible={!!selectedMedia} onClose={() => setSelectedMedia(null)} onDelete={deleteMedia} onUpload={handleUpload} />
    </View>
  );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 12,
        width: width * 0.7,
        height: 40
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        height: '100%'
    },
    masonryContainer: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        paddingHorizontal: 4,
    },
    masonryItem: {
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#eee'
    },
    viewerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        width: '90%',
        borderRadius: 16,
    },
    viewerCloseButton: {
        position: 'absolute',
        right: 16,
        padding: 8,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    viewerActions: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 40,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
    }
});