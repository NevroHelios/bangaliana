// app/(tabs)/feed.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Dimensions, ImageBackground } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Post, Comment } from "@/types"; // Make sure your types are correctly imported
import PostDetailModal from "@/components/PostDetailModal";
import { PostCard } from "@/components/feed/PostCard"; // Import the new PostCard
// import RecommendationsModal from "@/components/RecommendationsModal";

const Feed = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recommendationsVisible, setRecommendationsVisible] = useState(false);
  const [similarPosts, setSimilarPosts] = useState<Post[]>([]);
  const bgColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "onSurface");

  const handleLikeUpdate = useCallback((postId: string, newLikes: string[]) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, likes: newLikes } : post
      )
    );
  }, []);

  const handleCommentUpdate = useCallback((postId: string, newComments: Comment[]) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, comments: newComments } : post
      )
    );
  }, []);

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
  };

  useEffect(() => {
    if (!token) return;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://192.168.174.91:10000/api/posts?limit=100&populate=userId`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(`Failed to fetch posts: ${res.status} ${errorData}`);
        }
        const data = await res.json();
        setPosts(data.posts || data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [token]);

  if (loading) {
    return (
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={[styles.centerContainer, styles.contentContainer]}>
          <ActivityIndicator size="large" color={'white'} />
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={[styles.centerContainer, styles.contentContainer]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.contentContainer}>
          <FlatList
            data={posts}
            renderItem={({ item }) => (
              <PostCard
                item={item}
                onLike={handleLikeUpdate}
                onComment={handleCommentUpdate}
                onPress={handlePostPress}
              />
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={[styles.emptyText, { color: 'white' }]}>
                  No stories found. Be the first to share one!
                </Text>
              </View>
            }
          />
        </View>
      </ImageBackground>
      
      <PostDetailModal
        post={selectedPost}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      {/* <RecommendationsModal
        visible={recommendationsVisible}
        onClose={() => setRecommendationsVisible(false)}
        posts={similarPosts}
      /> */}
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for better content readability
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 70,
  },
  flatListContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.6,
  },
  errorText: {
    color: '#ff6b6b',
    margin: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
  },
  emptyText: {
    textAlign: "center",
    margin: 40,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    fontWeight: '500',
  },
});

export default Feed;