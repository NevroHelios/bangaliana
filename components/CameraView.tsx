import { Camera, CameraType, CameraView } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CameraComponentProps {
  onMediaCaptured: (uri: string, type: 'photo' | 'video', aspectRatio?: number) => void;
  onClose: () => void;
}

export function CameraComponent({ onMediaCaptured, onClose }: CameraComponentProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [canStopRecording, setCanStopRecording] = useState(true); // Add this state
  const cameraRef = useRef<CameraView>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(status === 'granted' && micStatus === 'granted');
    })();
  }, []);

  React.useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>Requesting permissions...</ThemedText>
      </ThemedView>
    );
  }
  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          We need camera and microphone permissions to document heritage
        </ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} 
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
            setHasPermission(status === 'granted' && micStatus === 'granted');
          }}
        >
          <ThemedText style={styles.buttonText}>Grant Permissions</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const capturePhoto = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync();
        const aspectRatio = photo.width && photo.height ? photo.width / photo.height : undefined;
        onMediaCaptured(photo.uri, 'photo', aspectRatio);
      } catch (error) {
        console.error('Photo capture error:', error);
        Alert.alert('Error', 'Failed to capture photo');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording && !isProcessing) {
      try {
        setIsProcessing(true);
        console.log('Starting video recording...');
        setIsRecording(true);
        setRecordingDuration(0);

        setCanStopRecording(false); // Prevent stopping immediately
        setTimeout(() => setCanStopRecording(true), 1000); // Allow stopping after 1s

        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);

        // Set maximum recording time (60 seconds)
        recordingTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, 60000);
        
        // Prevent stopping recording too early.
        setTimeout(() => {
          if (cameraRef.current) {
            setIsProcessing(false);
          }
        }, 1000);
        
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60
        });
        
        console.log('Video recording completed:', video);
        
        if (video && video.uri) {
          console.log('Video URI:', video.uri);
          onMediaCaptured(video.uri, 'video'); 
        } else {
          console.log('No video URI returned');
          Alert.alert('Error', 'Failed to record video - no URI returned');
        }
      } catch (error) {
        console.error('Error during video recording:', error);
        if (!(error instanceof Error && error.message.includes('was stopped before any data could be produced'))) {
          Alert.alert('Error', `Failed to record video: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } finally {
        // Clean up recording state
        setIsRecording(false);
        setIsProcessing(false);
        setRecordingDuration(0);
        setCanStopRecording(true); // Always allow stopping after finishing
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      }
    }
  };

  const stopRecording = async () => {
    console.log('Stopping video recording...');
    if (cameraRef.current && isRecording && canStopRecording) { // Only allow if canStopRecording is true
      try {
        cameraRef.current.stopRecording();
        console.log('Stop recording command sent');
        
        // Clear timers
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };

  const handleCapture = () => {
    console.log('Capture button pressed, mode:', mode, 'isRecording:', isRecording, 'isProcessing:', isProcessing);
    
    if (isProcessing) {
      console.log('Already processing, ignoring press');
      return;
    }
    
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        if (!canStopRecording) {
          console.log('Cannot stop recording yet (cooldown)');
          return;
        }
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <CameraView
        mode={mode}
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
          <IconSymbol name="chevron.left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'photo' && styles.activeModeButton]}
            onPress={() => !isRecording && setMode("photo")}
            disabled={isRecording}
          >
            <ThemedText style={[styles.modeText, mode === 'photo' && styles.activeModeText]}>
              Photo
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'video' && styles.activeModeButton]}
            onPress={() => !isRecording && setMode("video")}
            disabled={isRecording}
          >
            <ThemedText style={[styles.modeText, mode === 'video' && styles.activeModeText]}>
              Video
            </ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.bottomControls}>
        <View style={styles.placeholder} />
        <TouchableOpacity
          style={[
            styles.captureButton,
            mode === 'video' && styles.videoCaptureButton,
            isRecording && styles.recordingButton,
            isProcessing && styles.processingButton
          ]}
          onPress={handleCapture}
          disabled={isProcessing}
        >
          <View style={[
            styles.captureButtonInner,
            mode === 'video' && styles.videoCaptureButtonInner,
            isRecording && styles.recordingButtonInner
          ]} />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <ThemedText style={styles.recordingText}>
            REC {formatDuration(recordingDuration)}
          </ThemedText>
        </View>
      )}

      {isProcessing && mode === 'photo' && (
        <View style={styles.processingIndicator}>
          <ThemedText style={styles.processingText}>Processing...</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Changed to ensure full black background
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlButton: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeModeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeModeText: {
    color: '#000000',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  videoCaptureButton: {
    borderColor: '#ff0000',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  processingButton: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 50, // Slightly reduced size
    height: 50, // Slightly reduced size
    borderRadius: 25, // Adjusted for new size
    backgroundColor: '#ffffff',
  },
  videoCaptureButtonInner: {
    backgroundColor: '#ff0000',
  },
  recordingButtonInner: {
    width: 25, // Adjusted for new size
    height: 25, // Adjusted for new size
    borderRadius: 4,
  },
  recordingIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  recordingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  processingIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 150 : 130,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholder: {
    width: 48,
  },
});
