import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = "https://testing-80wh.onrender.com";

// --- API Calls ---

// FIXED: The getAudioTranscription function has been corrected.
async function getAudioTranscription(audioUri: string): Promise<string> {
    console.log("Transcribing audio from:", audioUri);
    const formData = new FormData();
    // FIX: The backend FastAPI endpoint expects the file under the key 'audio', not 'file'.
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const response = await fetch(`${BASE_URL}/get_transcript`, {
        method: 'POST',
        body: formData,
        // Note: Do not set 'Content-Type': 'multipart/form-data' manually.
        // React Native's fetch will do this automatically with the correct boundary.
    });

    if (!response.ok) {
        // IMPROVEMENT: Log the server response for better debugging.
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


// --- Types ---
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'indicator';
  text: string;
  audioData?: string | null;
  feedback?: 'up' | 'down' | null;
};

// NEW: A more descriptive state for processing
type ProcessingState = 'idle' | 'transcribing' | 'generating_response';


// --- Components ---

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
    const surfaceColor = useThemeColor({}, 'surface');
    const onPrimaryColor = useThemeColor({}, 'onPrimary');
    const onSurfaceColor = useThemeColor({}, 'onSurface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const backgroundColor = useThemeColor({}, 'background');
  
    const handlePlayPause = async () => {
      if (currentlyPlayingId && currentlyPlayingId !== message.id) {
        setCurrentlyPlayingId(null);
      }
  
      if (sound && isPlaying) {
        await sound.pauseAsync();
        setCurrentlyPlayingId(null);
      } else if (message.audioData) {
        try {
          const soundObject = new Audio.Sound();
          const uri = `data:audio/mpeg;base64,${message.audioData}`;
          
          soundObject.setOnPlaybackStatusUpdate(status => {
            if (status.isLoaded && status.didJustFinish) {
              setCurrentlyPlayingId(null);
              soundObject.unloadAsync();
              setSound(null);
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
    };
  
    useEffect(() => {
        if (isPlaying && currentlyPlayingId !== message.id) {
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
      <View style={styles.messageContainer}>
        {/* Avatar section */}
        <View style={styles.avatarContainer}>
          {!isUser && (
            <View style={[styles.avatar, { backgroundColor: primaryColor as string }]}>
              <IconSymbol name="sparkles" size={14} color={onPrimaryColor as string} />
            </View>
          )}
        </View>
        
        {/* Message content */}
        <View style={styles.messageContent}>
          <View style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : [styles.assistantBubble, { backgroundColor: backgroundColor as string }]
          ]}>
            <ThemedText style={{ 
              color: isUser ? onPrimaryColor as string : onSurfaceColor as string,
              fontSize: 15,
              lineHeight: 20
            }}>
              {message.text}
            </ThemedText>
          </View>
          
          {/* Action buttons for assistant messages */}
          {!isUser && (
            <View style={styles.actionButtonsContainer}>
              <Pressable 
                onPress={handlePlayPause} 
                style={[styles.actionButton, { opacity: message.audioData ? 1 : 0.3 }]}
                disabled={!message.audioData}
              >
                <IconSymbol 
                  name={isPlaying ? "speaker.wave.3.fill" : "speaker.wave.2.fill"} 
                  size={16} 
                  color={onSurfaceVariantColor as string}
                />
              </Pressable>
              
              <Pressable 
                onPress={() => handleFeedback('up')} 
                style={[
                  styles.actionButton,
                  message.feedback === 'up' && styles.activeActionButton
                ]}
              >
                <IconSymbol 
                  name="hand.thumbsup"
                  size={16}
                  color={message.feedback === 'up' ? primaryColor as string : onSurfaceVariantColor as string}
                />
              </Pressable>
              
              <Pressable 
                onPress={() => handleFeedback('down')} 
                style={[
                  styles.actionButton,
                  message.feedback === 'down' && styles.activeActionButton
                ]}
              >
                <IconSymbol 
                  name="hand.thumbsdown"
                  size={16} 
                  color={message.feedback === 'down' ? primaryColor as string : onSurfaceVariantColor as string}
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
};
  
const ProgressIndicator = ({ state }: { state: ProcessingState }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const primaryColor = useThemeColor({}, 'primary');
    const onPrimaryColor = useThemeColor({}, 'onPrimary');
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const statusText: Record<ProcessingState, string> = {
        'idle': '', // Should not be rendered when idle
        'transcribing': 'Transcribing...',
        'generating_response': 'Generating response...'
    };
  
    useEffect(() => {
      const createAnimation = (dot: Animated.Value, delay: number) => Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.delay(400)
        ])
      );
  
      const animation = Animated.parallel([
        createAnimation(dot1, 0),
        createAnimation(dot2, 150),
        createAnimation(dot3, 300),
      ]);
      animation.start();
      return () => animation.stop();
    }, [dot1, dot2, dot3]);
  
    const animatedStyle = (dot: Animated.Value) => ({
      opacity: dot,
      transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }]
    });
  
    return (
      <View style={styles.messageContainer}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: primaryColor as string }]}>
            <IconSymbol name="sparkles" size={14} color={onPrimaryColor as string} />
          </View>
        </View>
        
        <View style={styles.messageContent}>
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: backgroundColor as string }]}>
            <View style={styles.typingContainer}>
              <ThemedText style={{ color: onSurfaceVariantColor as string, marginRight: 8, fontSize: 15 }}>
                {statusText[state]}
              </ThemedText>
              <Animated.View style={[styles.typingDot, { backgroundColor: onSurfaceVariantColor as string }, animatedStyle(dot1)]} />
              <Animated.View style={[styles.typingDot, { backgroundColor: onSurfaceVariantColor as string }, animatedStyle(dot2)]} />
              <Animated.View style={[styles.typingDot, { backgroundColor: onSurfaceVariantColor as string }, animatedStyle(dot3)]} />
            </View>
          </View>
        </View>
      </View>
    );
};

