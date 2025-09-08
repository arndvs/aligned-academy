import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import { typography } from "@/styles/typography";
import { Text, View, useThemeColor } from "@/components/Themed";
import { Image } from "expo-image";
import { ErrorCode } from "@/services/error/types";
import { ErrorService } from "@/services/error/ErrorService";
import Purchases, { CustomerInfo } from "react-native-purchases";
import {
  getNamedPackage,
  useRevenueCatSubscriptionStatus,
} from "@/src/hooks/useRevenueCat";
import RevenueCatUI from "react-native-purchases-ui";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";

const revenueCatLogo = require("../../../assets/images/revenuecat.png");

export default function RevenueCatScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasingItem, setIsPurchasingItem] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBackgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1c1c1c" },
    "background"
  );
  const inputBackgroundColor = useThemeColor(
    { light: "#f8f8f8", dark: "#2c2c2c" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#e0e0e0", dark: "#333333" },
    "text"
  );
  const placeholderColor = useThemeColor(
    { light: "#666666", dark: "#888888" },
    "text"
  );

  const { subscriptionStatus, checkSubscriptionStatus, currentOfferring } =
    useRevenueCatSubscriptionStatus();

  const isSubscribed = subscriptionStatus === "Active";

  const singleItemPackage = currentOfferring
    ? getNamedPackage({
        currentOfferring,
        packageIdentifier: "Launchtoday Single Item",
      })
    : null;

  async function presentPaywallIfNeeded() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      setIsLoading(true);

      const paywallResult = await Promise.race([
        RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "Launchtoday Plus",
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject({
                code: ErrorCode.REVENUECAT_PAYWALL_ERROR,
                message: "Paywall presentation timed out. Please try again.",
              }),
            20000
          )
        ),
      ]);

      clearTimeout(timeoutId);

      if (paywallResult === "NOT_PRESENTED") {
        return Alert.alert(
          t("payments.revenuecat.screen.alerts.already_subscribed.title"),
          t("payments.revenuecat.screen.alerts.already_subscribed.message")
        );
      }

      await checkSubscriptionStatus();
    } catch (error) {
      ErrorService.handleError(
        {
          code: ErrorCode.REVENUECAT_PAYWALL_ERROR,
          message: "Failed to present paywall",
          originalError: error,
        },
        "presentPaywallIfNeeded"
      );
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  const handlePurchase = async () => {
    setIsPurchasingItem(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      if (!singleItemPackage) {
        throw {
          code: ErrorCode.REVENUECAT_PACKAGE_UNAVAILABLE,
          message: "Package is not available",
        };
      }

      await Promise.race([
        Purchases.purchasePackage(singleItemPackage),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject({
                code: ErrorCode.REVENUECAT_PURCHASE_FAILED,
                message: "Purchase request timed out. Please try again.",
              }),
            30000
          )
        ),
      ]);

      clearTimeout(timeoutId);

      await checkSubscriptionStatus();

      Alert.alert(
        t("payments.revenuecat.screen.alerts.success.title"),
        t("payments.revenuecat.screen.alerts.success.message")
      );
    } catch (error: any) {
      if (error.message === "Purchase was cancelled.") {
        return;
      }

      ErrorService.handleError(
        {
          code: ErrorCode.REVENUECAT_PURCHASE_FAILED,
          message: "Purchase failed",
          originalError: error,
        },
        "handlePurchase"
      );
    } finally {
      clearTimeout(timeoutId);
      setIsPurchasingItem(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: t("payments.revenuecat.screen.title"),
          headerTitle: t("payments.revenuecat.screen.title"),
          headerBackTitle: t("drawer.payments"),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.contentContainer,
              { backgroundColor: "transparent" },
            ]}
          >
            <View
              style={[
                styles.headerContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <Image source={revenueCatLogo} style={styles.image} />
              <View
                style={[
                  styles.headerTextContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Text style={[styles.title, { color: textColor }]}>
                  {t("payments.revenuecat.screen.integration_title")}
                </Text>
                <Text style={[styles.subtitle, { color: placeholderColor }]}>
                  {t("payments.revenuecat.screen.subtitle")}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.optionsCard,
                { backgroundColor: cardBackgroundColor, borderColor },
              ]}
            >
              <TouchableOpacity
                disabled={isPurchasingItem}
                style={[
                  styles.optionButton,
                  styles.elevatedButton,
                  { backgroundColor: inputBackgroundColor },
                ]}
                onPress={handlePurchase}
              >
                {isPurchasingItem ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={textColor} />
                  </View>
                ) : (
                  <>
                    <Text
                      style={[styles.optionButtonText, { color: textColor }]}
                    >
                      {t("payments.revenuecat.screen.purchase_single_item")}
                    </Text>
                    <Text style={styles.optionPrice}>
                      {singleItemPackage?.product.priceString || ""}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  styles.elevatedButton,
                  isSubscribed && styles.disabledButton,
                ]}
                onPress={presentPaywallIfNeeded}
                disabled={isSubscribed || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    {isSubscribed
                      ? t("payments.revenuecat.screen.already_subscribed")
                      : t("payments.revenuecat.screen.subscribe_button")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: responsiveWidth(20),
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingBottom: responsiveHeight(20),
  },
  headerTextContainer: {
    alignItems: "center",
    paddingHorizontal: responsiveWidth(24),
  },
  image: {
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: 16,
    marginBottom: responsiveHeight(16),
  },
  title: {
    ...typography.title,
    fontSize: responsiveFontSize(24),
    fontWeight: "700",
    marginBottom: responsiveHeight(12),
    textAlign: "center",
  },
  revenuecatLogo: {
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: 15,
  },
  subtitle: {
    ...typography.body,
    fontSize: responsiveFontSize(15),
    lineHeight: responsiveHeight(22),
    textAlign: "center",
    maxWidth: responsiveWidth(300),
    letterSpacing: 0.2,
  },
  optionsCard: {
    borderRadius: 15,
    padding: responsiveWidth(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
    borderWidth: 1,
  },
  elevatedButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: responsiveHeight(15),
    borderRadius: 12,
    marginBottom: responsiveHeight(15),
  },
  subscribeButton: {
    backgroundColor: "#007AFF",
    padding: responsiveHeight(15),
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#888888",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: responsiveFontSize(16),
    fontFamily: "GeistSemiBold",
  },
  optionButtonText: {
    ...typography.body,
    fontSize: responsiveFontSize(16),
    fontFamily: "GeistSemiBold",
  },
  optionPrice: {
    ...typography.body,
    fontSize: responsiveFontSize(16),
    color: "#4CAF50",
    fontWeight: "bold",
    fontFamily: "GeistBold",
  },
});
