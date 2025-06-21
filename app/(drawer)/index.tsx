import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const featuredAnim = useRef(new Animated.Value(0)).current;
  const popularAnim = useRef(new Animated.Value(0)).current;
  const featured2Anim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const banner2Anim = useRef(new Animated.Value(0)).current;
  const banner3Anim = useRef(new Animated.Value(0)).current;

  const collageImages = [
    {
      id: 1,
      source: require("@/assets/images/kolkata.jpg"),
      color: "rgba(255, 87, 51, 0.8)",
    },
    {
      id: 2,
      source: require("@/assets/images/durgapujo.jpg"),
      color: "rgba(51, 255, 87, 0.8)",
    },
    {
      id: 3,
      source: require("@/assets/images/play.jpg"),
      color: "rgba(87, 51, 255, 0.8)",
    },
    {
      id: 4,
      source: require("@/assets/images/krishna.jpg"),
      color: "rgba(255, 187, 51, 0.8)",
    },
    {
      id: 5,
      source: require("@/assets/images/heritage2.avif"),
      color: "rgba(255, 51, 187, 0.8)",
    },
    {
      id: 6,
      source: require("@/assets/images/kolkata.jpg"),
      color: "rgba(51, 187, 255, 0.8)",
    },
    {
      id: 7,
      source: require("@/assets/images/kolkata.jpg"),
      color: "rgba(255, 87, 51, 0.8)",
    },
    {
      id: 8,
      source: require("@/assets/images/durgapujo.jpg"),
      color: "rgba(51, 255, 87, 0.8)",
    },
    {
      id: 9,
      source: require("@/assets/images/play.jpg"),
      color: "rgba(87, 51, 255, 0.8)",
    },
    {
      id: 10,
      source: require("@/assets/images/krishna.jpg"),
      color: "rgba(255, 187, 51, 0.8)",
    },
    {
      id: 11,
      source: require("@/assets/images/heritage2.avif"),
      color: "rgba(255, 51, 187, 0.8)",
    },
    {
      id: 12,
      source: require("@/assets/images/kolkata.jpg"),
      color: "rgba(51, 187, 255, 0.8)",
    },
  ];

  const featuredCollections = [
    { id: "1", source: require("@/assets/images/kolkata.jpg"), title: "Kolkata Vibes" },
    { id: "2", source: require("@/assets/images/durgapujo.jpg"), title: "Durga Pujo", },
    { id: "3", source: require("@/assets/images/play.jpg"), title: "Stories", },
    { id: "4", source: require("@/assets/images/krishna.jpg"), title: "Divine Hues", },
    { id: "5", source: require("@/assets/images/heritage2.avif"), title: "Heritage", },
    { id: "6", source: require("@/assets/images/kolkata.jpg"), title: "City Life",  },
  ];

  const slideToNext = () => {
    const nextIndex = currentImageIndex + 1;
    
    if (nextIndex >= collageImages.length) {
  
      Animated.timing(slideAnim, {
        toValue: -nextIndex * width,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
       
        slideAnim.setValue(0);
        setCurrentImageIndex(0);
      });
    } else {
  
      Animated.timing(slideAnim, {
        toValue: -nextIndex * width,
        duration: 600,
        useNativeDriver: true,
      }).start();
      setCurrentImageIndex(nextIndex);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      slideToNext();
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentImageIndex]);


  useEffect(() => {
    const animateSequence = () => {
  
      Animated.sequence([
        Animated.timing(featuredAnim, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(popularAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(featured2Anim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(banner2Anim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(banner3Anim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    setTimeout(animateSequence, 500);
  }, []);

  const createCollageItems = () => {
    const items = [];
    const numItems = 15;

    for (let i = 0; i < numItems; i++) {
      const imageIndex = i % collageImages.length;
      const randomWidth = 80 + Math.random() * 120;
      const randomHeight = 60 + Math.random() * 100;
      const randomX = Math.random() * (width - randomWidth);
      const randomY = Math.random() * (height - randomHeight);
      const randomRotation = (Math.random() - 0.5) * 60;
      const randomOpacity = 0.3 + Math.random() * 0.4;

      items.push({
        id: i,
        source: collageImages[imageIndex].source,
        color: collageImages[imageIndex].color,
        style: {
          position: "absolute",
          left: randomX,
          top: randomY,
          width: randomWidth,
          height: randomHeight,
          transform: [{ rotate: `${randomRotation}deg` }],
          opacity: randomOpacity,
          borderRadius: Math.random() * 20,
          overflow: "hidden",
        },
      });
    }
    return items;
  };

  const collageItems = createCollageItems();

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <Pressable style={[styles.featuredCarouselItem]}>
      <Image
        source={item.source}
        style={styles.featuredCarouselImage}
        contentFit="cover"
      />
      <View style={styles.featuredCarouselOverlay}>
        <Text style={styles.featuredCarouselTitle}>{item.title}</Text>
      </View>
    </Pressable>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "black", dark: "black" }}
      headerImage={
        <View style={styles.headerContainer}>
    
          <View style={styles.carouselContainer}>
            <Animated.View
              style={[
                styles.carouselSlider,
                {
                  transform: [{ translateX: slideAnim }],
                  width: width * (collageImages.length + 1), 
                }
              ]}
            >
              {collageImages.map((image, index) => (
                <View key={image.id} style={styles.slideContainer}>
                  <Image
                    source={image.source}
                    style={styles.mainImage}
                    contentFit="cover"
                  />
                  <View
                    style={[
                      styles.slideOverlay,
                      { backgroundColor: image.color }
                    ]}
                  />
                </View>
              ))}
     
              <View key="duplicate-first" style={styles.slideContainer}>
                <Image
                  source={collageImages[0].source}
                  style={styles.mainImage}
                  contentFit="cover"
                />
                <View
                  style={[
                    styles.slideOverlay,
                    { backgroundColor: collageImages[0].color }
                  ]}
                />
              </View>
            </Animated.View>
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.gradientOverlay}
          />

          <View style={styles.overlayContent}>
            <Text style={styles.mainTitle}>বাংলার ঐতিহ্য</Text>
          </View>
       
        </View>
      }
    >
      <ScrollView style={styles.contentContainer}>
    
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: featuredAnim,
              transform: [
                {
                  translateY: featuredAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Text style={styles.enhancedSectionTitle}>Featured Collections</Text>
          <FlatList
            data={featuredCollections}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.featuredCarouselContainer}
            renderItem={renderFeaturedItem}
            scrollEnabled={true}
            pagingEnabled={false}
            decelerationRate="normal"
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.sectionContainerL,
            {
              opacity: popularAnim,
              transform: [
                {
                  translateY: popularAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Text style={styles.enhancedSectionTitle}>Popular Collections</Text>
   
          <View style={styles.instagramGrid}>
            <View style={styles.leftGrid}>
              {collageImages.slice(0, 4).map((item, index) => (
                <View key={`left-${item.id}`} style={styles.smallGridItem}>
                  <Image
                    source={item.source}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
            {collageImages.length > 4 && (
              <View style={styles.largeGridItem}>
                <Image
                  source={collageImages[4].source}
                  style={styles.gridImage}
                  contentFit="cover"
                />
              </View>
            )}
          </View>

          <View style={styles.reverseInstagramGrid}>
            <View style={styles.rightGrid}>
              {collageImages.slice(6, 10).map((item) => (
                <View key={`heritage-${item.id}`} style={styles.smallGridItem}>
                  <Image
                    source={item.source}
                    style={styles.gridImage}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
            {collageImages.length > 10 && (
              <View style={styles.reverseLargeGridItem}>
                <Image
                  source={collageImages[10].source}
                  style={styles.gridImage}
                  contentFit="cover"
                />
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.bannerSectionContainer,
            {
              opacity: bannerAnim,
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Pressable style={styles.bannerContainer}>
            <Image source={require("@/assets/images/heritage2.avif")} style={styles.bannerImage}/>
            <View style={styles.bannerOverlay}/>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Explore the Unseen</Text>
              <Text style={styles.bannerSubtitle}>Journey through hidden gems of Bengal's heritage.</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View 
          style={[
            styles.bannerSectionContainer,
            {
              opacity: banner2Anim,
              transform: [
                {
                  translateY: banner2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Pressable style={styles.bannerContainer}>
            <Image source={require("@/assets/images/durgapujo.jpg")} style={styles.bannerImage}/>
            <View style={styles.bannerOverlay}/>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Cultural Treasures</Text>
              <Text style={styles.bannerSubtitle}>Immerse yourself in the rich tapestry of Bengali traditions.</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View 
          style={[
            styles.bannerSectionContainer,
            {
              opacity: banner3Anim,
              transform: [
                {
                  translateY: banner3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Pressable style={styles.bannerContainer}>
            <Image source={require("@/assets/images/krishna.jpg")} style={styles.bannerImage}/>
            <View style={styles.bannerOverlay}/>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Timeless Stories</Text>
              <Text style={styles.bannerSubtitle}>Discover the legends and tales that shaped our culture.</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: featured2Anim,
              transform: [
                {
                  translateY: featured2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }
          ]}
        >
          <Text style={styles.enhancedSectionTitle}>Trending Collections</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {collageImages.slice().reverse().map((item, index) => (
              <View
                key={`trending-${item.id}`}
                style={[styles.featureBox, { backgroundColor: item.color }]}
              >
                <Image
                  source={item.source}
                  style={styles.featureImage}
                  contentFit="cover"
                />
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    height: height * 0.5,
    position: "relative",
    overflow: "hidden",
  },
  carouselContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  carouselSlider: {
    flexDirection: "row",
    height: "100%",
  },
  slideContainer: {
    width: width,
    height: "100%",
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  slideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  overlayContent: {
    position: "absolute",
    top: "50%",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 3,
  },
  mainTitle: {
    fontSize: 50,
    fontWeight: "bold",
    color: "gray",
    textAlign: "center",
    margin: 0,
    textShadowColor: "#f0d7d7",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionContainerL: {
    marginVertical: 20,
    marginBottom: 20,
  },
  bannerSectionContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginVertical: 20,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  enhancedSectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    margin: 0,
    marginVertical: 20,
    textShadowColor: "#f0d7d7",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  featureBox: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  featuredCarouselContainer: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  featuredCarouselItem: {
    width: width * 0.4,
    height: width * 0.5,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
  },
  featuredCarouselImage: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  featuredCarouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  featuredCarouselTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  bannerContainer: {
    height: 150,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  bannerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  bannerTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    padding: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instagramGrid: {
    flexDirection: "row",
    marginHorizontal: 15,
    height: 250,
  },
  reverseInstagramGrid: {
    flexDirection: 'row-reverse',
    marginHorizontal: 15,
    height: 250,
    marginTop: 8,
  },
  leftGrid: {
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    height: "100%",
  },
  rightGrid: {
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    height: "100%",
  },
  smallGridItem: {
    width: "50%",
    height: "50%",
    padding: 4, 
    position: "relative",
  },
  largeGridItem: {
    flex: 1,
    paddingLeft: 4, 
    height: "100%",
    position: "relative",
  },
  reverseLargeGridItem: {
    flex: 1,
    paddingRight: 4,
    height: "100%",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});