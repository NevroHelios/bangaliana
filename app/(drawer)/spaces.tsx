import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useHeaderHeight } from '@react-navigation/elements';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAudioTranscription } from '@/services/api';

async function SpeechToText(audioUri: string): Promise<string> {
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

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
};

const ChatHeader = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  return (
    <View style={[styles.header, { 
      backgroundColor: theme.surface,
      borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    }]}>
      <View style={styles.headerContent}>
        <View style={[styles.botAvatar, { backgroundColor: theme.primary }]}>
          <IconSymbol name="sparkles" size={20} color={theme.onPrimary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.botName, { color: theme.onSurface }]}>Heritage AI</Text>
          <Text style={[styles.botStatus, { color: theme.onSurfaceVariant }]}>Online</Text>
        </View>
      </View>
    </View>
  );
};

const TypingIndicator = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateTyping = () => {
      const createDotAnimation = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        );

      Animated.parallel([
        createDotAnimation(dot1, 0),
        createDotAnimation(dot2, 200),
        createDotAnimation(dot3, 400),
      ]).start();
    };

    animateTyping();
  }, []);

  return (
    <View style={[styles.typingContainer, { backgroundColor: theme.surfaceVariant }]}>
      <View style={styles.typingDots}>
        <Animated.View style={[styles.typingDot, { backgroundColor: theme.onSurfaceVariant, opacity: dot1 }]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: theme.onSurfaceVariant, opacity: dot2 }]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: theme.onSurfaceVariant, opacity: dot3 }]} />
      </View>
    </View>
  );
};

export default function SpacesScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const colorScheme = useColorScheme();
  const micAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerHeight = useHeaderHeight();
  const theme = Colors[colorScheme ?? 'light'];

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnim, { toValue: 1.3, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(micAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      micAnim.setValue(1);
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsProcessing(false);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      setIsRecording(false);
      setRecording(null);
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
      const bengaliUserText = await SpeechToText(uri || '');
      await handleChatSubmission(bengaliUserText);
    } catch (e) {
      console.error('Recording error:', e);
    }
    setIsProcessing(false);
  };

  const handleChatSubmission = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now() + '-user',
      role: 'user',
      text: userText,
    };
    setChat(prev => [...prev, userMsg]);

    const assistantText = await chat_response(userText);
    const assistantMsg: ChatMessage = {
      id: Date.now() + '-assistant',
      role: 'assistant',
      text: assistantText,
    };
    setChat(prev => [...prev, assistantMsg]);
    setStreamingMessageId(assistantMsg.id);

    await getBengaliChatResponse(userText, setChat, assistantMsg.id);

    setChat(prev => {
      const updated = [...prev];
      const index = updated.findIndex(msg => msg.id === assistantMsg.id);
      if (index !== -1) updated[index].isStreaming = false;
      return updated;
    });
    setStreamingMessageId(null);
    Speech.speak(assistantText, { language: 'bn-BD' });
  };

  const handleSendText = async () => {
    if (!textInput.trim()) return;
    setIsProcessing(true);
    await handleChatSubmission(textInput.trim());
    setTextInput('');
    setIsProcessing(false);
  };

  const handleMicPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.messageContainer, { alignItems: isUser ? 'flex-end' : 'flex-start' }]}>
        {!isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
            <IconSymbol name="sparkles" size={14} color={theme.onPrimary} />
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          isUser ? [styles.userBubble, { backgroundColor: theme.primary }] : [styles.assistantBubble, { backgroundColor: theme.surfaceVariant }]
        ]}>
          <Text style={[
            styles.messageText, 
            { color: isUser ? theme.onPrimary : theme.onSurface }
          ]}>
            {item.text}
          </Text>
          {item.isStreaming && (
            <View style={styles.streamingIndicator}>
              <Text style={[styles.cursor, { color: isUser ? theme.onPrimary : theme.onSurface }]}>▌</Text>
            </View>
          )}
        </View>
        {isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: theme.secondary }]}>
            <IconSymbol name="person.fill" size={14} color={theme.onSecondary} />
          </View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyStateIcon, { backgroundColor: theme.surfaceVariant }]}>
        <IconSymbol name="message.fill" size={32} color={theme.onSurfaceVariant} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: theme.onSurface }]}>Start a conversation</Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.onSurfaceVariant }]}>
        Ask me anything about heritage, culture, or history
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ChatHeader />
      
      <View style={styles.container}>
        {chat.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={chat}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            inverted
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={isProcessing && !isRecording ? <TypingIndicator /> : null}
          />
        )}
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={[styles.inputContainer, { 
          backgroundColor: theme.surface,
          borderTopColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }]}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <Animated.View style={[
                styles.recordingPulse, 
                { 
                  backgroundColor: theme.error,
                  transform: [{ scale: pulseAnim }]
                }
              ]} />
              <Text style={[styles.recordingText, { color: theme.error }]}>Recording...</Text>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.surfaceVariant, 
                color: theme.onSurface,
                borderColor: 'transparent',
              }]}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Type your message..."
              placeholderTextColor={theme.onSurfaceVariant}
              onSubmitEditing={handleSendText}
              blurOnSubmit={false}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={isProcessing ? undefined : (textInput ? handleSendText : handleMicPress)}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: isRecording ? theme.error : theme.primary,
                  opacity: pressed || isProcessing ? 0.8 : 1,
                },
              ]}
              disabled={isProcessing}
            >
              {isProcessing && !isRecording ? (
                <ActivityIndicator color={theme.onPrimary} size="small" />
              ) : (
                <Animated.View style={{ transform: [{ scale: micAnim }] }}>
                  <IconSymbol
                    name={textInput ? 'arrow.up' : 'mic.fill'}
                    size={20}
                    color={theme.onPrimary}
                  />
                </Animated.View>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

async function getBengaliChatResponse(
  bengaliUserText: string,
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  id: string
) {
  setChat(prev => {
    const newMessages = [...prev];
    const idx = newMessages.findIndex(msg => msg.id === id);
    if (idx !== -1) {
      newMessages[idx] = {
        ...newMessages[idx],
        isStreaming: true,
      };
    }
    return newMessages;
  });

  await new Promise(res => setTimeout(res, 600));

  setChat(prev => {
    const newMessages = [...prev];
    const idx = newMessages.findIndex(msg => msg.id === id);
    if (idx !== -1) {
      newMessages[idx] = {
        ...newMessages[idx],
        isStreaming: false,
      };
    }
    return newMessages;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
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
  headerInfo: {
    flex: 1,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  botStatus: {
    fontSize: 12,
    marginTop: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '85%',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    fontSize: 14,
    marginLeft: 2,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderBottomLeftRadius: 6,
    marginLeft: 52,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  recordingPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    lineHeight: 20,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});