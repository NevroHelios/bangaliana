// components/feed/PostContent.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

interface PostContentProps {
  postId: string;
  likeCount: number;
  commentCount: number;
  userName: string;
  title?: string;
  description?: string;
  tags: string[];
}

export const PostContent = ({ postId, likeCount, commentCount, userName, title, description, tags }: PostContentProps) => {
  const router = useRouter();
  const textColor = useThemeColor({}, "onSurface");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");
  const tagBg = useThemeColor({}, "secondaryContainer"); // Terracotta-like
  const tagText = useThemeColor({}, "onSecondaryContainer");

  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.likes, { color: textColor }]}>{likeCount} {likeCount === 1 ? 'appreciation' : 'appreciations'}</Text>
      
      {title && <Text style={[styles.title, {color: textColor}]}>{title}</Text>}

      <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
        <Text style={{ fontWeight: 'bold' }}>{userName} </Text>
        {description}
      </Text>

      {commentCount > 0 && (
        <TouchableOpacity onPress={() => router.push(`/comments?postId=${postId}`)}>
          <Text style={[styles.commentsLink, { color: mutedColor }]}>
            View all {commentCount} comments
          </Text>
        </TouchableOpacity>
      )}

      {tags?.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: tagBg }]}>
              <Text style={[styles.tagText, { color: tagText }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  likes: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  commentsLink: {
    marginTop: 8,
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});