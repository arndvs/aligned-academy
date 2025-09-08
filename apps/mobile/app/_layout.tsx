import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useMemo } from "react";
import "react-native-reanimated";
import { View } from "react-native";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useColorScheme } from "@/components/useColorScheme";
import { SessionProvider, useSession } from "@/providers/Auth";
import { delay } from "@/utils";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinkingOptions } from "@react-navigation/native";
import StripeProvider from "@/providers/Stripe";
import { RevenueCatProvider } from "@/providers/RevenueCat";
import "@/i18n";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    async function handleNavigation() {
      if (isLoading) return;

      const inAppGroup = segments[0] === "(app)";
      const isErrorScreen = segments[segments.length - 1] === "+not-found";

      // Skip protection for error screens
      if (isErrorScreen) return;

      if ((session && segments[0] !== "(app)") || (!session && inAppGroup)) {
        setIsNavigating(true);
        await delay(200);
        if (session && segments[0] !== "(app)") {
          router.replace("/(app)/dashboard");
        } else {
          router.push("/");
        }
        setIsNavigating(false);
      }
    }

    handleNavigation();
  }, [session, segments, isLoading]);

  return isNavigating;
}

function RootLayoutNav({ linking }: { linking: LinkingOptions<any> }) {
  const colorScheme = useColorScheme();
  const isNavigating = useProtectedRoute();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Slot />
        <LoadingOverlay isVisible={isNavigating} />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    InstrumentSerif: require("../assets/fonts/InstrumentSerif-Regular.ttf"),
    InstrumentSerifItalic: require("../assets/fonts/InstrumentSerif-Italic.ttf"),
    GeistMedium: require("../assets/fonts/Geist-Medium.ttf"),
    GeistRegular: require("../assets/fonts/Geist-Regular.ttf"),
    GeistSemiBold: require("../assets/fonts/Geist-SemiBold.ttf"),
    ...FontAwesome.font,
  });

  const linking = useMemo<LinkingOptions<any>>(
    () => ({
      prefixes: ["com.launchtoday.expo://", "https://launchtoday.app"],
      config: {
        screens: {
          "(auth)": {
            screens: {
              "sign-in": "sign-in",
              "email-input": "email-input",
              "magic-link-sent": "magic-link-sent",
            },
          },
          "(app)": {
            screens: {
              dashboard: "dashboard",
              settings: "settings",
              profile: "profile",
              feedback: "Feedback",
              "(payments)": {
                screens: {
                  index: "payments",
                  stripe: "payments/stripe",
                  revenuecat: "payments/revenuecat",
                },
              },
            },
          },
        },
      },
    }),
    []
  );

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <StripeProvider>
          <RevenueCatProvider>
            <RootLayoutNav linking={linking} />
          </RevenueCatProvider>
        </StripeProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
