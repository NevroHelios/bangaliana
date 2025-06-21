import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 2;
const containerPadding = 12;
const itemWidth = (width - containerPadding * 2 - gap) / numColumns;

export default function PhotoGallery({ media, onMediaPress } : { media: any[]; onMediaPress: (item: any) => void }) {
  const colorScheme = useColorScheme() ?? 'light';

  if (media.length === 0) {
    return (
      <View style={styles.fullContainer}>
        <BlurView intensity={20} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.glassContainer}>
          <View style={styles.emptyContent}>
            <View style={[
              styles.emptyIcon,
              { backgroundColor: Colors[colorScheme].primary + '20' }
            ]}>
              <IconSymbol 
                name="house.fill" 
                size={48} 
                color={Colors[colorScheme].primary}
              />
            </View>
            <ThemedText style={[
              styles.emptyTitle,
              { color: Colors[colorScheme].primary }
            ]}>
              Document Your Heritage
            </ThemedText>
            <ThemedText style={[
              styles.emptySubtext,
              { color: Colors[colorScheme].onBackground }
            ]}>
              Capture photos and videos of local culture, traditions, and historical moments to preserve them for future generations
            </ThemedText>
          </View>
        </BlurView>
      </View>
    );
  }

  const renderMediaItem = ({ item, index } : { item: any; index: number }) => {
    const isLarge = index % 6 === 0 || index % 6 === 3;
    const itemHeight = isLarge ? itemWidth * 1.3 : itemWidth * 0.8;
    return (
      <TouchableOpacity
        style={[
          styles.mediaItem,
          {
            width: isLarge ? width - containerPadding * 2 : itemWidth,
            height: itemHeight,
            marginBottom: gap,
            marginRight: isLarge || (index + 1) % numColumns === 0 ? 0 : gap,
          }
        ]}
        onPress={() => onMediaPress(item)}
        activeOpacity={0.9}
      >
        <BlurView intensity={30} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.mediaBlurContainer}>
          <View style={styles.mediaContent}>
            {item.type === 'photo' ? (
              <Image 
                source={{ uri: item.uri }} 
                style={styles.media}
                contentFit="cover"
              />
            ) : (
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: item.uri }}
                  style={styles.media}
                  shouldPlay={false}
                  isLooping={false}
                  resizeMode={ResizeMode.COVER}
                />
                <View style={styles.videoOverlay}>
                  <BlurView intensity={80} tint="dark" style={styles.playButtonBlur}>
                    <IconSymbol name="paperplane.fill" size={16} color="#ffffff" />
                  </BlurView>
                </View>
              </View>
            )}
            <View style={styles.mediaOverlay}>
              <BlurView intensity={40} tint="dark" style={styles.overlayBlur}>
                <View style={styles.mediaInfo}>
                  <IconSymbol 
                    name={item.type === 'photo' ? 'house.fill' : 'paperplane.fill'} 
                    size={10} 
                    color="#ffffff" 
                  />
                </View>
              </BlurView>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.fullContainer}>
      <BlurView intensity={70} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.glassContainer}>
        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.galleryContent}
          style={styles.gallery}
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  glassContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    margin: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gallery: {
    flex: 1,
  },
  galleryContent: {
    padding: containerPadding,
    flexGrow: 1,
  },
  mediaItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaBlurContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaContent: {
    flex: 1,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  playButtonBlur: {
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  overlayBlur: {
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
});
