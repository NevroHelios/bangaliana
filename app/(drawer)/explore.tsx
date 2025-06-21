import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const eventsData = [
  {
    id: '1',
    club: 'Kolkata Festival Committee',
    title: 'Durga Puja 2024',
    image: require('@/assets/images/durgapujo.jpg'),
    location: 'Kolkata, West Bengal',
    vendors: [
      { id: 'v1', name: 'Ferris Wheel', price: 100 },
      { id: 'v2', name: 'Cotton Candy Stall', price: 50 },
    ],
    photos: [
      require('@/assets/images/durgapujo.jpg'),
      require('@/assets/images/kolkata.jpg'),
      require('@/assets/images/heritage2.avif'),
    ],
  },
  {
    id: '2',
    club: 'Vrindavan Cultural Society',
    title: 'Janmashtami Celebrations',
    image: require('@/assets/images/krishna.jpg'),
    location: 'Vrindavan, Uttar Pradesh',
    vendors: [{ id: 'v3', name: 'Flute Shop', price: 200 }],
    photos: [
      require('@/assets/images/krishna.jpg'),
    ],
  },
  {
    id: '3',
    club: 'West Bengal Theatre Association',
    title: 'Annual Theatre Festival',
    image: require('@/assets/images/play.jpg'),
    location: 'Academy of Fine Arts, Kolkata',
    vendors: [],
    photos: [
        require('@/assets/images/play.jpg'),
    ]
  }
];

const EventDetailModal = ({ event, visible, onClose }: { event: any; visible: boolean; onClose: () => void }) => {
    const colorScheme = useColorScheme();

    if (!event) return null;
  
    const renderVendorItem = ({ item }: { item: any }) => (
      <View style={styles.vendorItem}>
        <Text style={[styles.vendorName, { color: Colors[colorScheme ?? 'light'].onSurface }]}>{item.name}</Text>
        <TouchableOpacity style={styles.ticketButton}>
          <Text style={styles.ticketButtonText}>Buy Ticket - ₹{item.price}</Text>
        </TouchableOpacity>
      </View>
    );
  
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <ScrollView>
            <Image source={event.image} style={styles.headerImage} />
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
  
            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].onBackground }]}>{event.title}</Text>
              <Text style={[styles.club, { color: Colors[colorScheme ?? 'light'].onBackground }]}>{event.club}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={16} color={Colors[colorScheme ?? 'light'].onBackground} />
                <Text style={[styles.location, { color: Colors[colorScheme ?? 'light'].onBackground }]}>{event.location}</Text>
              </View>
  
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].onBackground }]}>Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {event.photos.map((photo: any, index: number) => (
                    <Image key={index} source={photo} style={styles.photo} />
                  ))}
                </ScrollView>
              </View>
  
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].onBackground }]}>Available Vendors</Text>
                {event.vendors.length > 0 ? (
                    event.vendors.map((vendor:any) => <View key={vendor.id}>{renderVendorItem({item: vendor})}</View>)
                ) : (
                  <Text style={{ color: Colors[colorScheme ?? 'light'].onBackground }}>No vendors available for this event.</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
};

const EventCard = ({ event, onPress }: { event: any; onPress: () => void }) => {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={event.image} style={styles.cardImage} />
      <BlurView intensity={80} tint={colorScheme} style={styles.cardTextContainer}>
        <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].onSurface }]}>{event.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color={Colors[colorScheme ?? 'light'].onSurface} />
          <Text style={[styles.cardLocation, { color: Colors[colorScheme ?? 'light'].onSurface }]}>{event.location}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

export default function ExploreScreen() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const colorScheme = useColorScheme();

    const handleEventPress = (event: any) => {
        setSelectedEvent(event);
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
    }
  
  
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <FlatList
          data={eventsData}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => handleEventPress(item)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
        {selectedEvent && <EventDetailModal event={selectedEvent} visible={!!selectedEvent} onClose={handleCloseModal} />}
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '27.5%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  card: {
    marginVertical: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: '#000',
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
    padding: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  cardLocation: {
    fontSize: 16,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 20,
  },
  club: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginVertical: 5,
  },
  location: {
    fontSize: 16,
    marginLeft: 5,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  vendorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  vendorName: {
    fontSize: 18,
  },
  ticketButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ticketButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});