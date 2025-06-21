import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
// import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Comment as CommentType, MediaItem } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface PhotoViewerProps {
  media: MediaItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (media: MediaItem) => void;
}

const { width, height } = Dimensions.get('window');

export function PhotoViewer({ media: initialMedia, visible, onClose, onDelete }: PhotoViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [media, setMedia] = useState<MediaItem | null>(initialMedia);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [geminiStory, setGeminiStory] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn'>('en');
  const colorScheme = useColorScheme();
  // const { user, token } = useAuth();

  useEffect(() => {
    setMedia(initialMedia);
    setGeminiStory(null);
    if (initialMedia?.geminiStory && initialMedia.geminiStory[selectedLanguage]) {
      setGeminiStory(initialMedia.geminiStory[selectedLanguage]);
    }
  }, [initialMedia, selectedLanguage]);

  if (!media) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete this ${media.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
            onDelete(media);
            onClose();
          }
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = async () => {
    // if (!user || !token || !media) return;
    try {
      // setMedia(prev => prev ? ({
      //   ...prev,
      //   likes: prev.likes.includes(user.id) 
      //     ? prev.likes.filter(id => id !== user.id) 
      //     : [...prev.likes, user.id]
      // }) : null);
    } catch (error) {
      console.error("Failed to update like status", error);
    }
  };

  const handleAddComment = async () => {
    // if (!user || !token || !media || !newComment.trim()) return;
    setIsCommenting(true);
    try {
      // const addedComment = await api.addCommentToMedia(media.id, newComment, token);
      // setMedia(prev => prev ? ({ ...prev, comments: [...(prev.comments || []), addedComment] }) : null);
      // setNewComment('');
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleGenerateStory = async () => {
    // if (!token || !media) return;
    setIsGeneratingStory(true);
    setGeminiStory(null);
    try {
      // const story = await api.generateStoryWithGemini(media.id, media.description || `Tell a story about this ${media.type}`, selectedLanguage, token);
      // setGeminiStory(story);
    } catch (error) {
      console.error("Failed to generate story", error);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // const userHasLiked = user && media.likes?.includes(user.id);
  const aspectRatio = media.aspectRatio || 1;
  const mediaHeight = Math.min(height * 0.6, width / aspectRatio);

  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerDate}>
            {formatDate(media.timestamp)}
          </ThemedText>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentScrollView}>
          <View style={[styles.mediaContainer, { height: mediaHeight }]}>
            {media.type === 'photo' ? (
              <Image source={{ uri: media.uri }} style={styles.media} contentFit="contain" />
            ) : (
              <Video
                source={{ uri: media.uri }}
                style={styles.media}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={isPlaying}
                isLooping
              />
            )}
          </View>

          {/* {user && ( */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#aaa"
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity 
                style={styles.postButton}
                onPress={handleAddComment}
                disabled={isCommenting || !newComment.trim()}
              >
                <MaterialIcons 
                  name="send" 
                  size={20} 
                  color={isCommenting || !newComment.trim() ? "#555" : Colors[colorScheme ?? 'light'].tertiary} 
                />
              </TouchableOpacity>
            </View>
          {/* )} */}

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <MaterialIcons 
                // name={userHasLiked ? "favorite" : "favorite-border"} 
                size={24} 
                // color={userHasLiked ? Colors[colorScheme ?? 'light'].tertiary : "white"} 
              />
              <ThemedText style={styles.actionText}>{media.likes?.length || 0}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat-bubble-outline" size={24} color="white" />
              <ThemedText style={styles.actionText}>{media.comments?.length || 0}</ThemedText>
            </TouchableOpacity>

            <View style={styles.languageSelector}>
              <TouchableOpacity 
                onPress={() => setSelectedLanguage('en')} 
                style={[styles.langButton, selectedLanguage === 'en' && styles.langButtonActive]}
              >
                <ThemedText style={styles.langText}>EN</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedLanguage('bn')} 
                style={[styles.langButton, selectedLanguage === 'bn' && styles.langButtonActive]}
              >
                <ThemedText style={styles.langText}>BN</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {geminiStory ? (
            <View style={styles.storySection}>
              <ThemedText style={styles.storyText}>{geminiStory}</ThemedText>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateStory}
              disabled={isGeneratingStory}
            >
              {isGeneratingStory ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.generateButtonText}>Generate Story</ThemedText>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.commentsSection}>
            {media.comments?.map((comment: CommentType) => (
              <View key={comment.id} style={styles.commentItem}>
                <ThemedText style={styles.commentUser}>{comment.userName}:</ThemedText>
                <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerButton: {
    padding: 8,
  },
  headerDate: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  contentScrollView: {
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: 'white',
  },
  postButton: {
    marginLeft: 8,
    padding: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  languageSelector: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  langButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  langText: {
    color: 'white',
    fontWeight: 'bold',
  },
  storySection: {
    padding: 16,
  },
  storyText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  generateButton: {
    margin: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  commentsSection: {
    paddingHorizontal: 16,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  commentUser: {
    color: '#E0E0E0',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  commentText: {
    color: 'white',
    fontSize: 14,
  },
});