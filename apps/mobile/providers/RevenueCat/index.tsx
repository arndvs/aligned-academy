import React, { useEffect } from "react";

import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

type RevenueCatProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({
  children,
}: RevenueCatProviderProps): JSX.Element => {
  const appleApiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
  const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

  if (!appleApiKey || !androidApiKey) {
    console.error(
      "appleApiKey or androidApiKey is not set. Ensure that REVENUECAT_APPLE_API_KEY and REVENUECAT_ANDROID_API_KEY is set in your environment variables."
    );
  }

  useEffect(() => {
    async function setupRevenueCat() {
      if (Platform.OS === "ios") {
        Purchases.configure({ apiKey: String(appleApiKey) });
      } else if (Platform.OS === "android") {
        Purchases.configure({ apiKey: String(androidApiKey) });
      }
    }

    setupRevenueCat();
  }, []);

  return <>{children}</>;
};
