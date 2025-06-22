// components/feed/PostCard.tsx
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Post, Comment } from "@/types"; // Make sure your types are correctly imported

import { PostHeader } from './PostHeader';
import { PostMedia } from './PostMedia';
import { PostActions } from './PostActions';
import { PostContent } from './PostContent';
import { PostCommentInput } from './PostCommentInput';

interface PostCardProps {
  item: Post;
  onLike: (postId: string, likes: string[]) => void;
  onComment: (postId: string, comments: Comment[]) => void;
  onPress: (post: Post) => void;
}

export const PostCard = ({ item, onLike, onComment, onPress }: PostCardProps) => {
  const { user, token, updateBookmarks } = useAuth();
  const cardBg = useThemeColor({}, "surface"); // This will be the card's background

  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  
  // Memoize isBookmarked state for optimistic updates
  const [isBookmarkedState, setIsBookmarkedState] = useState(user?.bookmarkedPosts?.includes(item._id) || false);


  const isLiked = item.likes.includes(user?._id || '');

  const handleLike = async () => {
    // Optimistic update can be added here
    try {
      const res = await fetch(`http://192.168.174.91:10000/api/posts/${item._id}/like`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to update like status');
      const data = await res.json();
      onLike(item._id, data.likes);
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert optimistic update here
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`http://192.168.174.91:10000/api/posts/${item._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const data = await res.json();
      onComment(item._id, data.comments);
      setCommentText("");
      setShowCommentInput(false);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleBookmark = async () => {
    const originalBookmarked = isBookmarkedState;
    setIsBookmarkedState(!originalBookmarked); // Optimistic UI update

    try {
      const res = await fetch(`http://192.168.174.91:10000/api/users/bookmarks/${item._id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to update bookmark');
      const data = await res.json();
      updateBookmarks(data.bookmarkedPosts);
    } catch (error) {
      console.error("Failed to bookmark post:", error);
      setIsBookmarkedState(originalBookmarked); // Revert on failure
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(item)}>
        <PostHeader
          user={item.userId}
          location={item.location?.name}
          createdAt={item.createdAt}
        />
        {item.mediaItems && item.mediaItems.length > 0 && (
          <PostMedia mediaItems={item.mediaItems} />
        )}
        
      </TouchableOpacity>

      <PostActions
        isLiked={isLiked}
        isBookmarked={isBookmarkedState}
        onLike={handleLike}
        onCommentPress={() => setShowCommentInput(!showCommentInput)}
        onBookmark={handleBookmark}
      />
      <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(item)}>
        <PostContent
          postId={item._id}
          likeCount={item.likes.length}
          commentCount={item.comments.length}
          userName={item.userId.name}
          title={item.title}
          description={item.description}
          tags={item.tags}
        />
      </TouchableOpacity>

      {showCommentInput && (
        <PostCommentInput
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={handleAddComment}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    // Shadow for a "lifted" feel, evoking a physical object
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});