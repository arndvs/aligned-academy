import { useSession } from "@/providers/Auth";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from "react-native";

export default function EmailInputScreen() {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const { signInWithEmail } = useSession();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Dynamic colors based on theme
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBackgroundColor = isDarkMode ? "#1c1c1c" : "#FFFFFF";
  const inputBorderColor = isDarkMode ? "#333333" : "#E5E5EA";
  const placeholderColor = isDarkMode ? "#666666" : "#A0A0A0";
  const buttonColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const disabledButtonColor = isDarkMode ? "#555555" : "#A0A0A0";

  useEffect(() => {
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  }, []);

  function validateEmail(email: string) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  function handleEmailChange(text: string) {
    setEmail(text);
    setIsEmailValid(validateEmail(text));
  }

  async function handleContinue() {
    setIsLoading(true);

    try {
      signInWithEmail(email);
      router.push({
        pathname: "/magic-link-sent",
        params: { email },
      });
    } catch (error: any) {
      console.error("Error sending magic link:", error);
    }

    setIsLoading(false);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: textColor }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>
            {t("auth.email_input.title")}
          </Text>
          <TextInput
            ref={emailInputRef}
            style={[
              styles.input,
              {
                backgroundColor: inputBackgroundColor,
                borderColor: inputBorderColor,
                color: textColor,
              },
            ]}
            placeholder={t("auth.email_input.placeholder")}
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleContinue}
            editable={!isLoading}
          />
        </View>

        <View
          style={[
            styles.buttonContainer,
            Platform.OS === "android" && styles.androidButtonContainer,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: buttonColor },
              (!isEmailValid || isLoading) && [
                styles.disabledButton,
                { backgroundColor: disabledButtonColor },
              ],
            ]}
            onPress={handleContinue}
            disabled={!isEmailValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={buttonTextColor} size="small" />
            ) : (
              <Text
                style={[styles.continueButtonText, { color: buttonTextColor }]}
              >
                {t("auth.email_input.continue")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    padding: responsiveWidth(5),
  },
  backButtonText: {
    fontSize: responsiveFontSize(24),
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(20),
    paddingTop: responsiveHeight(20),
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: "bold",
    marginBottom: responsiveHeight(20),
  },
  input: {
    borderWidth: 1,
    borderRadius: responsiveWidth(8),
    padding: responsiveHeight(16),
    fontSize: responsiveFontSize(16),
  },
  buttonContainer: {
    paddingHorizontal: responsiveWidth(20),
    paddingVertical: responsiveWidth(10),
  },
  androidButtonContainer: {
    paddingBottom: responsiveHeight(40), // Add extra padding for Android
  },
  continueButton: {
    padding: responsiveHeight(12),
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
