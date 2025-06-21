import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = "https://testing-80wh.onrender.com";

// --- API Functions (unchanged) ---
async function getAudioTranscription(audioUri: string): Promise<string> {
    console.log("Transcribing audio from:", audioUri);
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const response = await fetch(`${BASE_URL}/get_transcript`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Transcription request failed with status:", response.status, "Body:", errorText);
        throw new Error("Failed to get transcription");
    }

    const data = await response.json();
    console.log("Transcription result:", data.data);
    return data.data;
}

async function chat_response(inputs: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat_response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs }),
  });
  if (!response.ok) throw new Error("Failed to get chat response");
  const data = await response.json();
  return data.data;
}

async function textToSpeech(text: string): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/text_to_speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: text }),
      });
      if (!response.ok) {
        throw new Error(`TTS API failed with status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching text-to-speech audio:", error);
      return null;
    }
}

// --- Type Definitions (unchanged) ---
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'indicator';
  text: string;
  audioData?: string | null;
  feedback?: 'up' | 'down' | null;
};

type ProcessingState = 'idle' | 'transcribing' | 'generating_response';

// --- UI Components (Updated for Gemini-style) ---

const MessageBubble = ({
    message,
    onUpdateFeedback,
    currentlyPlayingId,
    setCurrentlyPlayingId,
  }: {
    message: ChatMessage;
    onUpdateFeedback: (messageId: string, feedback: 'up' | 'down' | null) => void;
    currentlyPlayingId: string | null;
    setCurrentlyPlayingId: (id: string | null) => void;
  }) => {
    const isUser = message.role === 'user';
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const isPlaying = currentlyPlayingId === message.id;

    const primaryColor = useThemeColor({}, 'primary');
    const onPrimaryColor = useThemeColor({}, 'onPrimary');
    const onSurfaceColor = useThemeColor({}, 'onSurface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const surfaceContainerColor = useThemeColor({}, 'secondary');

    const handlePlayPause = async () => {
        if (isPlaying) {
            await sound?.pauseAsync();
            setCurrentlyPlayingId(null);
        } else {
            if (message.audioData) {
                try {
                    const soundObject = new Audio.Sound();
                    const uri = `data:audio/mpeg;base64,${message.audioData}`;

                    soundObject.setOnPlaybackStatusUpdate(status => {
                        if (status.isLoaded && status.didJustFinish) {
                            soundObject.unloadAsync();
                            if (currentlyPlayingId === message.id) {
                                setCurrentlyPlayingId(null);
                                setSound(null);
                            }
                        }
                    });

                    await soundObject.loadAsync({ uri });
                    await soundObject.playAsync();
                    setSound(soundObject);
                    setCurrentlyPlayingId(message.id);
                } catch (error) {
                    console.error("Failed to play sound", error);
                    setCurrentlyPlayingId(null);
                }
            }
        }
    };

    useEffect(() => {
        if (currentlyPlayingId !== message.id) {
            sound?.pauseAsync();
        }
        return () => {
            sound?.unloadAsync();
        };
    }, [currentlyPlayingId, sound]);

    const handleFeedback = (feedback: 'up' | 'down') => {
      const newFeedback = message.feedback === feedback ? null : feedback;
      onUpdateFeedback(message.id, newFeedback);
    };

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: primaryColor as string }]
            : [styles.assistantBubble, { backgroundColor: 'rgba(11, 1, 1, 0.22)' }]
        ]}>
          <ThemedText style={[
            styles.messageText,
            { color: isUser ? onPrimaryColor as string : 'white' }
          ]}>
            {message.text}
          </ThemedText>
        </View>

        {!isUser && (
          <View style={styles.actionButtonsContainer}>
            <Pressable
              onPress={handlePlayPause}
              disabled={!message.audioData}
              style={[
                styles.actionButton,
                !message.audioData && styles.disabledButton
              ]}
              hitSlop={8}
            >
              <IconSymbol
                name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                size={20}
                color={'#E0E0E0'}
              />
            </Pressable>
            <Pressable 
              onPress={() => handleFeedback('up')} 
              style={[
                styles.actionButton,
                message.feedback === 'up' && styles.activeButton
              ]}
              hitSlop={8}
            >
              <IconSymbol
                name="hand.thumbsup.fill"
                size={16}
                color={message.feedback === 'up' ? onPrimaryColor as string : '#E0E0E0'}
              />
            </Pressable>
            <Pressable 
              onPress={() => handleFeedback('down')} 
              style={[
                styles.actionButton,
                message.feedback === 'down' && styles.activeButton
              ]}
              hitSlop={8}
            >
              <IconSymbol
                name="hand.thumbsdown.fill"
                size={16}
                color={message.feedback === 'down' ? onPrimaryColor as string : '#E0E0E0'}
              />
            </Pressable>
          </View>
        )}
      </View>
    );
};

const ProgressIndicator = ({ state }: { state: ProcessingState }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const createAnimation = (dot: Animated.Value, delay: number) => Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(dot, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      );

      const animation = Animated.parallel([
        createAnimation(dot1, 0),
        createAnimation(dot2, 200),
        createAnimation(dot3, 400),
      ]);
      animation.start();
      return () => animation.stop();
    }, [dot1, dot2, dot3]);

    const animatedStyle = (dot: Animated.Value) => ({
      opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
      transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }]
    });

    return (
      <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <View style={styles.typingContainer}>
              <ThemedText style={styles.generatingText}>generating response</ThemedText>
              <Animated.View style={[styles.typingDot, animatedStyle(dot1)]} />
              <Animated.View style={[styles.typingDot, animatedStyle(dot2)]} />
              <Animated.View style={[styles.typingDot, animatedStyle(dot3)]} />
            </View>
          </View>
      </View>
    );
};

const EmptyState = () => {
    return (
        <View style={styles.emptyStateContainer} pointerEvents="none">
            <View style={styles.emptyStateIcon}>
                <IconSymbol name="sparkles" size={48} color="#FFFFFF" />
            </View>
            <ThemedText type="title" style={styles.emptyStateTitle}>Heritage AI</ThemedText>
            <ThemedText style={styles.emptyStateSubtitle}>Ask me about Bengali culture</ThemedText>
        </View>
    )
};

export default function SpacesScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const errorColor = useThemeColor({}, 'error');

  const handleSend = async (text: string) => {
    if (text.trim() === '') return;
    setCurrentlyPlayingId(null);

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [userMessage, ...prev]);
    setInput('');
    setProcessingState('generating_response');

    try {
        const botResponseText = await chat_response(userMessage.text);
        const audioData = await textToSpeech(botResponseText);

        const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: botResponseText,
            audioData: audioData,
            feedback: null,
        };

        setMessages(prev => [botMessage, ...prev]);
    } catch (error) {
        console.error("Failed to get bot response or audio:", error);
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: "Sorry, an error occurred. Please try again.",
        };
        setMessages(prev => [errorMessage, ...prev]);
    } finally {
        setProcessingState('idle');
    }
  };

  const startRecording = async () => {
    try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setIsRecording(true);
    } catch (err) {
        console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    setProcessingState('transcribing');
    try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
            const transcribedText = await getAudioTranscription(uri);
            if (transcribedText && transcribedText.trim()) {
                await handleSend(transcribedText);
            }
        }
    } catch (error) {
        console.error('Failed to stop/process recording', error);
    } finally {
        setProcessingState('idle');
    }
  };

  const handleMicOrSend = () => {
      if (input.trim()) {
          handleSend(input);
      } else {
          isRecording ? stopRecording() : startRecording();
      }
  }

  const handleFeedbackUpdate = useCallback((messageId: string, feedback: 'up' | 'down' | null) => {
    setMessages(prevMessages =>
        prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, feedback } : msg
        )
    );
  }, []);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    if (item.role === 'indicator') {
        return <ProgressIndicator state={processingState} />;
    }
    return (
        <MessageBubble
            message={item}
            onUpdateFeedback={handleFeedbackUpdate}
            currentlyPlayingId={currentlyPlayingId}
            setCurrentlyPlayingId={setCurrentlyPlayingId}
        />
    )
  }, [handleFeedbackUpdate, currentlyPlayingId, processingState]);

  const displayData: ChatMessage[] = processingState !== 'idle'
    ? [{ id: 'progress-indicator', role: 'indicator', text: '' }, ...messages]
    : messages;

  const isProcessing = processingState !== 'idle';

  return (
    <ImageBackground
      source={require('@/assets/images/play.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.flex}>
              {messages.length === 0 && !isProcessing && <EmptyState />}
              <FlatList
                  data={displayData}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  style={styles.flex}
                  contentContainerStyle={styles.listContentContainer}
                  inverted
                  showsVerticalScrollIndicator={false}
              />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={isRecording ? "Listening..." : "Message Heritage AI"}
                placeholderTextColor="#999999"
                multiline
                editable={!isRecording && !isProcessing}
              />
              <Pressable
                onPress={handleMicOrSend}
                disabled={isProcessing}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                      backgroundColor: isRecording ? errorColor as string : primaryColor as string,
                      opacity: pressed || isProcessing ? 0.8 : 1
                  },
                ]}
              >
                {isProcessing && !isRecording ? (
                    <ActivityIndicator color={onPrimaryColor as string} size="small" />
                ) : (
                    <IconSymbol
                        name={input.trim() ? 'arrow.up' : 'mic.fill'}
                        color={onPrimaryColor as string}
                        size={20}
                    />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- Updated Stylesheet for Gemini-style ---
const styles = StyleSheet.create({
    backgroundImage: {
      flex: 1,
    },
    backgroundOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    container: { 
      flex: 1 
    },
    flex: { 
      flex: 1 
    },
    listContentContainer: {
      paddingVertical: 16,
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    messageContainer: {
        marginVertical: 4,
        maxWidth: '80%',
        paddingHorizontal: 16,
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    assistantMessageContainer: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    userBubble: {
      borderBottomRightRadius: 6,
    },
    assistantBubble: {
      borderBottomLeftRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      marginLeft: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      
    },
    activeButton: {
      backgroundColor: '#8A2BE2',
      borderColor: '#666666',
    },
    disabledButton: {
      opacity: 0.5,
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    generatingText: {
      color: '#FFFFFF',
      fontSize: 14,
      marginRight: 8,
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      marginHorizontal: 2,
    },
    bubbleActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        marginTop: 8,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: '#333333',
      borderRadius: 24,
      paddingLeft: 16,
      paddingRight: 4,
      paddingVertical: 4,
      minHeight: 48,
      borderWidth: 1,
      borderColor: '#555555',
    },
    input: {
      flex: 1,
      fontSize: 16,
      lineHeight: 20,
      color: 'white',
      maxHeight: 120,
      paddingVertical: 10,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyStateContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 100,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#555555',
    },
    emptyStateTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        color: '#CCCCCC',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    }
});