import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    Text,
    Dimensions
} from 'react-native';
import {
    FlatList,
    GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const HEADER_HEIGHT = 250;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const eventsData = [
  {
    id: '1',
    category: 'Events',
    club: 'Kolkata Festival Committee',
    title: 'Durga Puja 2024',
    image: require('@/assets/images/durgapujo.jpg'),
    location: 'Kolkata, West Bengal',
    vendors: [ { id: 'v1', name: 'Ferris Wheel', price: 100 }, { id: 'v2', name: 'Cotton Candy Stall', price: 50 } ],
    photos: [ require('@/assets/images/durgapujo.jpg'), require('@/assets/images/kolkata.jpg'), require('@/assets/images/heritage2.avif'), ],
  },
  {
    id: '2',
    category: 'Festivals',
    club: 'Vrindavan Cultural Society',
    title: 'Janmashtami',
    image: require('@/assets/images/krishna.jpg'),
    location: 'Vrindavan, Uttar Pradesh',
    vendors: [{ id: 'v3', name: 'Flute Shop', price: 200 }],
    photos: [ require('@/assets/images/krishna.jpg'), ],
  },
  {
    id: '3',
    category: 'Events',
    club: 'West Bengal Theatre Association',
    title: 'Annual Theatre Festival',
    image: require('@/assets/images/play.jpg'),
    location: 'Academy of Fine Arts, Kolkata',
    vendors: [],
    photos: [ require('@/assets/images/play.jpg'), ]
  }
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EventCard = ({ event, onPress, index, viewableItems }: { event: any; onPress: () => void; index: number, viewableItems: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isVisible = viewableItems.value.some((viewable: any) => viewable.index === index && viewable.isViewable);
    return {
        opacity: withTiming(isVisible ? 1 : 0, { duration: 300 }),
        transform: [ { translateY: withTiming(isVisible ? 0 : 50, { duration: 400 }) } ]
    }
  });
  return (
    <AnimatedPressable onPress={onPress} style={[styles.card, animatedStyle]}>
      <Image
        pointerEvents="none"
        source={event.image}
        style={styles.cardImage}
        contentFit="cover"
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardTextContainer}
      >
        <Text style={styles.cardTitle}>{event.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="white" />
          <Text style={styles.cardLocation}>{event.location}</Text>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const EventDetailModal = ({ event, visible, onClose }: { event: any; visible: boolean; onClose: () => void }) => {
    const { top } = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    
    if (!event) return null;
    
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [-HEADER_HEIGHT, 0], [2, 1], Extrapolate.CLAMP);
        return { transform: [{ scale }] };
    });

    const handleImagePress = (imageSource: any) => {
        setSelectedImage(imageSource);
    };

    const handleCloseImagePopup = () => {
        setSelectedImage(null);
    };
    
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{flex: 1, backgroundColor: 'black'}}>
            <Animated.ScrollView onScroll={useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y })} scrollEventThrottle={16}>
                <Animated.View style={[styles.headerImageContainer, headerAnimatedStyle]}>
                    <Pressable onPress={() => handleImagePress(event.image)}>
                        <Image source={event.image} style={styles.headerImage} />
                    </Pressable>
                </Animated.View>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.club}>{event.club}</Text>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-sharp" size={16} color="#333333" />
                        <Text style={styles.location}>{event.location}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {event.photos.map((photo: any, index: number) => ( 
                            <Pressable key={index} onPress={() => handleImagePress(photo)}>
                                <Image source={photo} style={styles.photo} />
                            </Pressable>
                        ))}
                        </ScrollView>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Vendors</Text>
                        {event.vendors.length > 0 ? (
                            event.vendors.map((vendor:any) => 
                            <View key={vendor.id} style={styles.vendorItem}>
                                <Text style={styles.vendorName}>{vendor.name}</Text>
                                <Pressable style={styles.ticketButton}>
                                    <Text style={styles.ticketButtonText}>Buy Ticket - ₹{vendor.price}</Text>
                                </Pressable>
                            </View>)
                        ) : ( <Text style={styles.noVendorsText}>No vendors available for this event.</Text> )}
                    </View>
                </View>
            </Animated.ScrollView>
            <Pressable onPress={onClose} style={[styles.backButton, {top: top + 10}]}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
           
        </View>
      </Modal>
    );
};

