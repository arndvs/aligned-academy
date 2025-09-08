import { Stack, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { typography } from "@/styles/typography";
import { responsiveHeight, responsiveWidth } from "@/utils/responsive";
import { router } from "expo-router";
import { useAnimatedText } from "@/hooks/useAnimatedText";
import { animationConfig } from "@/styles/common";
import Animated from "react-native-reanimated";
import { useTranslation } from "react-i18next";

export default function ErrorScreen() {
  const params = useLocalSearchParams<{
    title: string;
    message: string;
    action: "retry" | "login" | "back" | "home";
  }>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const { t } = useTranslation();

  const contentAnimatedStyle = useAnimatedText({
    delay: animationConfig.contentDelay,
  });

  const buttonAnimatedStyle = useAnimatedText({
    delay: animationConfig.buttonDelay,
  });

  const handleAction = () => {
    // Only handle navigation if we have explicit error params
    if (!params.action) {
      router.replace("/(app)/dashboard");
      return;
    }

    switch (params.action) {
      case "retry":
      case "back":
        router.replace("/(app)/dashboard");
        break;
      case "login":
        router.replace("/sign-in");
        break;
      case "home":
      default:
        router.replace("/(app)/dashboard");
    }
  };

  const getActionButtonText = () => {
    switch (params.action) {
      case "retry":
        return t("errors.actions.retry");
      case "login":
        return t("errors.actions.login");
      case "back":
        return t("errors.actions.back");
      case "home":
      default:
        return t("errors.actions.home");
    }
  };

  // Show 404 content if no error params are present
  const isNotFound = !params.title && !params.message && !params.action;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000000" : "#ffffff" },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <Animated.View style={contentAnimatedStyle}>
          <Text style={[styles.title, { color: textColor }]}>
            {isNotFound
              ? t("errors.not_found.title")
              : t(params.title || "errors.titles.default")}
          </Text>
          <Text
            style={[
              styles.message,
              { color: isDarkMode ? "#666666" : "#666666" },
            ]}
          >
            {isNotFound
              ? t("errors.not_found.message")
              : t(params.message || "errors.messages.default")}
          </Text>
        </Animated.View>
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isDarkMode ? "#ffffff" : "#000000" },
            ]}
            onPress={handleAction}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isDarkMode ? "#000000" : "#ffffff" },
              ]}
            >
              {isNotFound ? t("errors.actions.home") : getActionButtonText()}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(20),
  },
  title: {
    ...typography.title,
    fontSize: responsiveWidth(32),
    marginBottom: responsiveHeight(10),
    textAlign: "center",
  },
  message: {
    ...typography.body,
    fontSize: responsiveWidth(16),
    textAlign: "center",
    marginBottom: responsiveHeight(30),
    maxWidth: "80%",
  },
  button: {
    padding: responsiveHeight(15),
    paddingHorizontal: responsiveWidth(30),
    borderRadius: 12,
    alignItems: "center",
    marginTop: responsiveHeight(10),
  },
  buttonText: {
    ...typography.buttonText,
    fontSize: responsiveWidth(16),
  },
});
