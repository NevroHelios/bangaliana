// components/feed/PostHeader.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

// A simple utility to format time nicely (e.g., "2h ago", "3d ago")
const timeSince = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

interface PostHeaderProps {
  user: {
    name: string;
    avatar?: string;
  };
  location?: string;
  createdAt: string;
}

export const PostHeader = ({ user, location, createdAt }: PostHeaderProps) => {
  const textColor = useThemeColor({}, "onSurface");
  const mutedColor = useThemeColor({}, "onSurfaceVariant");

  return (
    <View style={styles.headerContainer}>
      <Image
        source={{
          uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=E9C46A&color=264653`,
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textColor }]}>{user.name}</Text>
        <Text style={[styles.metaInfo, { color: mutedColor }]}>
          {location && (
            <>
              <Ionicons name="location-outline" size={12} color={mutedColor} /> {location} · {" "}
            </>
          )}
          {timeSince(new Date(createdAt))}
        </Text>
      </View>
      <TouchableOpacity style={styles.ellipsis}>
        <Ionicons name="ellipsis-horizontal" size={24} color={mutedColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E9C46A', // Marigold accent
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: 'serif', // Suggests a more traditional font
  },
  metaInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  ellipsis: {
    paddingLeft: 10,
  },
});