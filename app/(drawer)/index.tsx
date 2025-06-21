import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const colorScheme = useColorScheme();

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

  const CollageBackground = () => (
    <View style={styles.collageContainer}>
      {collageItems.map((item) => (
        <View key={item.id} style={{ backgroundColor: item.color }}>
          <Image
            source={item.source}
            style={styles.collageImage}
            contentFit="cover"
          />
          <View
            style={[styles.colorOverlay, { backgroundColor: item.color }]}
          />
        </View>
      ))}
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "black", dark: "black" }}
      headerImage={
        <View style={styles.headerContainer}>
          <Image
            source={require("@/assets/images/kolkata.jpg")}
            style={styles.mainImage}
            contentFit="cover"
          />

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
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Collections</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {collageImages.map((item, index) => (
              <View
                key={item.id}
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
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular Collections</Text>
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
        </View>
        <View style={styles.sectionContainerL}>
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
        </View>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    height: height * 0.5,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 3,
    zIndex: 0,
  },
  collageContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.4,
    zIndex: 1,
  },
  collageImage: {
    width: "100%",
    height: "100%",
  },
  colorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
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
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginVertical: 0,
  },
  sectionContainerL: {
    marginVertical: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginVertical: 20,
    textAlign: "center",
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  featureBox: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
    overflow: "hidden",
    position: "relative",
  },
  featureImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  featureOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
  },
  featureText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  instagramGrid: {
    flexDirection: "row",
    marginHorizontal: 15,
    height: 250, 
  },
  leftGrid: {
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    height: "100%",
  },
  smallGridItem: {
    width: "50%",
    height: "50%",
    padding: 1,
    position: "relative",
  },
  largeGridItem: {
    flex: 1,
    paddingLeft: 1,
    height: "100%",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 1,
    left: 1,
    right: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  gridText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});