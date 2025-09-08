import * as PostHog from "posthog-react-native";

export const PostHogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PostHog.PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY}
      options={{
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      }}
      autocapture={{
        captureScreens: true,
        captureTouches: true,
        navigation: {
          routeToName: (name) => name,
          routeToProperties: (name, params) => params,
        },
      }}
    >
      {children}
    </PostHog.PostHogProvider>
  );
};
