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
    View
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
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
  const surfaceColor = useThemeColor({}, 'surface');
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
        <ThemedText style={styles.cardTitle}>{event.title}</ThemedText>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="white" />
          <ThemedText style={styles.cardLocation}>{event.location}</ThemedText>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const EventDetailModal = ({ event, visible, onClose }: { event: any; visible: boolean; onClose: () => void }) => {
    const { top } = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const backgroundColor = useThemeColor({}, 'background');
    const onBackgroundColor = useThemeColor({}, 'onSurface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const primaryColor = useThemeColor({}, 'primary');
    if (!event) return null;
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [-HEADER_HEIGHT, 0], [2, 1], Extrapolate.CLAMP);
        return { transform: [{ scale }] };
    });
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{flex: 1, backgroundColor: backgroundColor as string}}>
            <Animated.ScrollView onScroll={useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y })} scrollEventThrottle={16}>
                <Animated.View style={[styles.headerImageContainer, headerAnimatedStyle]}>
                    <Image source={event.image} style={styles.headerImage} />
                </Animated.View>
                <View style={styles.contentContainer}>
                    <ThemedText style={styles.title}>{event.title}</ThemedText>
                    <ThemedText style={[styles.club, {color: onSurfaceVariantColor as string}]}>{event.club}</ThemedText>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-sharp" size={16} color={onBackgroundColor as string} />
                        <ThemedText style={styles.location}>{event.location}</ThemedText>
                    </View>
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Photos</ThemedText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {event.photos.map((photo: any, index: number) => ( <Image key={index} source={photo} style={styles.photo} /> ))}
                        </ScrollView>
                    </View>
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Available Vendors</ThemedText>
                        {event.vendors.length > 0 ? (
                            event.vendors.map((vendor:any) => 
                            <View key={vendor.id} style={styles.vendorItem}>
                                <ThemedText style={styles.vendorName}>{vendor.name}</ThemedText>
                                <Pressable style={[styles.ticketButton, {backgroundColor: primaryColor as string}]}>
                                    <ThemedText style={{color: useThemeColor({}, 'onPrimary') as string}}>Buy Ticket - ₹{vendor.price}</ThemedText>
                                </Pressable>
                            </View>)
                        ) : ( <ThemedText>No vendors available for this event.</ThemedText> )}
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
    const backgroundColor = useThemeColor({}, 'background');
    const onSurfaceColor = useThemeColor({}, 'onSurface');
    const surfaceColor = useThemeColor({}, 'surfaceVariant');
    const primaryColor = useThemeColor({}, 'primary');
    const onPrimaryColor = useThemeColor({}, 'onPrimary');

    useLayoutEffect(() => {
        navigation.setOptions({ header: () => null });
    }, [navigation]);

    const handleEventPress = (event: any) => setSelectedEvent(event);
    const handleCloseModal = () => setSelectedEvent(null);
    const filteredData = activeCategory === 'All' ? eventsData : eventsData.filter(e => e.category === activeCategory);
  
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: backgroundColor as string}}>
          <View style={{paddingTop: top}}>
              <ThemedView style={styles.headerContainer}>
                  <View style={styles.header}>
                      <Pressable onPress={() => navigation.dispatch({ type: 'TOGGLE_DRAWER' })}>
                          <Ionicons name="menu" size={24} color={onSurfaceColor as string} />
                      </Pressable>
                      <ThemedText style={styles.headerTitle}>Explore</ThemedText>
                      <View style={{ width: 24 }} />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                      {CATEGORIES.map(category => (
                          <Pressable key={category} onPress={() => setActiveCategory(category)} style={[
                              styles.categoryChip,
                              { backgroundColor: activeCategory === category ? primaryColor as string : surfaceColor as string, }
                          ]}>
                              <ThemedText style={{color: activeCategory === category ? onPrimaryColor as string : onSurfaceColor as string}}>{category}</ThemedText>
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
      </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent', // Use theme color or make it transparent
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
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
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  card: {
    marginVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4},
    overflow: 'hidden',
    position: 'relative'
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
    fontWeight: '500'
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
  contentContainer: {
    padding: 16,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold'
  },
  club: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4
  },
  location: {
    fontSize: 14,
    marginLeft: 5,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  },
  ticketButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
});