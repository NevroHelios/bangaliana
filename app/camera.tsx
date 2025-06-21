import { CameraComponent } from '@/components/CameraView';
import * as api from '@/services/api';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function MediaPreview({ uri, type, onConfirm, onDiscard }: { uri: string; type: 'photo' | 'video'; onConfirm: () => void; onDiscard: () => void; }) {
  return (
    <View style={previewStyles.container}>
      {type === 'photo' ? (
        <Image source={{ uri }} style={previewStyles.media} resizeMode="contain" />
      ) : (
        <Video
          source={{ uri }}
          style={previewStyles.media}
          useNativeControls
          shouldPlay
        />
      )}
      <View style={previewStyles.buttonRow}>
        <TouchableOpacity style={previewStyles.button} onPress={onDiscard}>
          <Text style={previewStyles.buttonText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={previewStyles.button} onPress={onConfirm}>
          <Text style={previewStyles.buttonText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '70%',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  button: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default function CameraScreen() {
  const router = useRouter();
  const [preview, setPreview] = useState<{ uri: string; type: 'photo' | 'video'; aspectRatio?: number } | null>(null);

  const handleMediaCaptured = (uri: string, type: 'photo' | 'video', aspectRatio?: number) => {
    console.log('Media captured:', { uri, type, aspectRatio });
    setPreview({ uri, type, aspectRatio });
  };

  const handleConfirmUpload = async () => {
    console.log('Confirming upload:', { preview });
    if (!preview) {
      setPreview(null);
      router.back();
      return;
    }
    try {
      console.log('Creating form data...');
      const formData = new FormData();
      formData.append('userId', 'anonymous');
      formData.append('type', preview.type);
      formData.append('timestamp', Date.now().toString());
      if (preview.aspectRatio) formData.append('aspectRatio', preview.aspectRatio.toString());
      formData.append('mediaFile', {
        uri: preview.uri,
        name: `media_${Date.now()}.${preview.uri.split('.').pop()}`,
        type: preview.type === 'video' ? 'video/mp4' : 'image/jpeg',
      } as any);
      
      console.log('Uploading media...');
      await api.uploadMediaItem(formData, '');
      console.log('Upload successful');
      setPreview(null);
      router.back();
    } catch (error) {
      console.error('Upload failed:', error);
      setPreview(null);
      Alert.alert('Error', 'Failed to save media.');
      router.back();
    }
  };

  const handleDiscard = () => {
    console.log('Discarding media');
    setPreview(null);
  };

  const handleCloseCamera = () => {
    console.log('Closing camera');
    router.back();
  };

  return (
    <View style={styles.container}>
      {!preview ? (
        <CameraComponent
          onMediaCaptured={handleMediaCaptured}
          onClose={handleCloseCamera}
        />
      ) : (
        <MediaPreview
          uri={preview.uri}
          type={preview.type}
          onConfirm={handleConfirmUpload}
          onDiscard={handleDiscard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
