import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

type MediaItem = {
  id: number;
  type: "image" | "video" | "livePhoto" | "pairedVideo" | undefined;
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  fileSize?: number;
};

interface LocationData {
  name: string;
  latitude?: number;
  longitude?: number;
}

interface PostData {
  userId: string;
  mediaItems: MediaItem[];
  title: string;
  description: string;
  location: LocationData | null;
  visibility: 'public' | 'private' | 'friends';
  featured: boolean;
  comments: any[];
  aiSummary: any;
  culturalContext: any;
  creativeContext: any;
  travelContext: any;
}

interface PaymentScreenProps {
  onBuy: () => void;
  onCancel: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ onBuy, onCancel }) => {
  return (
    <View style={paymentStyles.container}>
      <View style={paymentStyles.header}>
        <Text style={paymentStyles.title}>Unlock Featured Post</Text>
        <Text style={paymentStyles.description}>
          Make your post shine! Feature it to reach a wider audience and stand out in the feed.
        </Text>
      </View>

      <View style={paymentStyles.planCard}>
        <Ionicons name="star" size={40} color="#F59E0B" style={paymentStyles.starIcon} />
        <Text style={paymentStyles.planName}>Featured Post Boost</Text>
        <Text style={paymentStyles.planPrice}>$4.99</Text>
        <Text style={paymentStyles.planDuration}>One-time payment per post</Text>
        <View style={paymentStyles.featuresList}>
          <View style={paymentStyles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={paymentStyles.featureText}>Increased Visibility</Text>
          </View>
          <View style={paymentStyles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={paymentStyles.featureText}>Appears in Featured Section</Text>
          </View>
          <View style={paymentStyles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={paymentStyles.featureText}>Higher Engagement Potential</Text>
          </View>
        </View>
      </View>

      <View style={paymentStyles.buttonContainer}>
        <TouchableOpacity style={paymentStyles.buyButton} onPress={onBuy}>
          <Text style={paymentStyles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={paymentStyles.cancelButton} onPress={onCancel}>
          <Text style={paymentStyles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MediaPostCreator = () => {
  const [currentStep, setCurrentStep] = useState('media');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [postData, setPostData] = useState<PostData>({
    userId: 'user123',
    mediaItems: [],
    title: '',
    description: '',
    location: null,
    visibility: 'public',
    featured: false,
    comments: [],
    aiSummary: null,
    culturalContext: null,
    creativeContext: null,
    travelContext: null
  });

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationVisibility, setLocationVisibility] = useState(true);

  const localBackgroundImage = require('@/assets/images/krishna.jpg');

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    setIsFetchingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied. Please enable it in settings to auto-fill location.');
      setIsFetchingLocation(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const locationName = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        setPostData(prev => ({
          ...prev,
          location: {
            name: locationName,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        }));
      } else {
        setPostData(prev => ({
          ...prev,
          location: {
            name: `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Location Error', 'Could not fetch your current location.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to select media');
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (selectedMedia.length >= 20) {
      Alert.alert('Limit reached', 'You can only select up to 20 media items');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset, index) => ({
        id: Date.now() + index + Math.random(),
        type: asset.type,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      }));

      setSelectedMedia(prev => {
        const combined = [...prev, ...newMedia];
        return combined.slice(0, 20);
      });
    }
  };

  const removeMedia = (mediaId: number) => {
    setSelectedMedia((prev: MediaItem[]) => prev.filter(item => item.id !== mediaId));
    setCurrentMediaIndex((prevIndex) => {
      const newLength = selectedMedia.length - 1;
      if (newLength === 0) return 0;
      if (prevIndex >= newLength) {
        return Math.max(0, newLength - 1);
      }
      return prevIndex;
    });
  };

  // --- REWRITE: handlePost using FormData with detailed debug logs and robust error detection ---
  const handlePost = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert('No Media', 'Please select at least one image or video to post.');
      return;
    }

    const finalLocation = postData.location;
    const formData = new FormData();

    try {
      console.log('[DEBUG] Preparing to append media files:', selectedMedia);
      // Append media files
      selectedMedia.forEach((media, idx) => {
        let mimeType = 'image/jpeg';
        if (media.type === 'video') mimeType = 'video/mp4';
        else if (media.type === 'image') mimeType = 'image/jpeg';

        if (!media.uri || typeof media.uri !== 'string') {
          throw new Error(`[Media Error] Invalid URI for media at index ${idx}`);
        }
        if (!media.type) {
          throw new Error(`[Media Error] Missing type for media at index ${idx}`);
        }
        if (!media.fileName) {
          console.warn(`[Media Warning] Missing fileName for media at index ${idx}, using fallback.`);
        }

        formData.append('media', {
          uri: media.uri,
          name: media.fileName || `media_${idx}.${media.type === 'video' ? 'mp4' : 'jpg'}`,
          type: mimeType,
        } as any);
      });

      // Append other fields
      formData.append('userId', postData.userId);
      formData.append('title', postData.title || '');
      formData.append('description', postData.description || '');
      formData.append('visibility', postData.visibility);
      formData.append('featured', postData.featured ? 'true' : 'false');

      if (finalLocation) {
        formData.append('locationName', finalLocation.name);
        if (finalLocation.latitude) formData.append('latitude', String(finalLocation.latitude));
        if (finalLocation.longitude) formData.append('longitude', String(finalLocation.longitude));
      }

      // Debug: log all FormData keys
      // Note: FormData does not have getParts; use entries() for debugging
      // @ts-ignore
      if (typeof formData.entries === 'function') {
        // @ts-ignore
        for (let pair of formData.entries()) {
          console.log(`[DEBUG] FormData field: ${pair[0]} =`, pair[1]);
        }
      }

      const apiUrl = 'http://192.168.47.91:10000/api/posts/createpost';
      console.log('[DEBUG] Sending POST request to', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Cookie': process.env.COOKIES!,
          // 'Content-Type': 'multipart/form-data', // Let fetch set this automatically
        },
        body: formData as any,
      });

      console.log('[DEBUG] Response status:', response.status);
      let responseData: any = null;
      let responseText: string = '';
      try {
        responseText = await response.text();
        try {
          responseData = JSON.parse(responseText);
        } catch (jsonErr) {
          responseData = responseText;
        }
      } catch (err) {
        console.error('[DEBUG] Error reading response text:', err);
      }

      if (!response.ok) {
        console.error('[DEBUG] Error response:', responseData);
        let errorMsg = 'Failed to share post';
        if (responseData && typeof responseData === 'object' && responseData.message) {
          errorMsg = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMsg = responseData;
        }
        throw new Error(errorMsg);
      }

      console.log('[DEBUG] Post successful:', responseData);
      Alert.alert('Success', 'Post created successfully!');

      setSelectedMedia([]);
      setCurrentStep('media');
      setCurrentMediaIndex(0);
      setPostData({
        userId: 'user123',
        mediaItems: [],
        title: '',
        description: '',
        location: null,
        visibility: 'public',
        featured: false,
        comments: [],
        aiSummary: null,
        culturalContext: null,
        creativeContext: null,
        travelContext: null
      });

      fetchUserLocation();
    } catch (error: any) {
      console.error('[DEBUG] Error in handlePost:', error, error?.stack);
      let errorMsg = 'Unknown error';
      if (error && error.message) errorMsg = error.message;
      Alert.alert('Error', `Failed to share post: ${errorMsg}`);
    }
  };
  // --- END REWRITE ---

  const handleFeaturedPress = () => {
    setPostData(prev => ({ ...prev, featured: !prev.featured }));
  };

  const handlePaymentBuy = () => {
    Alert.alert('Purchase Successful!', 'Your post will now be featured.');
    setShowPaymentModal(false);
    setCurrentStep('preview');
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPostData(prev => ({ ...prev, featured: false }));
    setCurrentStep('details');
  };

  const handlePreviewPress = () => {
    if (postData.featured) {
      setShowPaymentModal(true);
    } else {
      setShowPaymentModal(false);
      setCurrentStep('preview');
    }
  };

  const renderMediaThumbnail = ({ item, index }: { item: MediaItem, index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        index === currentMediaIndex && styles.activeThumbnail
      ]}
      onPress={() => setCurrentMediaIndex(index)}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
      {item.type === 'video' && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play" size={12} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMediaSelection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Media</Text>
        <Text style={styles.counter}>{selectedMedia.length}/20 selected</Text>
      </View>

      {selectedMedia.length > 0 ? (
        <View style={styles.mediaPreviewContainer}>
          <View style={styles.mainMediaContainer}>
            {selectedMedia[currentMediaIndex]?.type === 'video' ? (
              <Video
                source={{ uri: selectedMedia[currentMediaIndex]?.uri }}
                style={styles.mainMedia}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
              />
            ) : (
              <Image
                source={{ uri: selectedMedia[currentMediaIndex]?.uri }}
                style={styles.mainMedia}
                resizeMode="cover"
              />
            )}

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedia(selectedMedia[currentMediaIndex]?.id)}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>

            {selectedMedia.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                  disabled={currentMediaIndex === 0}
                >
                  <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => setCurrentMediaIndex(Math.min(selectedMedia.length - 1, currentMediaIndex + 1))}
                  disabled={currentMediaIndex === selectedMedia.length - 1}
                >
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
              </>
            )}
          </View>

          {selectedMedia.length > 1 && (
            <FlatList
              data={selectedMedia}
              renderItem={renderMediaThumbnail}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailList}
              contentContainerStyle={styles.thumbnailContainer}
            />
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="image-outline" size={60} color="#9CA3AF" />
          <Text style={styles.emptyText}>No media selected</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.selectButton, selectedMedia.length >= 20 && styles.disabledButton]}
          onPress={pickMedia}
          disabled={selectedMedia.length >= 20}
        >
          <Ionicons name="images" size={20} color="white" />
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>

        {selectedMedia.length > 0 && (
          <TouchableOpacity
            style={styles.nextStepButton}
            onPress={() => setCurrentStep('details')}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  const renderDetailsForm = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('media')}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Post Details</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={postData.title}
            onChangeText={(text) => setPostData({ ...postData, title: text })}
            placeholder="Add a title..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={postData.description}
            onChangeText={(text) => setPostData({ ...postData, description: text })}
            placeholder="Write a caption..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationContainer}>
            {isFetchingLocation ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : postData.location ? (
              <Text style={styles.locationTextDisplay}>{postData.location.name}</Text>
            ) : (
              <Text style={styles.locationTextDisplay}>Location not available</Text>
            )}
            <TouchableOpacity onPress={fetchUserLocation} disabled={isFetchingLocation}>
              <Ionicons name="refresh-circle" size={24} color={isFetchingLocation ? '#9CA3AF' : '#3B82F6'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.visibilityContainer}>
            {([
              { value: 'public', icon: 'globe-outline', label: 'Public - Anyone can see this post' },
              { value: 'private', icon: 'lock-closed-outline', label: 'Private - Only you can see this post' },
              { value: 'friends', icon: 'people-outline', label: 'Friends - Only your friends can see this post' }
            ] as const).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.visibilityOption}
                onPress={() => setPostData({ ...postData, visibility: option.value })}
              >
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radioButton,
                    postData.visibility === option.value && styles.radioButtonSelected
                  ]}>
                    {postData.visibility === option.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Ionicons name={option.icon} size={20} color="white" />
                  <Text style={styles.visibilityLabel}>{option.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleFeaturedPress} 
        >
          <View style={[styles.checkbox, postData.featured && styles.checkboxSelected]}>
            {postData.featured && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Ionicons name="star-outline" size={20} color="#F59E0B" />
          <Text style={styles.checkboxLabel}>Featured Post</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextStepButton}
        onPress={handlePreviewPress}
      >
        <Text style={styles.buttonText}>Preview Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPreview = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('details')}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Preview</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.previewPost}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>U</Text>
            </View>
            <View>
              <Text style={styles.username}>Your Username</Text>
              {postData.location && locationVisibility && (
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={12} color="#6B7280" />
                  <Text style={styles.locationText}>{postData.location.name}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.postMedia}>
          {selectedMedia[currentMediaIndex]?.type === 'video' ? (
            <Video
              source={{ uri: selectedMedia[currentMediaIndex]?.uri }}
              style={styles.postImage}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
            />
          ) : (
            <Image
              source={{ uri: selectedMedia[currentMediaIndex]?.uri }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {selectedMedia.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.previewNavButton, styles.previewPrevButton]}
                onPress={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                disabled={currentMediaIndex === 0}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewNavButton, styles.previewNextButton]}
                onPress={() => setCurrentMediaIndex(Math.min(selectedMedia.length - 1, currentMediaIndex + 1))}
                disabled={currentMediaIndex === selectedMedia.length - 1}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

          {selectedMedia.length > 1 && (
            <View style={styles.mediaCounter}>
              <Text style={styles.mediaCounterText}>
                {currentMediaIndex + 1}/{selectedMedia.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.postContent}>
          {postData.title && (
            <Text style={styles.postTitle}>{postData.title}</Text>
          )}

          {postData.description && (
            <Text style={styles.postDescription}>{postData.description}</Text>
          )}

          <View style={styles.postMeta}>
            <View style={styles.metaLeft}>
              <View style={styles.metaItem}>
                <Ionicons name="globe" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{postData.visibility}</Text>
              </View>
              {postData.featured && (
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.metaText}>Featured</Text>
                </View>
              )}
            </View>
            <Text style={styles.metaText}>
              {selectedMedia.length} media item{selectedMedia.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.shareButton}
        onPress={handlePost}
      >
        <Text style={styles.shareButtonText}>Share Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={localBackgroundImage}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          

          {showPaymentModal ? (
            <PaymentScreen onBuy={handlePaymentBuy} onCancel={handlePaymentCancel} />
          ) : (
            <>
              {currentStep === 'media' && renderMediaSelection()}
              {currentStep === 'details' && renderDetailsForm()}
              {currentStep === 'preview' && renderPreview()}
            </>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const paymentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0BBE4', 
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  planCard: {
    backgroundColor: '#2D2D3A',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 50,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#4A4A5A', 
  },
  starIcon: {
    marginBottom: 15,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  planDuration: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 20,
  },
  featuresList: {
    marginTop: 15,
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  buyButton: {
    backgroundColor: '#00C853', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: '#FF3B30', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  appHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: '28%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  counter: {
    fontSize: 14,
    color: 'white',
  },
  mediaPreviewContainer: {
    marginBottom: 20,
  },
  mainMediaContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainMedia: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    padding: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    padding: 6,
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    transform: [{ translateY: -20 }],
    zIndex: 1,
  },
  prevButton: {
    left: 8,
  },
  nextButton: {
    right: 8,
  },
  thumbnailList: {
    marginTop: 8,
  },
  thumbnailContainer: {
    paddingHorizontal: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  activeThumbnail: {
    borderColor: '#3B82F6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  buttonContainer: {
    gap: 0, 
  },
  selectButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextStepButton: {
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    color: 'white',
  },
  placeholder: {
    width: 64,
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  locationTextDisplay: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  visibilityContainer: {
    gap: 8,
  },
  visibilityOption: {
    paddingVertical: 4,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  visibilityLabel: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: 'white',
  },
  previewPost: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    overflow: 'hidden',
    marginBottom: 24,
  },
  postHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postMedia: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#000000',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  mediaCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediaCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  previewNavButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
    transform: [{ translateY: -25 }],
    zIndex: 1,
  },
  previewPrevButton: {
    left: 10,
  },
  previewNextButton: {
    right: 10,
  },
  postContent: {
    padding: 16,
    gap: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  postDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  shareButton: {
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MediaPostCreator;