import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

type AnimationConfig = {
  delay?: number;
  duration?: number;
  easing?: (value: number) => number;
  initialOpacity?: number;
  initialTranslateY?: number;
};

export const useAnimatedText = (config: AnimationConfig = {}) => {
  const {
    delay = 0,
    duration = 500,
    easing = Easing.out(Easing.cubic),
    initialOpacity = 0,
    initialTranslateY = 50,
  } = config;

  const opacity = useSharedValue(initialOpacity);
  const translateY = useSharedValue(initialTranslateY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing }));
  }, [delay, duration, easing]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  }, []);

  return animatedStyle;
};
