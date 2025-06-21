import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Post, Comment } from "@/types";
import { useRouter } from "expo-router";
import PostDetailModal from "@/components/PostDetailModal";

interface MediaItem {
  _id: string;
  uri: string;
  type: "photo" | "video";
  title?: string;
  description?: string;
  location?: { name?: string; latitude?: number; longitude?: number };
}

interface Post {
  _id: string;
  title?: string;
  description?: string;
  mediaItems: MediaItem[];
  tags: string[];
  location?: { type: string; coordinates: number[]; name?: string };
  likes: any[];
  comments: Comment[];
  featured: boolean;
  visibility: string;
  aiSummary?: any;
  culturalContext?: any;
  creativeContext?: any;
  travelContext?: any;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export const PostCard = ({ item, onLike, onComment, onPress }: { item: Post, onLike: (postId: string, likes: string[]) => void, onComment: (postId: string, comments: Comment[]) => void, onPress: (post: Post) => void }) => {
  const { user, token, updateBookmarks } = useAuth();
  const router = useRouter();
  const cardBg = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "onSurface");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");
  const primaryColor = useThemeColor({}, "primary");
  const tagBg = useThemeColor({}, "secondaryContainer");
  const tagText = useThemeColor({}, "onSecondaryContainer");

  const [currentImage, setCurrentImage] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  const isLiked = item.likes.includes(user?._id || '');
  const likeCount = item.likes.length;
  const isBookmarked = user?.bookmarkedPosts?.includes(item._id) || false;

  const handleLike = async () => {
    try {
      const res = await fetch(`http://192.168.174.91:10000/api/posts/${item._id}/like`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }

      const data = await res.json();
      onLike(item._id, data.likes);

    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`http://192.168.174.91:10000/api/posts/${item._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (!res.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await res.json();
      onComment(item._id, data.comments);
      setCommentText("");
      setShowCommentInput(false);

    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleBookmark = async () => {
    const originalBookmarked = isBookmarked;
    setIsBookmarked(!originalBookmarked);

    try {
      const res = await fetch(`http://192.168.174.91:10000/api/users/bookmarks/${item._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to update bookmark status');
      }
      const data = await res.json();
      updateBookmarks(data.bookmarkedPosts);

    } catch (error) {
      console.error("Failed to bookmark post:", error);
      setIsBookmarked(originalBookmarked);
    }
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.mediaContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
    </View>
  );

  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri:
                item.userId?.avatar ||
                `https://ui-avatars.com/api/?name=${item.userId?.name}&background=random`,
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.userName, { color: textColor }]}>{item.userId?.name || "Unknown User"}</Text>
            {item.location?.name && (
              <Text style={[styles.location, { color: mutedColor }]}>
                <Ionicons name="location-sharp" size={14} color={mutedColor} /> {item.location.name}
              </Text>
            )}
          </View>
          <Ionicons name="ellipsis-horizontal" size={24} color={mutedColor} style={styles.ellipsis} />
        </View>

        {/* Media Content */}
        {item.mediaItems && item.mediaItems.length > 0 && (
          <View style={styles.mediaSection}>
            <FlatList
              horizontal
              pagingEnabled
              data={item.mediaItems}
              renderItem={renderMediaItem}
              keyExtractor={(media) => media._id}
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                setCurrentImage(index);
              }}
            />
            {item.mediaItems.length > 1 && (
              <View style={styles.pagination}>
                {item.mediaItems.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.dot, { backgroundColor: currentImage === index ? primaryColor : mutedColor }]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? 'red' : textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowCommentInput(!showCommentInput)}>
            <Ionicons name="chatbubble-outline" size={26} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={26} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]} onPress={handleBookmark}>
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color={isBookmarked ? primaryColor : textColor} />
          </TouchableOpacity>
        </View>

        {/* Likes and Description */}
        <View style={styles.cardFooter}>
          <Text style={[styles.likes, { color: textColor }]}>{likeCount} likes</Text>
          <Text style={[styles.description, { color: textColor }]}>
            <Text style={{ fontWeight: 'bold' }}>{item.userId?.name || "User"} </Text>
            {item.title || item.description}
          </Text>
          {item.comments?.length > 0 && (
            <TouchableOpacity onPress={() => router.push(`/comments?postId=${item._id}`)}>
              <Text style={[styles.commentsLink, { color: mutedColor }]}>View all {item.comments.length} comments</Text>
            </TouchableOpacity>
          )}
          {showCommentInput && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={[styles.commentInput, { color: textColor, borderColor: mutedColor }]}
                placeholder="Add a comment..."
                placeholderTextColor={mutedColor}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity onPress={handleAddComment}>
                <Text style={{ color: primaryColor, fontWeight: 'bold' }}>Post</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: tagText }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={[styles.date, { color: mutedColor }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Feed = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const bgColor = useThemeColor({}, "background");

  const handleLikeUpdate = (postId: string, newLikes: string[]) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, likes: newLikes } : post
      )
    );
  };

  const handleCommentUpdate = (postId: string, newComments: Comment[]) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, comments: newComments } : post
      )
    );
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
  };

  useEffect(() => {
    if (!token) return;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://192.168.174.91:10000/api/posts?limit=100&populate=userId`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  if (loading)
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={useThemeColor({}, 'primary')} />
      </View>
    );

  if (error)
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: "red", margin: 20 }}>{error}</Text>
      </View>
    );

  return (
    <>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard item={item} onLike={handleLikeUpdate} onComment={handleCommentUpdate} onPress={handlePostPress} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ backgroundColor: bgColor, paddingTop: 10 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: Dimensions.get('window').height * 0.7 }}>
            <Text style={{ textAlign: "center", margin: 40, fontSize: 16, color: useThemeColor({}, 'onSurface') }}>
              No posts found.
            </Text>
          </View>
        }
      />
      <PostDetailModal
        post={selectedPost}
        isVisible={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginVertical: 10,
    // No horizontal margin for full-width cards
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    fontSize: 12,
  },
  ellipsis: {
    marginLeft: 'auto',
  },
  mediaSection: {
    // Media takes full width of the card
  },
  mediaContainer: {
    width: width, // Full screen width for each media item
    height: width, // Make it a square
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  actionButton: {
    padding: 5,
  },
  cardFooter: {
    paddingHorizontal: 12,
  },
  likes: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    marginBottom: 5,
    lineHeight: 20,
  },
  commentsLink: {
    marginBottom: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 5,
    marginRight: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  tag: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default Feed;
