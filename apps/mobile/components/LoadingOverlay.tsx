import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { Easing } from "react-native-reanimated";

import { useEffect } from "react";

import { useSharedValue, withTiming } from "react-native-reanimated";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useThemeColor } from "@/components/Themed";

function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  const opacity = useSharedValue(0);
  const backgroundColor = useThemeColor({}, "background");
  const indicatorColor = useThemeColor({}, "text");

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isVisible && opacity.value === 0) return null;

  return (
    <Animated.View
      style={[styles.loadingOverlay, animatedStyle, { backgroundColor }]}
    >
      <ActivityIndicator size="large" color={indicatorColor} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingOverlay;
