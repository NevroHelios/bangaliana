import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { MediaItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MediaSelectionProps {
  selectedMedia: MediaItem[];
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  onMediaRemove: (id: number) => void;
  onMediaSelect: () => void;
  onNext: () => void;
  // Theme Colors
  backgroundColor: string;
  primaryColor: string;
  onPrimaryColor: string;
  errorColor: string;
  onSurfaceVariantColor: string;
}

const MediaThumbnail: React.FC<{
  item: MediaItem;
  index: number;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, index, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.thumbnail, isActive && styles.activeThumbnail]}
    onPress={onPress}
  >
    <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
    {item.type === 'video' && (
      <View style={styles.videoIndicator}>
        <Ionicons name="play" size={12} color="white" />
      </View>
    )}
  </TouchableOpacity>
);

export const MediaSelection: React.FC<MediaSelectionProps> = ({
  selectedMedia,
  currentMediaIndex,
  setCurrentMediaIndex,
  onMediaRemove,
  onMediaSelect,
  onNext,
  backgroundColor,
  primaryColor,
  onPrimaryColor,
  errorColor,
  onSurfaceVariantColor,
}) => {
  return (
    <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.titleText}>Select Media</ThemedText>
        <ThemedText style={[styles.counterText, { color: onSurfaceVariantColor }]}>{selectedMedia.length}/20 selected</ThemedText>
      </View>

      {selectedMedia.length > 0 ? (
        <ThemedView style={[styles.mediaPreviewContainer, styles.glassContainer]}>
          <View style={styles.mainMediaContainer}>
            {selectedMedia[currentMediaIndex]?.type === 'video' ? (
              <Video
                source={{ uri: selectedMedia[currentMediaIndex]?.uri }}
                style={styles.mainMedia}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : (
              <Image
                source={{ uri: selectedMedia[currentMediaIndex]?.uri }}
                style={styles.mainMedia}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={[styles.removeButton, styles.glassButton, { borderColor: errorColor }]}
              onPress={() => onMediaRemove(selectedMedia[currentMediaIndex]?.id)}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
            {selectedMedia.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton, styles.glassButton]}
                  onPress={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                  disabled={currentMediaIndex === 0}
                >
                  <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton, styles.glassButton]}
                  onPress={() => setCurrentMediaIndex(Math.min(selectedMedia.length - 1, currentMediaIndex + 1))}
                  disabled={currentMediaIndex === selectedMedia.length - 1}
                >
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
              </>
            )}
          </View>
          {selectedMedia.length > 1 && (
            <FlatList
              data={selectedMedia}
              renderItem={({ item, index }) => (
                <MediaThumbnail
                  item={item}
                  index={index}
                  isActive={index === currentMediaIndex}
                  onPress={() => setCurrentMediaIndex(index)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailList}
            />
          )}
        </ThemedView>
      ) : (
        <ThemedView style={[styles.emptyState, styles.glassContainer]}>
          <Ionicons name="image-outline" size={60} color="rgba(255, 255, 255, 0.6)" />
          <ThemedText style={[styles.emptyStateText, { color: onSurfaceVariantColor }]}>No media selected</ThemedText>
        </ThemedView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.selectButton, styles.glassButton, selectedMedia.length >= 20 && styles.disabledButton]}
          onPress={onMediaSelect}
          disabled={selectedMedia.length >= 20}
        >
          <Ionicons name="images" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Select from Gallery</ThemedText>
        </TouchableOpacity>

        {selectedMedia.length > 0 && (
          <TouchableOpacity
            style={[styles.nextStepButton, styles.glassButton]}
            onPress={onNext}
          >
            <ThemedText style={styles.buttonText}>Next</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  titleText: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  counterText: {
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mediaPreviewContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  mainMediaContainer: {
    position: 'relative',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  mainMedia: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    padding: 6,
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -22 }],
    borderRadius: 20,
    padding: 8,
  },
  prevButton: { left: 12 },
  nextButton: { right: 12 },
  thumbnailList: { marginTop: 12 },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeThumbnail: {
    borderColor: '#00BCD4',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    gap: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextStepButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Glass effect styles
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
});