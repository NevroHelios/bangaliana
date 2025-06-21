import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeaderHeight } from '@react-navigation/elements'; // Import useHeaderHeight
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, ImageBackground, Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { PhotoViewer } from '@/components/PhotoViewer';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MediaItem } from '@/types';

export const STORAGE_KEY = 'heritage_media';

const { width } = Dimensions.get('window');

export default function PhotosScreen() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  const loadMedia = useCallback(async () => {
    try {
      const savedMedia = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedMedia) {
        setMedia(JSON.parse(savedMedia));
      } else {
        setMedia([]);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedia();
    }, [loadMedia])
  );

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
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const aspectRatio = asset.width && asset.height ? asset.width / asset.height : 1;
      addMedia(
        asset.uri, 
        asset.type === 'video' ? 'video' : 'photo',
        aspectRatio
      );
    }
  };

  const handleMediaPress = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
    setShowViewer(true);
  };

  const handleDeleteMedia = (mediaItem: MediaItem) => {
    const updatedMedia = media.filter(item => item.id !== mediaItem.id);
    setMedia(updatedMedia);
    saveMedia(updatedMedia);
  };

  const renderInstagramGrid = () => {
    if (media.length === 0) {
      return (
        <ThemedView style={styles.emptyState}>
          <MaterialIcons name="photo" size={64} color="white" />
          <ThemedText style={[styles.emptyText, { color: 'white' }]}>
            No memories yet
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: 'white' }]}>
            Start documenting your heritage
          </ThemedText>
        </ThemedView>
      );
    }

    const renderGridGroup = (startIndex: number) => {
      const groupMedia = media.slice(startIndex, startIndex + 5);
      if (groupMedia.length === 0) return null;

      return (
        <View key={startIndex} style={styles.instagramGrid}>
          <View style={styles.leftGrid}>
            {groupMedia.slice(0, 4).map((item) => (
              <TouchableOpacity 
                key={`rid-${item.id}`}
                style={styles.smallGridItem}
                onPress={() => handleMediaPress(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.gridImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
          {groupMedia.length > 4 && (
            <TouchableOpacity 
              style={styles.largeGridItem}
              onPress={() => handleMediaPress(groupMedia[4])}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: groupMedia[4].uri }}
                style={styles.gridImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          )}
        </View>
      );
    };

    const gridGroups = [];
    for (let i = 0; i < media.length; i += 5) {
      gridGroups.push(renderGridGroup(i));
    }

    return gridGroups;
  };

  const CustomActionSheet = () => (
    <Modal
      transparent={true}
      visible={showActionModal}
      animationType="fade"
      onRequestClose={() => setShowActionModal(false)}
    >
      <TouchableOpacity 
        style={styles.actionSheetOverlay} 
        activeOpacity={1}
        onPress={() => setShowActionModal(false)}
      >
        
          <View style={styles.actionSheetContent}>
            <ThemedText style={styles.actionSheetTitle}>Document Heritage</ThemedText>
            <ThemedText style={styles.actionSheetMessage}>
              How would you like to capture this moment?
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                router.push('/camera');
              }}
            >
              <MaterialIcons name="photo-camera" size={24} color="white" />
              <ThemedText style={styles.actionButtonText}>Take Photo/Video</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                pickMedia();
              }}
            >
              <MaterialIcons name="photo-library" size={24} color="white" />
              <ThemedText style={styles.actionButtonText}>Choose from Library</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowActionModal(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
     
      </TouchableOpacity>
    </Modal>
  );

  return (
    <ImageBackground 
      source={require('@/assets/images/heritage2.avif')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.container]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText type="title" style={styles.headerTitle}>
              Heritage Archive
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {media.length} {media.length === 1 ? 'memory' : 'memories'} preserved
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowActionModal(true)}
          >
            <MaterialIcons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View>
            {renderInstagramGrid()}
          </View>
        </ScrollView>

        <CustomActionSheet />
        <PhotoViewer
          media={selectedMedia}
          visible={showViewer}
          onClose={() => setShowViewer(false)}
          onDelete={handleDeleteMedia}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
    color: 'white',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  instagramGrid: {
    flexDirection: 'row',
    height: width * 0.6,
  },
  leftGrid: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallGridItem: {
    width: '50%',
    height: '50%',
    position: 'relative',
  },
  largeGridItem: {
    flex: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    margin: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  actionSheetOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  actionSheetContainer: {
    width: '100%',
    backgroundColor: 'rgb(0, 0, 0)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  actionSheetContent: {
    padding: 20,
    paddingBottom: 35,
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionSheetMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 25,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 18,
    borderRadius: 14,
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
});