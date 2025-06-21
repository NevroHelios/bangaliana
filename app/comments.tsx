import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '@/types';

const CommentsScreen = () => {
  const { postId } = useLocalSearchParams();
  const { user, token } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'onSurface');
  const mutedColor = useTheme-color({}, 'onSurfaceVariant');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://192.168.174.91:10000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`http://192.168.174.91:10000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      setComments(data.comments);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentContainer, { backgroundColor: cardBg }]}>
      <Text style={[styles.commentUser, { color: textColor }]}>{item.userName}</Text>
      <Text style={[styles.commentText, { color: textColor }]}>{item.text}</Text>
      <Text style={[styles.commentDate, { color: mutedColor }]}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Comments</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: textColor }}>No comments yet.</Text>}
        />
      )}
      <View style={[styles.inputContainer, { backgroundColor: cardBg }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Add a comment..."
          placeholderTextColor={mutedColor}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Ionicons name="send" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  commentContainer: { padding: 10, marginVertical: 5, marginHorizontal: 10, borderRadius: 8 },
  commentUser: { fontWeight: 'bold' },
  commentText: { marginTop: 5 },
  commentDate: { fontSize: 12, color: 'gray', marginTop: 5, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: 'lightgray' },
  input: { flex: 1, height: 40, marginRight: 10 },
});

export default CommentsScreen; 