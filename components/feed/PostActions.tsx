// components/feed/PostActions.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

interface PostActionsProps {
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onCommentPress: () => void;
  onBookmark: () => void;
}

export const PostActions = ({ isLiked, isBookmarked, onLike, onCommentPress, onBookmark }: PostActionsProps) => {
  const textColor = useThemeColor({}, "onSurface");
  const accentColor = useThemeColor({}, "primary"); // Marigold
  const likeColor = '#F4A261'; // A warm, friendly orange for the like

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={onLike}>
        {/* Using 'flower' as a lotus/marigold motif */}
        <Ionicons
          name={isLiked ? "flower" : "flower-outline"}
          size={28}
          color={isLiked ? likeColor : textColor}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
        <Ionicons name="chatbubble-outline" size={26} color={textColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="paper-plane-outline" size={26} color={textColor} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.bookmarkButton]} onPress={onBookmark}>
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={26}
          color={isBookmarked ? accentColor : textColor}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  bookmarkButton: {
    marginLeft: 'auto',
    marginRight: 0,
  },
});