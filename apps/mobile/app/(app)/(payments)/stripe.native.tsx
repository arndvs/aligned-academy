import { Text, View, useThemeColor } from "@/components/Themed";
import i18n, { CURRENCY_MAP } from "@/i18n";
import {
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  initPaymentSheet,
  isPlatformPaySupported,
  presentPaymentSheet,
} from "@/providers/Stripe/functions";
import { createPaymentIntentClientSecret } from "@/services/stripe";
import { commonStyles } from "@/styles/common";
import { typography } from "@/styles/typography";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

const stripeLogo = require("../../../assets/images/stripe.png");

interface StripeError {
  code?: string;
  message?: string;
  localizedMessage?: string;
}
type ConfirmResult = { error?: StripeError };

type StripePaymentIntentResponse = {
  customer: string | null;
  clientSecret: string | null;
  error?: StripeError;
};


export default function StripeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const checkoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const platformPayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [enteredAmount, setEnteredAmount] = useState<number | null>(null);
  const [isAppleOrGooglePaySupported, setIsAppleOrGooglePaySupported] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const [isPlatformLoading, setIsPlatformLoading] = useState(false);

  // Get theme colors
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
    { light: "#8E8E93", dark: "#666666" },
    "text"
  );
  const dividerColor = useThemeColor(
    { light: "#E5E5EA", dark: "#333333" },
    "text"
  );

  const currentLocale = i18n.language;
  const { currency, symbol } =
    CURRENCY_MAP[currentLocale] || CURRENCY_MAP["en-US"];

    const toMessage = (e: unknown) =>
      (e as StripeError)?.localizedMessage ||
      (e as StripeError)?.message ||
      (typeof e === "string" ? e : "Unexpected error");

  useEffect(() => {
    return () => {
      if (checkoutTimeoutRef.current) {
        clearTimeout(checkoutTimeoutRef.current);
      }
      if (platformPayTimeoutRef.current) {
        clearTimeout(platformPayTimeoutRef.current);
      }
    };
  }, []);

  const onCheckout = async (): Promise<void> => {
    setIsLoading(true);

    if (!enteredAmount) {
      return;
    }

    const controller = new AbortController();
    if (checkoutTimeoutRef.current) {
      clearTimeout(checkoutTimeoutRef.current);
    }
    checkoutTimeoutRef.current = setTimeout(() => controller.abort(), 30000);

    try {
      const requestBody = {
        amount: Number(Number(enteredAmount * 100).toFixed(2)),
        currency,
      };

      const response = await Promise.race<StripePaymentIntentResponse>([
        createPaymentIntentClientSecret(requestBody),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject({
                code: "STRIPE_TIMEOUT",
                message: t("payments.stripe.screen.errors.timeout.payment"),
              }),
            30_000
          )
        ),
      ]);
      const { customer, clientSecret } = response;

      if (!customer || !clientSecret) {
        throw new Error(t("payments.stripe.screen.errors.client_secret"));
      }

      const paymentSheetConfig = {
        merchantDisplayName: t("payments.stripe.screen.merchant.name"),
        customerId: customer,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: t("payments.stripe.screen.merchant.default_name"),
        },
        returnURL: "com.launchtoday://stripe-redirect",
      };

      const { error: initPaymentSheetError } = (await Promise.race([
        initPaymentSheet(paymentSheetConfig),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject({
                code: "STRIPE_TIMEOUT",
                message: t("payments.stripe.screen.errors.timeout.sheet_init"),
              }),
            30000
          )
        ),
      ])) as { error?: StripeError };

      if (initPaymentSheetError) {
        Alert.alert(
          t("payments.stripe.screen.errors.payment_sheet_init"),
          t("payments.stripe.screen.errors.try_again")
        );

        console.error(
          `Error initiating Stripe payment sheet - ${
            initPaymentSheetError.message || ""
          }`
        );

        throw new Error(
          initPaymentSheetError.message || "Payment sheet initialization failed"
        );
      }

      // Clear timeout before presenting payment sheet to prevent automatic error
      if (checkoutTimeoutRef.current) {
        clearTimeout(checkoutTimeoutRef.current);
        checkoutTimeoutRef.current = null;
      }

      // Use a variable to track the internal timeout
      let presentationTimeoutId: ReturnType<typeof setTimeout> | undefined;

      const presentResult = (await presentPaymentSheet()) as { error?: StripeError } | void;
      const error = (presentResult && 'error' in presentResult) ? presentResult.error : undefined;

      // Clear the internal timeout when we get a response (success or error)
      if (presentationTimeoutId) {
        clearTimeout(presentationTimeoutId);
      }

      if (error) {
        if (error.code === "Canceled") {
          return;
        }

        throw new Error(
          error.localizedMessage || "Payment presentation failed"
        );
      }

      setEnteredAmount(null);

      Alert.alert(
        t("payments.stripe.screen.alerts.success.title"),
        t("payments.stripe.screen.alerts.success.message")
      );
    } catch (error) {
      const err = error as Error;
      Alert.alert(
        t("payments.stripe.screen.alerts.error.title"),
        err.message || t("payments.stripe.screen.alerts.error.message")
      );
    } finally {
      if (checkoutTimeoutRef.current) {
        clearTimeout(checkoutTimeoutRef.current);
        checkoutTimeoutRef.current = null;
      }
      setIsLoading(false);
    }
  };

  const pay = async () => {
    setIsPlatformLoading(true);
    const controller = new AbortController();
    if (platformPayTimeoutRef.current) {
      clearTimeout(platformPayTimeoutRef.current);
    }
    platformPayTimeoutRef.current = setTimeout(() => controller.abort(), 30000);

    try {
      const { clientSecret } = await Promise.race<StripePaymentIntentResponse>([
        createPaymentIntentClientSecret({
          amount: Math.round(Number(enteredAmount) * 100),
          currency,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject({
                code: "STRIPE_TIMEOUT",
                message: t("payments.stripe.screen.errors.timeout.payment"),
              }),
            30_000
          )
        ),
      ]);

      if (!clientSecret) {
        throw new Error(t("payments.stripe.screen.errors.client_secret"));
      }


      // Clear timeout before confirming platform pay to prevent automatic error
      if (platformPayTimeoutRef.current) {
        clearTimeout(platformPayTimeoutRef.current);
        platformPayTimeoutRef.current = null;
      }

      // Use a variable to track the internal timeout
      let platformPayTimeoutId: ReturnType<typeof setTimeout> | undefined;

      const { error } = await Promise.race<ConfirmResult>([
        confirmPlatformPayPayment(clientSecret, {
          applePay: {
            cartItems: [
              {
                label: t("payments.stripe.screen.amount_label"),
                amount: String(Number(enteredAmount)),
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
            merchantCountryCode: "GB",
            currencyCode: "GBP",
            requiredShippingAddressFields: [
              PlatformPay.ContactField.PostalAddress,
            ],
            requiredBillingContactFields: [
              PlatformPay.ContactField.PhoneNumber,
            ],
          },
          googlePay: {
            testEnv: true,
            merchantName: "merchant.com.launchtodayhq.launchtoday",
            merchantCountryCode: "GB",
            currencyCode: "GBP",
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Full,
              isPhoneNumberRequired: true,
              isRequired: true,
            },
          },
        }),
        new Promise<never>((_, reject) => {
          platformPayTimeoutId = setTimeout(
            () =>
              reject({
                code: "STRIPE_TIMEOUT",
                message: t("payments.stripe.screen.errors.timeout.platform_pay"),
              }),
            30_000
          );
        }),
      ]);

      // Clear the internal timeout when we get a response (success or error)
      if (platformPayTimeoutId) {
        clearTimeout(platformPayTimeoutId);
      }

      if (error) {
        if (error.code === "Canceled") {
          return;
        }

        console.error(t("payments.stripe.screen.errors.apple_pay"));

        Alert.alert(
          t("payments.stripe.screen.errors.purchase_error"),
          t("payments.stripe.screen.errors.try_again")
        );

        throw new Error(toMessage(error));
      } else {
        setEnteredAmount(null);

        Alert.alert(
          t("payments.stripe.screen.alerts.success.title"),
          t("payments.stripe.screen.alerts.success.message")
        );
      }
    } catch (error) {
      console.error(t("payments.stripe.screen.errors.internal_error"), error);

      Alert.alert(
        t("payments.stripe.screen.errors.purchase_error"),
        t("payments.stripe.screen.errors.try_again")
      );

      throw new Error(toMessage(error));
    } finally {
      if (platformPayTimeoutRef.current) {
        clearTimeout(platformPayTimeoutRef.current);
        platformPayTimeoutRef.current = null;
      }
      setIsPlatformLoading(false);
    }
  };

  useEffect(() => {
    (async function () {
      const isSupported = await isPlatformPaySupported({
        googlePay: { testEnv: true },
      });

      setIsAppleOrGooglePaySupported(isSupported);
    })();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Stack.Screen
        options={{
          title: t("payments.stripe.screen.title"),
          headerTitle: t("payments.stripe.screen.title"),
          headerBackTitle: t("drawer.payments"),
        }}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS === "android" &&
                styles.androidScrollContentWithKeyboard,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Image
                  style={styles.stripeLogo}
                  source={stripeLogo}
                  contentFit="cover"
                  transition={1000}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>
                    {t("payments.stripe.screen.title")}
                  </Text>
                  <Text style={[styles.subtitle, { color: placeholderColor }]}>
                    {t("payments.stripe.screen.subtitle")}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.optionsCard,
                  { backgroundColor: cardBackgroundColor, borderColor },
                ]}
              >
                <Text style={[styles.label, { color: textColor }]}>
                  {t("payments.stripe.screen.amount_label")}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: inputBackgroundColor, borderColor },
                  ]}
                >
                  <Text style={[styles.dollarSign, { color: textColor }]}>
                    {symbol}
                  </Text>
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: textColor }]}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={placeholderColor}
                    value={enteredAmount?.toString() || ""}
                    onChangeText={(text) => {
                      if (text === "" || /^\d*\.?\d{0,2}$/.test(text)) {
                        setEnteredAmount(text === "" ? null : Number(text));
                      }
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.payButton,
                    styles.elevatedButton,
                    (!Number(enteredAmount) ||
                      isPlatformLoading ||
                      isLoading) &&
                      styles.disabledButton,
                  ]}
                  onPress={onCheckout}
                  disabled={
                    !Number(enteredAmount) || isPlatformLoading || isLoading
                  }
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.payButtonText}>
                      {t("payments.stripe.screen.pay_with_stripe")}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: dividerColor, opacity: 0.5 },
                    ]}
                  />
                  <Text
                    style={[styles.dividerText, { color: placeholderColor }]}
                  >
                    {t("payments.stripe.screen.or")}
                  </Text>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: dividerColor, opacity: 0.5 },
                    ]}
                  />
                </View>

                {isPlatformLoading ? (
                  <ActivityIndicator />
                ) : (
                  isAppleOrGooglePaySupported && (
                    <PlatformPayButton
                      disabled={!enteredAmount || isLoading}
                      onPress={pay}
                      type={PlatformPay.ButtonType.Pay}
                      appearance={
                        backgroundColor === "white"
                          ? PlatformPay.ButtonStyle.Black
                          : PlatformPay.ButtonStyle.Automatic
                      }
                      borderRadius={12}
                      style={{
                        width: "100%",
                        height: 50,
                      }}
                    />
                  )
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: responsiveWidth(20),
    flexGrow: 1,
  },
  androidScrollContentWithKeyboard: {
    paddingBottom: responsiveHeight(130),
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: responsiveHeight(30),
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: responsiveHeight(15),
  },
  title: {
    ...typography.title,
    fontSize: responsiveFontSize(28),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: responsiveHeight(10),
  },
  subtitle: {
    ...typography.body,
    fontSize: responsiveFontSize(14),
    lineHeight: responsiveHeight(20),
    textAlign: "center",
    paddingHorizontal: responsiveWidth(20),
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    height: responsiveHeight(50),
    marginBottom: responsiveHeight(15),
  },
  label: {
    ...typography.subtitle,
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    marginBottom: responsiveHeight(10),
  },
  dollarSign: {
    ...typography.body,
    fontSize: responsiveFontSize(16),
    paddingLeft: responsiveWidth(10),
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: responsiveWidth(10),
    fontSize: responsiveFontSize(16),
  },
  stripeLogo: {
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: 15,
  },
  platformPayButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  divider: {
    width: "40%",
    height: 1.5,
    borderRadius: 10,
    color: "white ",
  },
  payButton: {
    backgroundColor: "#635BFF",
    padding: responsiveHeight(15),
    borderRadius: 12,
    alignItems: "center",
    marginBottom: responsiveHeight(10),
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
  disabledButton: {
    opacity: 0.5,
  },
  payButtonText: {
    color: "white",
    fontSize: responsiveFontSize(16),
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: responsiveHeight(15),
    paddingHorizontal: responsiveWidth(10),
    backgroundColor: "transparent",
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.body,
    marginHorizontal: responsiveWidth(15),
    fontSize: responsiveFontSize(14),
  },
});
