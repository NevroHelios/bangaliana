import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BACKEND_URL = 'http://192.168.47.91:10000';

const PeakMomentsScreen = () => {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const videoPlayerRef = useRef<Video>(null);

  const pickVideo = async () => {
    console.log('[PeakMoments] pickVideo function started.');
    // Reset state
    setSelectedVideo(null);
    setTrimmedVideoUrl(null);
    setTitle('');
    setDescription('');
    console.log('[PeakMoments] Requesting media library permissions...');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(`[PeakMoments] Media library permission status: ${status}`);
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      console.log('[PeakMoments] Launching image library...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7, // Lower quality to speed up upload
      });
      console.log(`[PeakMoments] Image library result: ${result.canceled ? 'canceled' : 'success'}`);

      if (!result.canceled) {
        console.log('[PeakMoments] Setting selected video asset.');
        setSelectedVideo(result.assets[0]);
      }
    } catch (error) {
        console.error('[PeakMoments] Error in pickVideo:', error);
        Alert.alert('Error', 'An error occurred while picking the video.');
    }
  };

  const handleUploadAndGenerate = async () => {
    if (!selectedVideo) {
      Alert.alert('No Video Selected', 'Please pick a video first.');
      return;
    }

    if (!token) {
      Alert.alert('Not Authenticated', 'You need to be logged in to use this feature.');
      return;
    }

    setIsLoading(true);
    setTrimmedVideoUrl(null);

    // TODO: This workflow has changed.
    // The new backend endpoint `/video/process-complete` expects a `cloudinaryUrl`.
    // This means the app should first upload the `selectedVideo.uri` to Cloudinary,
    // get the URL, and then send that URL to our backend.
    // For now, we are sending the local URI as a placeholder.

    const requestBody = {
      // This should be the URL from Cloudinary after a direct upload.
      cloudinaryUrl: selectedVideo.uri,
      title: title,
      description: description,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/media/video/process-complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Something went wrong on the server.');
      }

      // Assuming the response has a structure like { data: { trimmedVideo: { url: '...' } } }
      // You might need to adjust this based on your actual API response
      const url = responseData?.data?.trimmedVideo?.url || responseData?.url;

      if (url) {
        setTrimmedVideoUrl(url);
        Alert.alert('Success!', 'Your video has been trimmed to its peak moments.');
      } else {
        console.error('API Response does not contain a valid URL:', responseData);
        throw new Error('Could not find the trimmed video URL in the response.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Upload Error:', errorMessage);
      Alert.alert('Generation Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={32} color={theme.primary} />
        <Text style={styles.title}>Peak Moments</Text>
        <Text style={styles.subtitle}>
          Upload a video, and our AI will find the most exciting parts for you!
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Analyzing your video... This may take a moment.</Text>
        </View>
      ) : trimmedVideoUrl ? (
        <View style={styles.videoContainer}>
            <Text style={styles.resultTitle}>Here's Your Highlight Reel!</Text>
            <Video
                ref={videoPlayerRef}
                source={{ uri: trimmedVideoUrl }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
            />
            <TouchableOpacity style={styles.button} onPress={pickVideo}>
                <Ionicons name="videocam-outline" size={20} color={theme.background} />
                <Text style={styles.buttonText}>Pick Another Video</Text>
            </TouchableOpacity>
        </View>
      ) : selectedVideo ? (
        <View style={styles.videoContainer}>
          <Text style={styles.resultTitle}>Video Ready for Analysis</Text>
          <Video
            source={{ uri: selectedVideo.uri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
          <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="Enter a title..."
                placeholderTextColor={theme.secondary}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter a description..."
                placeholderTextColor={theme.secondary}
                value={description}
                onChangeText={setDescription}
                multiline
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUploadAndGenerate}>
            <Ionicons name="cloud-upload-outline" size={20} color={theme.background} />
            <Text style={styles.buttonText}>Generate Highlights</Text>
          </TouchableOpacity>
           <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickVideo}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Choose a different video</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="film-outline" size={80} color={theme.secondary} />
          <Text style={styles.placeholderText}>No video selected</Text>
          <TouchableOpacity style={styles.button} onPress={pickVideo}>
            <Ionicons name="videocam-outline" size={20} color={theme.background} />
            <Text style={styles.buttonText}>Pick a Video</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: insets.top + 20,
    paddingBottom: insets.bottom + 20,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: theme.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: theme.background,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  secondaryButtonText: {
      color: theme.primary,
      marginLeft: 0,
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 250, 
    borderRadius: 15,
    backgroundColor: '#000',
    marginTop: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.outline,
    borderRadius: 15,
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: theme.secondary,
    marginTop: 15,
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.outline,
  },
  textArea: {
      height: 100,
      textAlignVertical: 'top',
  },
});

export default PeakMomentsScreen;
