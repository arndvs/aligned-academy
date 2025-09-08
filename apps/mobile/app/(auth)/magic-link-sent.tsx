import { useAnimatedText } from "@/hooks/useAnimatedText";
import { animationConfig } from "@/styles/common";
import { typography } from "@/styles/typography";
import { responsiveHeight, responsiveWidth } from "@/utils/responsive";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from "react-native";
import { openInbox } from "react-native-email-link";
import Animated from "react-native-reanimated";
import { useTranslation } from "react-i18next";

export default function MagicLinkSentScreen() {
  const { email } = useLocalSearchParams();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const contentAnimatedStyle = useAnimatedText({
    delay: animationConfig.contentDelay,
  });
  const buttonAnimatedStyle = useAnimatedText({
    delay: animationConfig.buttonDelay,
  });

  const handleOpenEmail = () => {
    openInbox();
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <Text style={[styles.title, isDark && styles.darkText]}>
          {t("auth.magic_link.title")}
        </Text>
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
          {t("auth.magic_link.sent_to")}
        </Text>
        <Text style={[styles.email, isDark && { color: "#000000" }]}>{email}</Text>
        <Text style={[styles.description, isDark && styles.darkSubtext]}>
          {t("auth.magic_link.description")}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.button, isDark && styles.darkButton]}
          onPress={handleOpenEmail}
        >
          <Text style={[styles.buttonText, isDark && styles.darkButtonText]}>
            {t("auth.magic_link.open_email")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Platform.OS === 'android' ? responsiveWidth(24) : 0,
  },
  title: {
    ...typography.title,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: responsiveHeight(16),
    textAlign: "center",
    color: "#000000",
  },
  darkText: {
    color: "#ffffff",
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 18,
    marginBottom: responsiveHeight(8),
    color: "#666666",
    textAlign: "center",
  },
  darkSubtext: {
    color: "#888888",
  },
  email: {
    ...typography.body,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: responsiveHeight(24),
    color: "#000000",
    textAlign: "center",
    paddingHorizontal: responsiveWidth(20),
    paddingVertical: responsiveHeight(12),
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
  },
  description: {
    ...typography.subtitle,
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: responsiveWidth(24),
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: responsiveHeight(16),
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkButton: {
    backgroundColor: "#ffffff",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "GeistSemiBold",
  },
  darkButtonText: {
    color: "#000000",
  },
});
