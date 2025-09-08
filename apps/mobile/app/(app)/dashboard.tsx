import React, { useRef, useEffect } from "react";
import { Text, View, useThemeColor } from "@/components/Themed";
import { Stack } from "expo-router";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "../../utils/responsive";
import { typography } from "../../styles/typography";
import { ScrollView } from "react-native-gesture-handler";
import ImageCarousel from "@/components/ImageCarousel";
import { StyleSheet, Animated, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = "#000000";

  // Add animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("dashboard.screen_title"),
          headerTitle: t("dashboard.screen_title"),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ImageCarousel />
              <Text style={[styles.title, isDark && styles.darkText]}>
                {t("dashboard.welcome_title")}
              </Text>
              <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
                {t("dashboard.subtitle")}
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={[styles.featureCard, isDark && styles.darkCard]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="flash" size={24} color={iconColor} />
                </View>
                <Text style={[styles.featureTitle, isDark && styles.darkText]}>
                  {t("dashboard.quick_start.title")}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    isDark && styles.darkSubtext,
                  ]}
                >
                  {t("dashboard.quick_start.description")}
                </Text>
              </View>

              <View style={[styles.featureCard, isDark && styles.darkCard]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="construct" size={24} color={iconColor} />
                </View>
                <Text style={[styles.featureTitle, isDark && styles.darkText]}>
                  {t("dashboard.latest_tools.title")}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    isDark && styles.darkSubtext,
                  ]}
                >
                  {t("dashboard.latest_tools.description")}
                </Text>
              </View>

              <View style={[styles.featureCard, isDark && styles.darkCard]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people-sharp" size={24} color={iconColor} />
                </View>
                <Text style={[styles.featureTitle, isDark && styles.darkText]}>
                  {t("dashboard.support.title")}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    isDark && styles.darkSubtext,
                  ]}
                >
                  {t("dashboard.support.description")}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: responsiveWidth(20),
    paddingTop: responsiveHeight(20),
    paddingBottom: responsiveHeight(30),
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    ...typography.title,
    fontSize: responsiveFontSize(28),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: responsiveHeight(20),
    marginBottom: responsiveHeight(10),
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: responsiveFontSize(14),
    textAlign: "center",
    opacity: 0.6,
    lineHeight: responsiveHeight(20),
    paddingHorizontal: responsiveWidth(10),
  },
  featuresContainer: {
    padding: responsiveWidth(16),
  },
  featureCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: responsiveWidth(20),
    marginBottom: responsiveHeight(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#1a1a1a",
  },
  iconContainer: {
    width: responsiveWidth(40),
    height: responsiveWidth(40),
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    ...typography.body,
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    marginBottom: responsiveHeight(8),
    fontFamily: "GeistSemiBold",
  },
  featureDescription: {
    ...typography.body,
    fontSize: responsiveFontSize(14),
    opacity: 0.6,
    lineHeight: responsiveHeight(20),
  },
  darkText: {
    color: "#fff",
  },
  darkSubtext: {
    color: "rgba(255,255,255,0.7)",
  },
});
