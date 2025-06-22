import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PostCard } from "@/components/feed/PostCard"; // Corrected import
import { Post, Comment } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import PostDetailModal from "@/components/PostDetailModal";

const BookmarksScreen = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const bgColor = useThemeColor({}, "background");

  const fetchBookmarks = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://192.168.174.91:10000/api/users/bookmarks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(
          `Failed to fetch bookmarks: ${res.status} ${errorData}`
        );
      }
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [token])
  );

  const handleLikeUpdate = (postId: string, newLikes: string[]) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, likes: newLikes } : post
      )
    );
  };

  const handleCommentUpdate = (postId: string, newComments: Comment[]) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, comments: newComments } : post
      )
    );
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  if (loading)
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={useThemeColor({}, "primary")} />
      </View>
    );

  if (error)
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: "red", margin: 20 }}>{error}</Text>
      </View>
    );

  return (
    <>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onLike={handleLikeUpdate}
            onComment={handleCommentUpdate}
            onPress={handlePostPress}
          />
        )
        }
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ backgroundColor: bgColor, paddingTop: 10 }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: Dimensions.get("window").height * 0.7,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                margin: 40,
                fontSize: 16,
                color: useThemeColor({}, "onSurface"),
              }}
            >
              You haven't bookmarked any posts yet.
            </Text>
          </View>
        }
      />
      <PostDetailModal
        post={selectedPost}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BookmarksScreen;