const CATEGORIES = ['All', 'Events', 'Festivals', 'Cultural Sites'];

export default function ExploreScreen() {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const viewableItems = useSharedValue([]);
    const navigation = useNavigation();
    const { top } = useSafeAreaInsets();

    useLayoutEffect(() => {
        navigation.setOptions({ header: () => null });
    }, [navigation]);

    const handleEventPress = (event: any) => setSelectedEvent(event);
    const handleCloseModal = () => setSelectedEvent(null);
    const filteredData = activeCategory === 'All' ? eventsData : eventsData.filter(e => e.category === activeCategory);
  
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <View style={styles.container}>
          {/* Background Image */}
          <Image
            source={require('@/assets/images/heritage2.avif')}
            style={styles.backgroundImage}
            contentFit="cover"
          />
          
          {/* Background Overlay */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.64)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.backgroundOverlay}
          />
          
          {/* Main Content */}
          <View style={styles.contentWrapper}>
            <View style={{paddingTop: top}}>
                <ThemedView style={[styles.headerContainer, styles.transparentHeader]}>
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.dispatch({ type: 'TOGGLE_DRAWER' })}>
                            <Ionicons name="menu" size={24} color="white" />
                        </Pressable>
                        <View style={{ width: 24 }} />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                        {CATEGORIES.map(category => (
                            <Pressable key={category} onPress={() => setActiveCategory(category)} style={[
                                styles.categoryChip,
                                styles.glassyChip,
                                { backgroundColor: activeCategory === category ? 'rgba(255, 255, 255, 0.46)' : 'rgba(255,255,255,0.15)', }
                            ]}>
                                <Text style={[
                                    styles.categoryText,
                                    { fontWeight: activeCategory === category ? '600' : '500' }
                                ]}>{category}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </ThemedView>
            </View>
            <AnimatedFlatList
              data={filteredData}
              renderItem={({ item, index }) => ( <EventCard event={item} onPress={() => handleEventPress(item)} index={index} viewableItems={viewableItems} /> )}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={styles.listContainer}
              onViewableItemsChanged={useCallback(({viewableItems: vItems}: {viewableItems: any}) => { viewableItems.value = vItems; }, [])}
              viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
            />
            {selectedEvent && <EventDetailModal key={selectedEvent.id} event={selectedEvent} visible={!!selectedEvent} onClose={handleCloseModal} />}
          </View>
        </View>
      </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: 10,
  },
  headerContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  transparentHeader: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryContainer: {
    paddingHorizontal: 16, 
    paddingTop: 16, 
    paddingBottom: 4
  },
  categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
      marginRight: 8,
  },
  glassyChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  listContainer: {
    paddingTop: 2,
    paddingBottom: 10,
  },
  card: {
    marginVertical: 8,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6},
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  cardImage: {
    width: '100%',
    height: 250,
  },
  cardTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardLocation: {
    fontSize: 14,
    marginLeft: 5,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerImageContainer: {
    height: HEADER_HEIGHT,
    overflow: 'hidden'
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 100,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 100,
    zIndex: 10,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(235, 219, 219, 0.86)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  club: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    color: 'white',
    textShadowColor: 'rgba(235, 219, 219, 0.86)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  location: {
    fontSize: 14,
    marginLeft: 5,
    color: 'white',
    textShadowColor: 'rgba(235, 219, 219, 0.86)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'white',
    textShadowColor: 'rgba(235, 219, 219, 0.86)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  vendorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  vendorName: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(235, 219, 219, 0.86)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ticketButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noVendorsText: {
    color: '#666666',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
});