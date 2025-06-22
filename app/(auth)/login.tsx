import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function LoginScreen() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useColorScheme() ?? 'light';

  const backgroundColor = useThemeColor({}, 'background');
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
    if (user) {
      router.replace("/(drawer)/explore");
    }
  }, [user]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }), []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    const success = await login(email, password);
    if (success) {
      router.replace("/(drawer)/explore");
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
      color: "white",
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
      <ImageBackground
        source={require("@/assets/images/bg.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={theme === 'light' ? ['#fde4f5c', '#fce3f5cc'] : ['#2c1e3ecc', '#1a1128cc']}
          style={styles.gradient}
        >
          <Animated.View style={[styles.content, animatedStyle]}>
            <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
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
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={buttonTextColor as string} />
              ) : (
                <ThemedText style={styles.buttonText}>Login</ThemedText>
              )}
            </TouchableOpacity>
            <View style={styles.footer}>
              <ThemedText>Don't have an account? </ThemedText>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.link}>Sign Up</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
