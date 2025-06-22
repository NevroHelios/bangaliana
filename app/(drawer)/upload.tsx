      
import { API_BASE_URL } from '@/config/config';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MediaItem, PostData } from '@/types'; // Make sure this path is correct for your project
import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, SafeAreaView, StyleSheet, View } from 'react-native';
import { DetailsForm } from '@/components/postCreator/DetailsForm';
import { MediaSelection } from '@/components/postCreator/MediaSelection';
import { PaymentScreen } from '@/components/postCreator/PaymentScreen';
import { PostPreview } from '@/components/postCreator/PostPreview';

// Ensure you have an image at this path or update it.
const backgroundImage = require('@/assets/images/heritage2.avif');

const MediaPostCreator = () => {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState<'media' | 'details' | 'preview'>('media');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { imageUri, imageAspectRatio } = useLocalSearchParams<{ imageUri?: string, imageAspectRatio?: string }>();

  const [postData, setPostData] = useState<PostData>({
    userId: user?.id || '',
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
    travelContext: null,
  });

  const [locationVisibility, setLocationVisibility] = useState(true);

  // Theme colors are still needed for UI elements like buttons, text, etc.
  const onBackgroundColor = useThemeColor({}, 'onBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const surfaceColor = useThemeColor({}, 'surface');
  const onSurfaceColor = useThemeColor({}, 'onSurface');
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
  const outlineVariantColor = useThemeColor({}, 'outlineVariant');
  const errorColor = useThemeColor({}, 'error');

  const headerHeight = useHeaderHeight();

  useEffect(() => {
    if (user) setPostData((prev) => ({ ...prev, userId: user.id }));
  }, [user]);

  useEffect(() => {
    if (imageUri) {
      const newMediaItem: MediaItem = {
        id: Date.now(),
        uri: imageUri,
        type: 'image',
        width: imageAspectRatio ? parseFloat(imageAspectRatio) * 400 : 400,
        height: 400,
      };
      setSelectedMedia([newMediaItem]);
      setCurrentStep('details');
    }
  }, [imageUri, imageAspectRatio]);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode && geocode.length > 0) {
        const { city, region, country } = geocode[0];
        setPostData(prev => ({
          ...prev,
          location: {
            name: [city, region, country].filter(Boolean).join(', '),
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };
  
  const resetState = () => {
    setSelectedMedia([]);
    setCurrentMediaIndex(0);
    setPostData({
      userId: user?.id || '',
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
      travelContext: null,
    });
    setCurrentStep('media');
    fetchUserLocation();
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to select media');
        return;
    }
    if (selectedMedia.length >= 20) {
        Alert.alert('Limit reached', 'You can only select up to 20 media items');
        return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
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
        setSelectedMedia(prev => [...prev, ...newMedia].slice(0, 20));
    }
  };

  const removeMedia = (mediaId: number) => {
    const newMedia = selectedMedia.filter(item => item.id !== mediaId);
    setSelectedMedia(newMedia);
    if (newMedia.length === 0) {
        setCurrentMediaIndex(0);
    } else if (currentMediaIndex >= newMedia.length) {
        setCurrentMediaIndex(newMedia.length - 1);
    }
  };

  const handlePost = async () => {
    if (!user || !token) return Alert.alert('Not Authenticated', 'You must be logged in to post.');
    if (selectedMedia.length === 0) return Alert.alert('No Media', 'Please select at least one item.');

    const formData = new FormData();
    try {
        for (let i = 0; i < selectedMedia.length; i++) {
            const media = selectedMedia[i];
            const uriParts = media.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            formData.append('media', {
                uri: media.uri,
                name: media.fileName || `post_media_${i}.${fileType}`,
                type: `${media.type}/${fileType}`,
            } as any);
        }

        formData.append('userId', user.id);
        formData.append('title', postData.title);
        formData.append('description', postData.description);
        formData.append('visibility', postData.visibility);
        formData.append('featured', String(postData.featured));

        if (postData.location) {
            formData.append('locationName', postData.location.name);
            if (postData.location.latitude) formData.append('latitude', String(postData.location.latitude));
            if (postData.location.longitude) formData.append('longitude', String(postData.location.longitude));
        }

        const response = await fetch(`${API_BASE_URL}/api/posts/createpost`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create post');
        }

        Alert.alert('Success', 'Post created successfully!');
        resetState();
    } catch (error: any) {
        console.error('[DEBUG] Error in handlePost:', error);
        Alert.alert('Error', `Failed to share post: ${error.message}`);
    }
  };

  const handlePreviewPress = () => {
    if (postData.featured) {
      setShowPaymentModal(true);
    } else {
      setCurrentStep('preview');
    }
  };

  const handlePaymentBuy = () => {
    Alert.alert('Purchase Successful!', 'Your post will now be featured.');
    setShowPaymentModal(false);
    setCurrentStep('preview');
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPostData((prev) => ({ ...prev, featured: false }));
  };

  const renderContent = () => {
    if (showPaymentModal) {
      return <PaymentScreen onBuy={handlePaymentBuy} onCancel={handlePaymentCancel} />;
    }

    // Pass "transparent" as backgroundColor to all child components so the background shows through
    switch (currentStep) {
      case 'media':
        return (
          <MediaSelection
            selectedMedia={selectedMedia}
            currentMediaIndex={currentMediaIndex}
            setCurrentMediaIndex={setCurrentMediaIndex}
            onMediaRemove={removeMedia}
            onMediaSelect={pickMedia}
            onNext={() => setCurrentStep('details')}
            backgroundColor="transparent"
            primaryColor={primaryColor as string}
            onPrimaryColor={onPrimaryColor as string}
            errorColor={errorColor as string}
            onSurfaceVariantColor={onSurfaceVariantColor as string}
          />
        );
      case 'details':
        return (
          <DetailsForm
            postData={postData}
            setPostData={setPostData}
            onBack={() => setCurrentStep('media')}
            onPreview={handlePreviewPress}
            backgroundColor="transparent"
            onBackgroundColor={onBackgroundColor as string}
            primaryColor={primaryColor as string}
            onPrimaryColor={onPrimaryColor as string}
            surfaceColor={surfaceColor as string}
            onSurfaceColor={onSurfaceColor as string}
            onSurfaceVariantColor={onSurfaceVariantColor as string}
            outlineVariantColor={outlineVariantColor as string}
          />
        );
      case 'preview':
        return (
          <PostPreview
            postData={postData}
            selectedMedia={selectedMedia}
            currentMediaIndex={currentMediaIndex}
            setCurrentMediaIndex={setCurrentMediaIndex}
            locationVisibility={locationVisibility}
            onBack={() => setCurrentStep('details')}
            onShare={handlePost}
            backgroundColor="transparent"
            onBackgroundColor={onBackgroundColor as string}
            primaryColor={primaryColor as string}
            onPrimaryColor={onPrimaryColor as string}
            onSurfaceVariantColor={onSurfaceVariantColor as string}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={{ paddingTop: headerHeight, flex: 1 }}>
          {renderContent()}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // This makes the view fill its parent
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Dark overlay, adjust opacity as needed
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Make SafeAreaView transparent
  },
});

export default MediaPostCreator;

    