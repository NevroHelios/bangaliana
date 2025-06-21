import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getAudioTranscription } from '@/services/api';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
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

// --- API Calls ---
async function SpeechToText(audioUri: string): Promise<string> {
  // Simplified for brevity
  const transcript = await getAudioTranscription(audioUri);
  await new Promise(res => setTimeout(res, 1200));
  return transcript;
}

async function chat_response(inputs: string): Promise<string> {
  const response = await fetch("https://testing-80wh.onrender.com/chat_response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs }),
  });
  const data = await response.json();
  return data.data;
}

// --- Types ---
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

// --- Components ---
const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const primaryColor = useThemeColor({}, 'primary');
    const surfaceColor = useThemeColor({}, 'surface');
    const onPrimaryColor = useThemeColor({}, 'onPrimary');
    const onSurfaceColor = useThemeColor({}, 'onSurface');
  
    return (
      <View style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
        <View style={[
          styles.messageBubble,
          isUser
            ? { backgroundColor: primaryColor as string, borderBottomRightRadius: 4 }
            : { backgroundColor: surfaceColor as string, borderBottomLeftRadius: 4 }
        ]}>
          <ThemedText style={{ color: isUser ? onPrimaryColor as string : onSurfaceColor as string }}>
            {message.text}
          </ThemedText>
        </View>
      </View>
    );
};
  
const TypingIndicator = () => {
    const surfaceColor = useThemeColor({}, 'surface');
    const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const createAnimation = (dot: Animated.Value, delay: number) => Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.delay(400)
        ])
      );
  
      Animated.parallel([
        createAnimation(dot1, 0),
        createAnimation(dot2, 150),
        createAnimation(dot3, 300),
      ]).start();
    }, [dot1, dot2, dot3]);
  
    const animatedStyle = (dot: Animated.Value) => ({
      opacity: dot,
      transform: [{
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5]
        })
      }]
    });
  
    return (
      <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
        <View style={[styles.messageBubble, { backgroundColor: surfaceColor as string, borderBottomLeftRadius: 4, flexDirection: 'row' }]}>
          <Animated.View style={[styles.typingDot, { backgroundColor: onSurfaceVariantColor as string }, animatedStyle(dot1)]} />
          <Animated.View style={[styles.typingDot, { backgroundColor: onSurfaceVariantColor as string }, animatedStyle(dot2)]} />
          <Animated.View style={[styles.typingDot, { backgroundColor: onSurfaceVariantColor as string }, animatedStyle(dot3)]} />
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
}

// --- Main Screen ---
export default function SpacesScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    navigation.setOptions({
        headerTitle: 'Heritage AI'
    })
  }, [navigation]);

  const handleSend = async (text: string) => {
    if (text.trim() === '') return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [userMessage, ...prev]);
    setInput('');
    setIsProcessing(true);

    const botResponseText = await chat_response(userMessage.text);
    const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: botResponseText };
    Speech.speak(botResponseText, { language: 'bn-BD' });
    
    setMessages(prev => [botMessage, ...prev]);
    setIsProcessing(false);
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

    setIsProcessing(true);
    try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
            const transcribedText = await SpeechToText(uri);
            await handleSend(transcribedText);
        }
    } catch (error) {
        console.error('Failed to stop recording', error);
    }
    setIsProcessing(false);
  };
  
  const handleMicOrSend = async () => {
      if (input.trim()) {
          handleSend(input);
      } else {
          isRecording ? stopRecording() : startRecording();
      }
  }

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => <MessageBubble message={item} />, []);

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
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.flex}
                contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}}
                inverted
                ListFooterComponent={isProcessing && !input ? <TypingIndicator /> : null}
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
            editable={!isRecording}
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
            {isProcessing && !isRecording ? <ActivityIndicator color={onPrimaryColor as string} /> : (
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


// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    botAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    botName: {
      fontSize: 16,
      fontWeight: '600',
    },
    botStatus: {
      fontSize: 12,
    },
    listContentContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexGrow: 1,
      justifyContent: 'flex-end'
    },
    messageRow: {
      flexDirection: 'row',
      marginVertical: 8,
    },
    messageBubble: {
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: '80%',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderColor: Colors.light.outlineVariant, // Use a static color
    },
    input: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10, // Adjust for multiline
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
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 3,
    },
    emptyStateContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    emptyStateIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center'
    }
});