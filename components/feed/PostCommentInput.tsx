// components/feed/PostCommentInput.tsx
import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface PostCommentInputProps {
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
}

export const PostCommentInput = ({ commentText, setCommentText, onAddComment }: PostCommentInputProps) => {
  const textColor = useThemeColor({}, "onSurface");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surfaceVariant");

  return (
    <View style={[styles.commentInputContainer, { borderTopColor: surfaceColor }]}>
      <TextInput
        style={[styles.commentInput, { color: textColor, borderColor: mutedColor }]}
        placeholder="Share your thoughts..."
        placeholderTextColor={mutedColor}
        value={commentText}
        onChangeText={setCommentText}
        multiline
      />
      <TouchableOpacity onPress={onAddComment} style={styles.postButton}>
        <Text style={{ color: primaryColor, fontWeight: 'bold' }}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 15,
  },
  postButton: {
    padding: 8,
  }
});