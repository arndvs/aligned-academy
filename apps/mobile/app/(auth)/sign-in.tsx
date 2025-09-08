import React, { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/SafeAreaView";
import { Text } from "@/components/Themed";
import { useAnimatedText } from "@/hooks/useAnimatedText";
import { animationConfig, commonStyles } from "@/styles/common";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useSession } from "@/providers/Auth";
import { openBrowserAsync } from "expo-web-browser";
import { Email, Google } from "@/assets/icons";
import Animated, {
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Localization from "expo-localization";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const { t, i18n } = useTranslation();

  const titleAnimatedStyle = useAnimatedText({
    delay: animationConfig.contentDelay,
  });

  const buttonContainerAnimatedStyle = useAnimatedText({
    delay: animationConfig.buttonDelay,
  });

  const { signInWithApple, signInWithGoogle } = useSession();

  useEffect(() => {
    AsyncStorage.removeItem("@app_language").then(() => {
      // Force reload i18n with device locale
      const deviceLocale = Localization.locale;
      const languageCode = deviceLocale.split("-")[0];
      i18n.changeLanguage(languageCode);
    });

    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isLayoutReady ? 1 : 0, { duration: 300 }),
  }));

  async function handlePrivacyPolicyPress() {
    try {
      await openBrowserAsync(
        "https://general-princess-ae4.notion.site/Launchtoday-Privacy-Policy-12b1abb667b7805882b4eebbe8d8ab1a",
        {}
      );
    } catch (error) {
      console.error("Failed to open privacy policy:", error);
    }
  }

  return (
    <Animated.View
      style={[
        styles.safeContainer,
        containerAnimatedStyle,
        { backgroundColor: isDarkMode ? "#000000" : "#ffffff" },
      ]}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? "#000000" : "#ffffff" },
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            titleAnimatedStyle,
            { minHeight: responsiveHeight(20) },
          ]}
        >
          <Text style={[styles.title, { color: textColor }]}>
            {t("auth.title")}
          </Text>
          <Text
            style={[
              commonStyles.customFontItalic,
              styles.subtitle,
              { color: textColor },
            ]}
          >
            {t("auth.title_emphasis")}
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.buttonContainer, buttonContainerAnimatedStyle]}
        >
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              isDarkMode
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={5}
            style={styles.button}
            onPress={() => signInWithApple(() => {})}
          />

          <Pressable
            style={({ pressed }) => [
              commonStyles.customButton,
              {
                backgroundColor: isDarkMode ? "#1c1c1c" : "#f8f8f8",
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: "#333333",
              },
              isLoading && commonStyles.disabledButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => {
              setIsLoading(true);
              signInWithGoogle(() => setIsLoading(false));
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={textColor} />
            ) : (
              <>
                <Google style={commonStyles.buttonIcon} />
                <Text style={[commonStyles.buttonText, { color: textColor }]}>
                  {t("auth.continue_with_google")}
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              commonStyles.customButton,
              {
                backgroundColor: isDarkMode ? "#1c1c1c" : "#f8f8f8",
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: "#333333",
              },
              isLoading && commonStyles.disabledButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push("/email-input")}
          >
            <Email style={commonStyles.buttonIcon} color={textColor} />
            <Text style={[commonStyles.buttonText, { color: textColor }]}>
              {t("auth.continue_with_email")}
            </Text>
          </Pressable>

          <Text style={[styles.termsText, { color: textColor, opacity: 0.6 }]}>
            {t("auth.privacy_policy_agreement")}{" "}
            <Text
              onPress={handlePrivacyPolicyPress}
              style={[styles.privacyLink, { color: "#007AFF", opacity: 1 }]}
            >
              {t("auth.privacy_policy_link")}
            </Text>
          </Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    ...commonStyles.container,
    justifyContent: "space-between",
  },
  content: {
    paddingHorizontal: responsiveWidth(20),
    position: "relative",
  },
  title: {
    fontFamily: "GeistSemiBold",
    fontSize: responsiveFontSize(42),
    fontWeight: "bold",
    lineHeight: responsiveFontSize(50),
  },
  subtitle: {
    fontSize: responsiveFontSize(42),
    paddingLeft: responsiveHeight(5),
  },
  buttonContainer: commonStyles.buttonContainer,
  button: {
    width: "100%",
    height: responsiveHeight(50),
    marginBottom: responsiveHeight(12),
  },
  termsText: {
    fontSize: responsiveFontSize(12),
    textAlign: "center",
  },
  privacyLink: {
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  pressedButton: {
    opacity: 0.7,
  },
});
