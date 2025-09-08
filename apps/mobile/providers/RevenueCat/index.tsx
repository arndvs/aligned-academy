import React, { useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

type RevenueCatProviderProps = {
  children: ReactNode;
};

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ children }) => {
  const appleApiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
  const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

  if (!appleApiKey || !androidApiKey) {
    console.error(
      "appleApiKey or androidApiKey is not set. Ensure that EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY and EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY are set."
    );
  }

  useEffect(() => {
    // Configure once on mount (or when keys/platform change)
    if (Platform.OS === "ios" && appleApiKey) {
      Purchases.configure({ apiKey: appleApiKey });
    } else if (Platform.OS === "android" && androidApiKey) {
      Purchases.configure({ apiKey: androidApiKey });
    }
  }, [appleApiKey, androidApiKey]);


  return children as React.ReactElement | null;
};