const EmptyState = () => {
    const onSurfaceColor = useThemeColor({}, 'onSurface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const surfaceVariantColor = useThemeColor({}, 'surfaceVariant');
    return (
        <View style={styles.emptyStateContainer} pointerEvents="none">
            <View style={[styles.emptyStateIcon, { backgroundColor: surfaceVariantColor as string }]}>
                <IconSymbol name="sparkles" size={32} color={onSurfaceVariantColor as string} />
            </View>
            <ThemedText type="title" style={{color: onSurfaceColor as string, marginTop: 16}}>Heritage AI</ThemedText>
            <ThemedText style={{color: onSurfaceVariantColor as string, marginTop: 4}}>Ask me about Bengali culture</ThemedText>
        </View>
    )
};

// --- Main Screen ---
export default function SpacesScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const onSurfaceColor = useThemeColor({}, 'onSurface');
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const errorColor = useThemeColor({}, 'error');

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'Heritage AI' })
  }, [navigation]);

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
            } else {
                setProcessingState('idle');
            }
        } else {
            setProcessingState('idle');
        }
    } catch (error) {
        console.error('Failed to stop/process recording', error);
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
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor as string }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
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
            />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: surfaceColor as string }]}>
          <TextInput
            style={[styles.input, { color: onSurfaceColor as string, backgroundColor: backgroundColor as string }]}
            value={input}
            onChangeText={setInput}
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            placeholderTextColor={onSurfaceVariantColor as string}
            multiline
            editable={!isRecording && !isProcessing}
          />
          <Pressable
            onPress={handleMicOrSend}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.sendButton,
              { 
                  backgroundColor: (isRecording ? errorColor : primaryColor) as string, 
                  opacity: pressed || isProcessing ? 0.8 : 1 
              },
            ]}
          >
            {
             isProcessing && !isRecording ? (
                <ActivityIndicator color={onPrimaryColor as string} /> 
             ) : (
                <IconSymbol 
                    name={input.trim() ? 'paperplane.fill' : 'mic.fill'} 
                    color={onPrimaryColor as string} 
                    size={20} 
                />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


// --- Styles (Updated for ChatGPT-like layout) ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    listContentContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexGrow: 1,
      justifyContent: 'flex-end'
    },
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 8,
      paddingHorizontal: 4,
    },
    avatarContainer: {
      width: 30,
      alignItems: 'center',
      paddingTop: 2,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageContent: {
      flex: 1,
      marginLeft: 12,
    },
    messageBubble: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      maxWidth: '90%',
    },
    userBubble: {
      backgroundColor: '#007AFF',
      borderRadius: 18,
      borderBottomRightRadius: 6,
      alignSelf: 'flex-end',
      marginRight: 34, // Space for where avatar would be
    },
    assistantBubble: {
      borderRadius: 18,
      borderBottomLeftRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginLeft: 4,
    },
    actionButton: {
      padding: 8,
      marginRight: 4,
      borderRadius: 6,
      backgroundColor: 'transparent',
    },
    activeActionButton: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 2,
    },
    bubbleActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        marginTop: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.light.outlineVariant,
    },
    input: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      fontSize: 16,
      lineHeight: 20,
      maxHeight: 120,
      marginRight: 12,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        paddingBottom: 60,
    },
    emptyStateIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center'
    }
});