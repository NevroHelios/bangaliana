import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

interface MediaItem {
  _id: string;
  uri: string;
  type: "photo" | "video";
  title?: string;
  description?: string;
  location?: { name?: string; latitude?: number; longitude?: number };
}

interface Comment {
  _id: string;
  userName: string;
  text: string;
  timestamp: string | number;
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
}

const Photos = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.id) return;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://192.168.233.236:10000/api/posts?userId=${user?.id}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts || data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [token, user]);

  if (loading)
    return (
      <ActivityIndicator
        style={{ marginTop: 40 }}
        size="large"
        color="#8B5CF6"
      />
    );
  if (error) return <Text style={{ color: "red", margin: 20 }}>{error}</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title || "Untitled Post"}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            {item.mediaItems && item.mediaItems.length > 0 && (
              <ScrollView horizontal style={{ marginVertical: 8 }}>
                {item.mediaItems.map((media) => (
                  <Image
                    key={media._id}
                    source={{ uri: media.uri }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>
            )}
            {item.location && (
              <Text style={styles.loc}>
                Location: {item.location.name || ""} [
                {item.location.coordinates?.join(", ")}]
              </Text>
            )}
            {item.tags && item.tags.length > 0 && (
              <Text style={styles.tags}>Tags: {item.tags.join(", ")}</Text>
            )}
            <Text>Visibility: {item.visibility}</Text>
            <Text>Featured: {item.featured ? "Yes" : "No"}</Text>
            <Text>Likes: {item.likes?.length || 0}</Text>
            <Text>Comments: {item.comments?.length || 0}</Text>
            {item.aiSummary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Summary:</Text>
                <Text>{item.aiSummary.summary}</Text>
              </View>
            )}
            {item.culturalContext && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cultural Context:</Text>
                <Text>{JSON.stringify(item.culturalContext)}</Text>
              </View>
            )}
            {item.creativeContext && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Creative Context:</Text>
                <Text>{JSON.stringify(item.creativeContext)}</Text>
              </View>
            )}
            {item.travelContext && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Travel Context:</Text>
                <Text>{JSON.stringify(item.travelContext)}</Text>
              </View>
            )}
            {item.comments && item.comments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comments:</Text>
                {item.comments.map((c) => (
                  <Text key={c._id} style={styles.comment}>
                    {c.userName}: {c.text}
                  </Text>
                ))}
              </View>
            )}
            <Text style={styles.date}>
              Posted: {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", margin: 40 }}>
            No posts found.
          </Text>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  desc: {
    fontSize: 15,
    marginBottom: 4,
  },
  loc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  tags: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  section: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  comment: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
});

export default Photos;
