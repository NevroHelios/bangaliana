import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MediaItem, PostData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface PostPreviewProps {
  postData: PostData;
  selectedMedia: MediaItem[];
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  locationVisibility: boolean;
  onBack: () => void;
  onShare: () => void;
  // Theme Colors
  backgroundColor: string;
  onBackgroundColor: string;
  primaryColor: string;
  onPrimaryColor: string;
  onSurfaceVariantColor: string;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  postData,
  selectedMedia,
  currentMediaIndex,
  setCurrentMediaIndex,
  locationVisibility,
  onBack,
  onShare,
  backgroundColor,
  onBackgroundColor,
  primaryColor,
  onPrimaryColor,
  onSurfaceVariantColor
}) => {
  const currentMedia = selectedMedia[currentMediaIndex];

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <TouchableOpacity style={[styles.backButton, styles.glassButton]} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.titleText}>Preview</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ThemedView style={[styles.previewPost, styles.glassContainer]}>
        <View style={[styles.postHeader, { borderBottomColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, styles.glassButton]}>
              <ThemedText style={styles.avatarText}>U</ThemedText>
            </View>
            <View>
              <ThemedText type="defaultSemiBold" style={styles.username}>Your Username</ThemedText>
              {postData.location && locationVisibility && (
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={12} color="rgba(255, 255, 255, 0.7)" />
                  <ThemedText style={styles.locationText}>{postData.location.name}</ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>

        {currentMedia && (
          <View style={styles.postMedia}>
            {currentMedia.type === 'video' ? (
              <Video 
                source={{ uri: currentMedia.uri }} 
                style={styles.postImage} 
                useNativeControls 
                resizeMode={ResizeMode.CONTAIN} 
              />
            ) : (
              <Image 
                source={{ uri: currentMedia.uri }} 
                style={styles.postImage} 
                resizeMode="cover" 
              />
            )}
            {selectedMedia.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.previewNavButton, styles.previewPrevButton, styles.glassButton]} 
                  onPress={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))} 
                  disabled={currentMediaIndex === 0}
                >
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.previewNavButton, styles.previewNextButton, styles.glassButton]} 
                  onPress={() => setCurrentMediaIndex(Math.min(selectedMedia.length - 1, currentMediaIndex + 1))} 
                  disabled={currentMediaIndex === selectedMedia.length - 1}
                >
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
                <View style={[styles.mediaCounter, styles.glassButton]}>
                  <ThemedText style={styles.mediaCounterText}>{currentMediaIndex + 1}/{selectedMedia.length}</ThemedText>
                </View>
              </>
            )}
          </View>
        )}

        <ThemedView style={styles.postContent}>
          {postData.title && <ThemedText type="subtitle" style={styles.postTitle}>{postData.title}</ThemedText>}
          {postData.description && <ThemedText style={styles.postDescription}>{postData.description}</ThemedText>}
          <View style={[styles.postMeta, { borderTopColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <View style={styles.metaLeft}>
              <View style={styles.metaItem}>
                <Ionicons name="globe" size={14} color="rgba(255, 255, 255, 0.7)" />
                <ThemedText style={styles.metaText}>{postData.visibility}</ThemedText>
              </View>
              {postData.featured && (
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <ThemedText style={[styles.metaText, { color: "#F59E0B" }]}>Featured</ThemedText>
                </View>
              )}
            </View>
          </View>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={[styles.shareButton, styles.glassButton]} onPress={onShare}>
        <ThemedText style={styles.shareButtonText}>Share Post</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16 
  },
  stepHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    paddingHorizontal: 8 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    fontSize: 24,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  placeholder: { width: 64 },
  previewPost: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 24 
  },
  postHeader: { 
    padding: 16, 
    borderBottomWidth: 1 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    fontSize: 18, 
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  username: { 
    fontSize: 16, 
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginTop: 2 
  },
  locationText: { 
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  postMedia: { 
    position: 'relative', 
    aspectRatio: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.2)' 
  },
  postImage: { 
    width: '100%', 
    height: '100%' 
  },
  mediaCounter: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 4 
  },
  mediaCounterText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  previewNavButton: { 
    position: 'absolute', 
    top: '50%', 
    transform: [{ translateY: -25 }], 
    borderRadius: 25, 
    padding: 10, 
    zIndex: 1 
  },
  previewPrevButton: { left: 12 },
  previewNextButton: { right: 12 },
  postContent: { 
    padding: 16, 
    gap: 12 
  },
  postTitle: { 
    fontSize: 20, 
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  postDescription: { 
    fontSize: 16, 
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  postMeta: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 12, 
    borderTopWidth: 1 
  },
  metaLeft: { 
    flexDirection: 'row', 
    gap: 16 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  metaText: { 
    fontSize: 14, 
    textTransform: 'capitalize',
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shareButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    borderRadius: 16, 
    marginBottom: 20 
  },
  shareButtonText: { 
    fontSize: 18, 
    fontWeight: '700',
    color: 'white',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
});