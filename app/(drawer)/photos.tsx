import { useThemeColor } from '@/hooks/useThemeColor';
import { MediaItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ImageBackground
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const STORAGE_KEY = 'heritage_media';
const { width } = Dimensions.get('window');

const PhotoViewerModal = ({ media, visible, onClose, onDelete }: { 
    media: MediaItem | null; 
    visible: boolean; 
    onClose: () => void; 
    onDelete: (media: MediaItem) => void; 
}) => {
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

  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  const backgroundColor = useThemeColor({}, 'background');
  const onSurfaceColor = useThemeColor({}, 'onSurface');
  const surfaceVariantColor = useThemeColor({}, 'surfaceVariant');
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');

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
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
         <View style={[styles.searchContainer, { backgroundColor: 'transparent' }]}>
            <Ionicons name="search" size={18} color={onSurfaceVariantColor as string}/>
            <TextInput
                placeholder='Search Archive'
                style={[styles.searchInput, {color: onSurfaceColor as string}]}
                placeholderTextColor={'white'}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
      ),
      headerTransparent: true,
      headerStyle: {
        backgroundColor: 'rgba(0,0,0,0.3)',
      }
    });
  }, [navigation, searchQuery, onSurfaceColor, surfaceVariantColor, onSurfaceVariantColor]);

  const filteredMedia = media.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const leftColumnMedia = filteredMedia.filter((_, index) => index % 2 === 0);
  const rightColumnMedia = filteredMedia.filter((_, index) => index % 2 === 1);

  const renderMasonryItem = (item: MediaItem) => (
    <Pressable 
      key={item.id} 
      style={styles.masonryItem} 
      onPress={() => { 
        setSelectedMedia(item); 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
      }}
    >
      <Image 
        source={{ uri: item.uri }} 
        style={{ width: '100%', aspectRatio: item.aspectRatio || 1 }} 
      />
    </Pressable>
  );

  return (
    <ImageBackground
      source={require('@/assets/images/heritage2.avif')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: headerHeight + 20, 
          paddingHorizontal: 8,
          paddingBottom: 20
        }}
      >
        {filteredMedia.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyStateText}>No photos in your archive</Text>
            <Text style={styles.emptyStateSubtext}>
              Your heritage photos will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              {leftColumnMedia.map(renderMasonryItem)}
            </View>
            <View style={styles.column}>
              {rightColumnMedia.map(renderMasonryItem)}
            </View>
          </View>
        )}
      </ScrollView>
      <PhotoViewerModal 
        media={selectedMedia} 
        visible={!!selectedMedia} 
        onClose={() => setSelectedMedia(null)} 
        onDelete={deleteMedia} 
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 12,
        width: width * 0.7,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
        backgroundColor: 'rgba(238, 238, 238, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyStateText: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
        textAlign: 'center',
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
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
    }
});