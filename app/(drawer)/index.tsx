import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const HERO_SLIDE_WIDTH = width - 32;

const sections = [
  {
    type: "hero",
    key: "hero",
    data: [
      {
        id: "h1",
        title: "বাংলার ঐতিহ্য",
        subtitle: "Discover the Soul of Bengal",
        image: require("@/assets/images/bg.jpg"),
      },
      {
        id: "h2",
        title: "দূর্গাপূজা",
        subtitle: "Vibrant festivities and culture",
        image: require("@/assets/images/durgapujo.jpg"),
      },
      {
        id: "h3",
        title: "ঐতিহ্য",
        subtitle: "Explore the rich heritage",
        image: require("@/assets/images/heritage2.avif"),
      },
      {
        id: "h4",
        title: "কলকাতা",
        subtitle: "The City of Joy",
        image: require("@/assets/images/kolkata.jpg"),
      },
    ],
  },
  {
    type: "carousel",
    key: "featured",
    title: "Featured Collections",
    data: [
      { id: "1", source: require("@/assets/images/kolkata.jpg"), title: "Kolkata Vibes" },
      { id: "2", source: require("@/assets/images/durgapujo.jpg"), title: "Durga Pujo" },
      { id: "3", source: require("@/assets/images/play.jpg"), title: "Stories in Motion" },
      { id: "4", source: require("@/assets/images/krishna.jpg"), title: "Divine Hues" },
    ],
  },
  {
    type: "grid",
    key: "popular",
    title: "Popular Photos",
    data: [
      { id: "p1", source: require("@/assets/images/heritage2.avif") },
      { id: "p2", source: require("@/assets/images/kolkata.jpg") },
      { id: "p3", source: require("@/assets/images/durgapujo.jpg") },
      { id: "p4", source: require("@/assets/images/play.jpg") },
      { id: "p5", source: require("@/assets/images/krishna.jpg") },
      { id: "p6", source: require("@/assets/images/bg.jpg") },
      { id: "p7", source: require("@/assets/images/durgapujo.jpg") },
      { id: "p8", source: require("@/assets/images/play.jpg") },
      { id: "p9", source: require("@/assets/images/kolkata.jpg") },
    ],
  },
   {
    type: "banner",
    key: "banner_1",
    title: "Explore the Unseen",
    subtitle: "Journey through hidden gems of Bengal's heritage.",
    image: require("@/assets/images/heritage2.avif"),
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GridItem = ({ item, style }: { item: any, style: any }) => {
    const surfaceColor = useThemeColor({}, 'surface');
    return (
        <AnimatedPressable style={[style, { backgroundColor: surfaceColor as string, borderRadius: 16, overflow: 'hidden' }]}>
            <Image source={item.source} style={styles.gridImage} />
        </AnimatedPressable>
    )
}

const ListItem = ({ item, index, viewableItems }: { item: any, index: any, viewableItems: any }) => {
  const router = useRouter();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'onSurface');
  
  const [heroIndex, setHeroIndex] = useState(0);
  const heroFlatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (item.type !== "hero") return;

    const interval = setInterval(() => {
        setHeroIndex(prevIndex => {
            const nextIndex = prevIndex === item.data.length - 1 ? 0 : prevIndex + 1;
            heroFlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            return nextIndex;
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [item.type, item.data]);


  const animatedStyle = useAnimatedStyle(() => {
    const isVisible = viewableItems.value.some(
      (viewable: any) => viewable.item.key === item.key && viewable.isViewable
    );
    return {
      opacity: withTiming(isVisible ? 1 : 0, { duration: 500 }),
      transform: [
        {
          translateY: withTiming(isVisible ? 0 : 50, { duration: 600 }),
        },
      ],
    };
  });

  const onHeroScroll = (event: any) => {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / HERO_SLIDE_WIDTH);
      setHeroIndex(newIndex);
  }

  const renderContent = () => {
    switch (item.type) {
      case "hero":
        return (
            <View style={styles.heroSectionContainer}>
                <FlatList
                    ref={heroFlatListRef}
                    data={item.data}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(i) => i.id}
                    onMomentumScrollEnd={onHeroScroll}
                    renderItem={({ item: heroItem }) => (
                        <View style={styles.heroContainer}>
                            <Image source={heroItem.image} style={styles.heroImage} />
                            <View style={styles.heroOverlay} />
                            <ThemedText style={styles.heroTitle}>{heroItem.title}</ThemedText>
                            <ThemedText style={styles.heroSubtitle}>{heroItem.subtitle}</ThemedText>
                        </View>
                    )}
                />
                 <View style={styles.paginationContainer}>
                    {item.data.map((_: any, index: number) => (
                        <View 
                            key={index} 
                            style={[
                                styles.paginationDot,
                                { backgroundColor: heroIndex === index ? 'white' : 'rgba(255,255,255,0.5)' }
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
      case "carousel":
        return (
          <ThemedView>
            <ThemedText style={styles.sectionTitle}>{item.title}</ThemedText>
            <FlatList
              data={item.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(i) => i.id}
              contentContainerStyle={styles.carouselContainer}
              renderItem={({ item: carouselItem, index: carouselIndex }) => (
                <AnimatedPressable style={[styles.carouselItem, { backgroundColor: surfaceColor as string }]}>
                  <Image source={carouselItem.source} style={styles.carouselImage} />
                  <ThemedText style={styles.carouselItemTitle}>{carouselItem.title}</ThemedText>
                </AnimatedPressable>
              )}
            />
          </ThemedView>
        );
      case "grid":
        const gridLayout = (data: any[], pattern = ['LSS', 'SSS', 'SSL']) => {
            const rows: React.ReactNode[] = [];
            let dataIndex = 0;
            let patternIndex = 0;

            while (dataIndex < data.length) {
                const currentPattern = pattern[patternIndex % pattern.length];
                
                if (currentPattern === 'LSS' && data[dataIndex + 2]) {
                    rows.push(
                        <View style={styles.gridRow} key={`row-${dataIndex}`}>
                            <GridItem item={data[dataIndex]} style={styles.gridItemLarge} />
                            <View style={{ flex: 1, marginLeft: 8, justifyContent: 'space-between' }}>
                                <GridItem item={data[dataIndex + 1]} style={{height: '48.5%'}} />
                                <GridItem item={data[dataIndex + 2]} style={{height: '48.5%'}} />
                            </View>
                        </View>
                    );
                    dataIndex += 3;
                } else if (currentPattern === 'SSS' && data[dataIndex + 2]) {
                    rows.push(
                        <View style={styles.gridRow} key={`row-${dataIndex}`}>
                            <GridItem item={data[dataIndex]} style={{flex: 1}} />
                            <GridItem item={data[dataIndex + 1]} style={{flex: 1, marginHorizontal: 8}} />
                            <GridItem item={data[dataIndex + 2]} style={{flex: 1}} />
                        </View>
                    );
                    dataIndex += 3;
                } else if (currentPattern === 'SSL' && data[dataIndex + 2]) {
                     rows.push(
                        <View style={styles.gridRow} key={`row-${dataIndex}`}>
                             <View style={{ flex: 1, marginRight: 8, justifyContent: 'space-between' }}>
                                <GridItem item={data[dataIndex]} style={{height: '48.5%'}} />
                                <GridItem item={data[dataIndex + 1]} style={{height: '48.5%'}} />
                            </View>
                            <GridItem item={data[dataIndex + 2]} style={styles.gridItemLarge} />
                        </View>
                    );
                    dataIndex += 3;
                } else {
                    break;
                }
                patternIndex++;
            }
            return rows;
        }

        return (
          <ThemedView>
            <ThemedText style={styles.sectionTitle}>{item.title}</ThemedText>
            <View style={styles.gridContainer}>
              {gridLayout(item.data)}
            </View>
          </ThemedView>
        );
      case "banner":
        return (
            <AnimatedPressable style={[styles.bannerContainer, { backgroundColor: surfaceColor as string }]}>
                <Image source={item.image} style={styles.bannerImage}/>
                <View style={styles.bannerOverlay}/>
                <View style={styles.bannerTextContainer}>
                    <ThemedText style={styles.bannerTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.bannerSubtitle}>{item.subtitle}</ThemedText>
                </View>
            </AnimatedPressable>
        );
      default:
        return null;
    }
  };

  return <Animated.View style={animatedStyle}>{renderContent()}</Animated.View>;
};

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const viewableItems = useSharedValue([]);
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();

  const onViewableItemsChanged = useCallback(({ viewableItems: vItems }: { viewableItems: any}) => {
    viewableItems.value = vItems;
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 20,
  };

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor as string }}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={({ item, index }) => (
          <ListItem item={item} index={index} viewableItems={viewableItems} />
        )}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: bottom + 40 }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroSectionContainer: {
    marginBottom: 30,
  },
  heroContainer: {
    width: HERO_SLIDE_WIDTH,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden'
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%'
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    textAlign: "center",
  },
  paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      position: 'absolute',
      bottom: 20,
      width: '100%'
  },
  paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    marginLeft: 16,
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 30
  },
  carouselItem: {
    width: width * 0.4,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  carouselImage: {
    width: "100%",
    height: width * 0.5,
  },
  carouselItemTitle: {
    padding: 12,
    fontWeight: "600",
  },
  gridContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  gridRow: {
      flexDirection: 'row',
      height: (width - 32) * 0.6,
      marginBottom: 8,
  },
  gridItemLarge: {
      flex: 2,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  bannerContainer: {
      height: 150,
      marginHorizontal: 16,
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'center',
      marginBottom: 30,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
  },
  bannerImage: {
      ...StyleSheet.absoluteFillObject,
  },
  bannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)'
  },
  bannerTextContainer: {
      padding: 16
  },
  bannerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
  },
  bannerSubtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      marginTop: 4
  }
});