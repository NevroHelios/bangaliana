import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function SignupScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const inputBackgroundColor = useThemeColor({}, 'inputBackgroundGlass');
  const inputBorderColor = useThemeColor({}, 'inputBorderGlass');
  const placeholderTextColor = useThemeColor({}, 'placeholderGlass');
  const buttonColor = useThemeColor({}, 'primary');
  const buttonTextColor = useThemeColor({}, 'onPrimary');
  const textColor = useThemeColor({}, 'onBackground');
  const linkColor = useThemeColor({}, 'primary');

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }), []);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        router.replace("/(drawer)/explore");
      }
    } catch (e) {
      const error = e as Error;
      console.log("Signup failed on screen:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    content: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    title: {
      textAlign: 'center',
      marginBottom: 32,
      fontSize: 32,
      fontWeight: 'bold',
      color: textColor as string,
    },
    input: {
      height: 55,
      borderRadius: 12,
      paddingHorizontal: 20,
      marginBottom: 15,
      backgroundColor: inputBackgroundColor as string,
      fontSize: 16,
      color: textColor as string,
      borderWidth: 1,
      borderColor: inputBorderColor as string,
    },
    button: {
      backgroundColor: buttonColor as string,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      height: 55,
      shadowColor: buttonColor as string,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    buttonText: {
      color: buttonTextColor as string,
      fontSize: 18,
      fontWeight: "600",
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    link: {
      color: linkColor as string,
      fontWeight: 'bold',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={theme === 'light' ? ['#fde4f5', '#fce3f5'] : ['#2c1e3e', '#1a1128']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor={placeholderTextColor as string}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={placeholderTextColor as string}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={placeholderTextColor as string}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={buttonTextColor as string} />
            ) : (
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            )}
          </TouchableOpacity>
          <View style={styles.footer}>
            <ThemedText>Already have an account? </ThemedText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.link}>Log In</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
