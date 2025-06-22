import { CameraComponent } from '@/components/CameraView';
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
    if (!preview) {
      setPreview(null);
      router.back();
      return;
    }
    // Instead of uploading directly, navigate to upload page with params
    router.push({
      pathname: '/(drawer)/upload',
      params: {
        imageUri: preview.uri,
        imageAspectRatio: preview.aspectRatio?.toString(),
      },
    });
    setPreview(null);
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
