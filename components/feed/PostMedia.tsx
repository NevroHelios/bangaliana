// components/feed/PostMedia.tsx
import React, { useState } from "react";
import { View, FlatList, Image, StyleSheet, Dimensions } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

const { width } = Dimensions.get("window");
const CARD_HORIZONTAL_PADDING = 24;
const MEDIA_WIDTH = width - CARD_HORIZONTAL_PADDING * 2;

interface MediaItem {
  _id: string;
  uri: string;
  type: "photo" | "video";
}

interface PostMediaProps {
  mediaItems: MediaItem[];
}

export const PostMedia = ({ mediaItems }: PostMediaProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const accentColor = useThemeColor({}, "primary"); // Marigold
  const mutedColor = useThemeColor({}, "surfaceVariant"); // Terracotta light

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.mediaContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        pagingEnabled
        data={mediaItems}
        renderItem={renderMediaItem}
        keyExtractor={(media) => media._id}
        showsHorizontalScrollIndicator={false}
        style={styles.flatlist}
        snapToInterval={MEDIA_WIDTH}
        decelerationRate="fast"
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / MEDIA_WIDTH);
          setCurrentIndex(index);
        }}
      />
      {mediaItems.length > 1 && (
        <View style={styles.pagination}>
          {mediaItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: currentIndex === index ? accentColor : mutedColor },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
     marginHorizontal: CARD_HORIZONTAL_PADDING,
     borderRadius: 12,
     overflow: 'hidden',
  },
  flatlist: {
    borderRadius: 12,
  },
  mediaContainer: {
    width: MEDIA_WIDTH,
    aspectRatio: 4 / 3, // A more cinematic or journal-like ratio
  },
  image: {
    flex: 1,
  },
  pagination: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});