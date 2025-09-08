import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: isDarkMode ? "#000000" : "#ffffff",
        },
        headerTintColor: isDarkMode ? "#ffffff" : "#000000",
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="email-input"
        options={{
          title: "Enter Email",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
