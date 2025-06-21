import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Post } from '@/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface PostDetailModalProps {
  post: Post | null;
  isVisible: boolean;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, isVisible, onClose }) => {
  const [recommended, setRecommended] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'onSurface');
  const mutedColor = useThemeColor({}, 'onSurfaceVariant');
  
  useEffect(() => {
    if (post) {
      setLoading(true);
      fetch(`http://192.168.174.91:10000/api/vector/recommendations/posts/${post._id}`)
        .then(res => res.json())
        .then(data => {
          setRecommended(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch recommendations:", err);
          setLoading(false);
        });
    }
  }, [post]);

  if (!post) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={30} color={mutedColor} />
          </TouchableOpacity>
          <ScrollView>
            <Image source={{ uri: post.mediaItems[0]?.uri }} style={styles.mainImage} />
            <View style={styles.contentPadding}>
              <Text style={[styles.title, { color: textColor }]}>{post.title}</Text>
              <Text style={[styles.description, { color: textColor }]}>{post.description}</Text>
              
              {post.aiSummary && (
                <View style={styles.summaryContainer}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>AI Summary</Text>
                  <Text style={[styles.summaryText, { color: textColor }]}>{post.aiSummary.summary}</Text>
                </View>
              )}

              <View style={styles.separator} />

              <Text style={[styles.sectionTitle, { color: textColor }]}>Recommended</Text>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  horizontal
                  data={recommended}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <Image source={{ uri: item.mediaItems[0]?.uri }} style={styles.thumb} />
                  )}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  contentPadding: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  summaryContainer: {
    marginVertical: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 15,
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  }
});

export default PostDetailModal; 