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
  Modal,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Comment } from "@/types";
import { useRouter } from "expo-router";

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

// Helper to ensure color is always a string
function getColor(color: any, fallback: string = "#000") {
  return typeof color === "string" ? color : fallback;
}

export const PostCard = ({
  item,
  onLike,
  onComment,
}: {
  item: Post;
  onLike: (postId: string, likes: string[]) => void;
  onComment: (postId: string, comments: Comment[]) => void;
}) => {
  const { user, token, updateBookmarks } = useAuth();
  const router = useRouter();
  const cardBg = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "onSurface");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");
  const primaryColor = useThemeColor({}, "primary");
  const tagBg = useThemeColor({}, "secondaryContainer");
  const tagText = useThemeColor({}, "onSecondaryContainer");

  const [currentImage, setCurrentImage] = useState(0);
  const userId = (user as any)?._id || (user as any)?.id || "";
  const [isLiked, setIsLiked] = useState(item.likes.includes(userId));
  const [likeCount, setLikeCount] = useState(item.likes.length);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    user?.bookmarkedPosts?.includes(item._id) || false
  );

  useEffect(() => {
    setIsLiked(item.likes.includes(userId));
    setLikeCount(item.likes.length);
    setIsBookmarked(user?.bookmarkedPosts?.includes(item._id) || false);
  }, [item.likes, user]);

  const handleLike = async () => {
    const originalLiked = isLiked;
    const originalLikeCount = likeCount;

    // Optimistic update
    setIsLiked(!originalLiked);
    setLikeCount(originalLiked ? originalLikeCount - 1 : originalLikeCount + 1);

    try {
      const res = await fetch(
        `http://192.168.233.236:10000/api/posts/${item._id}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update like status");
      }

      const data = await res.json();
      onLike(item._id, data.likes);
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert on error
      setIsLiked(originalLiked);
      setLikeCount(originalLikeCount);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(
        `http://192.168.233.236:10000/api/posts/${item._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: commentText }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to add comment");
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
      const res = await fetch(
        `http://192.168.233.236:10000/api/users/bookmarks/${item._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update bookmark status");
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
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );

  // Use getColor for all theme colors
  const cardBgStr = getColor(cardBg, "#fff");
  const textColorStr = getColor(textColor, "#222");
  const mutedColorStr = getColor(mutedColor, "#888");
  const primaryColorStr = getColor(primaryColor, "#B22222");
  const tagBgStr = getColor(tagBg, "#FFD700");
  const tagTextStr = getColor(tagText, "#B22222");

  return (
    <View style={[styles.card, { backgroundColor: cardBgStr }]}>
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
          <Text style={[styles.userName, { color: textColorStr }]}>
            {item.userId?.name || "Unknown User"}
          </Text>
          {item.location?.name && (
            <Text style={[styles.location, { color: mutedColorStr }]}>
              <Ionicons name="location-sharp" size={14} color={mutedColorStr} />{" "}
              {item.location.name}
            </Text>
          )}
        </View>
        <Ionicons
          name="ellipsis-horizontal"
          size={24}
          color={mutedColorStr}
          style={styles.ellipsis}
        />
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
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (width - 40)
              );
              setCurrentImage(index);
            }}
          />
          {item.mediaItems.length > 1 && (
            <View style={styles.pagination}>
              {item.mediaItems.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        currentImage === index
                          ? primaryColorStr
                          : mutedColorStr,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "red" : textColorStr}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCommentInput(!showCommentInput)}
        >
          <Ionicons name="chatbubble-outline" size={26} color={textColorStr} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={26} color={textColorStr} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { marginLeft: "auto" }]}
          onPress={handleBookmark}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarked ? primaryColorStr : textColorStr}
          />
        </TouchableOpacity>
      </View>

      {/* Likes and Description */}
      <View style={styles.cardFooter}>
        <Text style={[styles.likes, { color: textColorStr }]}>
          {likeCount} likes
        </Text>
        <Text style={[styles.description, { color: textColorStr }]}>
          <Text style={{ fontWeight: "bold" }}>
            {item.userId?.name || "User"}{" "}
          </Text>
          {item.title || item.description}
        </Text>
        {item.comments?.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push(`/comments?postId=${item._id}`)}
          >
            <Text style={[styles.commentsLink, { color: mutedColorStr }]}>
              View all {item.comments.length} comments
            </Text>
          </TouchableOpacity>
        )}
        {showCommentInput && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={[
                styles.commentInput,
                { color: textColorStr, borderColor: mutedColorStr },
              ]}
              placeholder="Add a comment..."
              placeholderTextColor={mutedColorStr}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Text style={{ color: primaryColorStr, fontWeight: "bold" }}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {item.tags?.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: tagBgStr }]}
              >
                <Text style={[styles.tagText, { color: tagTextStr }]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}
        <Text style={[styles.date, { color: mutedColorStr }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// Bengali-inspired Post Details Modal
const PostDetailsModal = ({
  post,
  visible,
  onClose,
  onShowRecommendations,
}: {
  post: Post | null;
  visible: boolean;
  onClose: () => void;
  onShowRecommendations: () => void;
}) => {
  if (!post) return null;
  const primaryColor = "#B22222"; // Bengali red
  const accentColor = "#FFD700"; // Gold
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.85)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff8f0",
            borderRadius: 20,
            width: "92%",
            maxHeight: "90%",
            padding: 18,
            borderWidth: 2,
            borderColor: primaryColor,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: primaryColor,
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              {post.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#333",
                fontStyle: "italic",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {post.location?.name}
            </Text>
            {post.mediaItems && post.mediaItems.length > 0 && (
              <Image
                source={{ uri: post.mediaItems[0].uri }}
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 14,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: accentColor,
                }}
                resizeMode="cover"
              />
            )}
            <Text
              style={{
                fontWeight: "bold",
                color: primaryColor,
                marginBottom: 2,
              }}
            >
              Description:
            </Text>
            <Text style={{ color: "#444", marginBottom: 8 }}>
              {post.description || "No description."}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                color: primaryColor,
                marginBottom: 2,
              }}
            >
              Tags:
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {post.tags.map((tag, idx) => (
                <Text
                  key={idx}
                  style={{
                    backgroundColor: accentColor,
                    color: primaryColor,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    margin: 2,
                    fontSize: 13,
                  }}
                >
                  #{tag}
                </Text>
              ))}
            </View>
            <Text
              style={{
                fontWeight: "bold",
                color: primaryColor,
                marginBottom: 2,
              }}
            >
              Cultural Context:
            </Text>
            {post.culturalContext ? (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: "#444" }}>
                  Significance: {post.culturalContext.significance}
                </Text>
                <Text style={{ color: "#444" }}>
                  History: {post.culturalContext.historicalContext}
                </Text>
                <Text style={{ color: "#444" }}>
                  Preservation: {post.culturalContext.preservation}
                </Text>
              </View>
            ) : (
              <Text style={{ color: "#888", marginBottom: 8 }}>N/A</Text>
            )}
            <Text
              style={{
                fontWeight: "bold",
                color: primaryColor,
                marginBottom: 2,
              }}
            >
              AI Summary:
            </Text>
            {post.aiSummary?.summary && (
              <Text style={{ color: "#444", marginBottom: 8 }}>
                {typeof post.aiSummary.summary === "string"
                  ? post.aiSummary.summary
                  : JSON.stringify(post.aiSummary.summary)}
              </Text>
            )}
            {post.aiSummary?.hashtags && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {post.aiSummary.hashtags.map((h: string, idx: number) => (
                  <Text
                    key={idx}
                    style={{ color: primaryColor, marginRight: 6 }}
                  >
                    {h}
                  </Text>
                ))}
              </View>
            )}
            {post.aiSummary?.themes && (
              <Text style={{ color: accentColor, marginBottom: 8 }}>
                Themes: {post.aiSummary.themes.join(", ")}
              </Text>
            )}
            <Text
              style={{
                fontWeight: "bold",
                color: primaryColor,
                marginBottom: 2,
              }}
            >
              Other Details:
            </Text>
            <Text style={{ color: "#444" }}>Visibility: {post.visibility}</Text>
            <Text style={{ color: "#444" }}>
              Featured: {post.featured ? "Yes" : "No"}
            </Text>
            <Text style={{ color: "#444" }}>
              Created: {new Date(post.createdAt).toLocaleString()}
            </Text>
            <Text style={{ color: "#444", marginBottom: 12 }}>
              Updated: {new Date(post.updatedAt).toLocaleString()}
            </Text>
            <TouchableOpacity
              onPress={onShowRecommendations}
              style={{
                alignSelf: "center",
                backgroundColor: accentColor,
                borderRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 8,
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: primaryColor,
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Show recommendations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{
                alignSelf: "center",
                backgroundColor: primaryColor,
                borderRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 8,
                marginTop: 0,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Bengali-inspired Recommendations Modal
const RecommendationsModal = ({
  visible,
  onClose,
  posts,
}: {
  visible: boolean;
  onClose: () => void;
  posts: Post[];
}) => {
  const primaryColor = "#B22222";
  const accentColor = "#FFD700";
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.92)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff8f0",
            borderRadius: 20,
            width: "96%",
            maxHeight: "94%",
            padding: 10,
            borderWidth: 2,
            borderColor: primaryColor,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: primaryColor,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Recommended Posts
            </Text>
            {posts.length === 0 && (
              <Text
                style={{
                  color: "#888",
                  textAlign: "center",
                  marginVertical: 20,
                }}
              >
                No recommendations found.
              </Text>
            )}
            {posts.map((post, idx) => (
              <View
                key={post._id || idx}
                style={{
                  marginBottom: 24,
                  borderBottomWidth: 1,
                  borderColor: accentColor,
                  paddingBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: primaryColor,
                    marginBottom: 2,
                  }}
                >
                  {post.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#333",
                    fontStyle: "italic",
                    marginBottom: 4,
                  }}
                >
                  {post.location?.name}
                </Text>
                {post.mediaItems && post.mediaItems.length > 0 && (
                  <Image
                    source={{ uri: post.mediaItems[0].uri }}
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 10,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: accentColor,
                    }}
                    resizeMode="cover"
                  />
                )}
                <Text style={{ color: "#444", marginBottom: 4 }}>
                  {post.description || "No description."}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginBottom: 4,
                  }}
                >
                  {post.tags.map((tag, idx) => (
                    <Text
                      key={idx}
                      style={{
                        backgroundColor: accentColor,
                        color: primaryColor,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        margin: 2,
                        fontSize: 12,
                      }}
                    >
                      #{tag}
                    </Text>
                  ))}
                </View>
                {post.culturalContext && (
                  <View style={{ marginBottom: 4 }}>
                    <Text style={{ color: "#444" }}>
                      Significance: {post.culturalContext.significance}
                    </Text>
                    <Text style={{ color: "#444" }}>
                      History: {post.culturalContext.historicalContext}
                    </Text>
                    <Text style={{ color: "#444" }}>
                      Preservation: {post.culturalContext.preservation}
                    </Text>
                  </View>
                )}
                {post.aiSummary?.summary && (
                  <Text style={{ color: "#444", marginBottom: 4 }}>
                    {typeof post.aiSummary.summary === "string"
                      ? post.aiSummary.summary
                      : JSON.stringify(post.aiSummary.summary)}
                  </Text>
                )}
                {post.aiSummary?.hashtags && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    {post.aiSummary.hashtags.map((h: string, idx: number) => (
                      <Text
                        key={idx}
                        style={{ color: primaryColor, marginRight: 6 }}
                      >
                        {h}
                      </Text>
                    ))}
                  </View>
                )}
                {post.aiSummary?.themes && (
                  <Text style={{ color: accentColor, marginBottom: 4 }}>
                    Themes: {post.aiSummary.themes.join(", ")}
                  </Text>
                )}
                <Text style={{ color: "#444" }}>
                  Visibility: {post.visibility}
                </Text>
                <Text style={{ color: "#444" }}>
                  Featured: {post.featured ? "Yes" : "No"}
                </Text>
                <Text style={{ color: "#444" }}>
                  Created: {new Date(post.createdAt).toLocaleString()}
                </Text>
                <Text style={{ color: "#444", marginBottom: 4 }}>
                  Updated: {new Date(post.updatedAt).toLocaleString()}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={onClose}
              style={{
                alignSelf: "center",
                backgroundColor: primaryColor,
                borderRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 8,
                marginTop: 8,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const Feed = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recommendationsVisible, setRecommendationsVisible] = useState(false);
  const [similarPosts, setSimilarPosts] = useState<Post[]>([]);
  const bgColor = useThemeColor({}, "background");

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

  useEffect(() => {
    if (!token) return;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://192.168.233.236:10000/api/posts?limit=100&populate=userId`,
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

  const fetchSimilarPosts = async (postId: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://192.168.233.236:10000/api/vector/search/similar/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(
          `Failed to fetch recommendations: ${res.status} ${errorData}`
        );
      }
      const data = await res.json();
      setSimilarPosts(data.similarPosts || data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  const bgColorStr = getColor(bgColor, "#000");

  if (loading)
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: bgColorStr, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={getColor(useThemeColor({}, "primary"), "#B22222")}
        />
      </View>
    );

  if (error)
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgColorStr,
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
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => {
              setSelectedPost(item);
              setModalVisible(true);
            }}
          >
            <PostCard
              item={item}
              onLike={handleLikeUpdate}
              onComment={handleCommentUpdate}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ backgroundColor: bgColorStr, paddingTop: 10 }}
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
                color: getColor(useThemeColor({}, "onSurface"), "#222"),
              }}
            >
              No posts found.
            </Text>
          </View>
        }
      />
      <PostDetailsModal
        post={selectedPost}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onShowRecommendations={() => {
          if (selectedPost) {
            fetchSimilarPosts(selectedPost._id);
            setRecommendationsVisible(true);
          }
        }}
      />
      <RecommendationsModal
        visible={recommendationsVisible}
        onClose={() => setRecommendationsVisible(false)}
        posts={similarPosts}
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
    fontSize: 16,
  },
  location: {
    fontSize: 12,
  },
  ellipsis: {
    marginLeft: "auto",
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
    width: "100%",
    height: "100%",
  },
  pagination: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 5,
    marginRight: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default Feed;
