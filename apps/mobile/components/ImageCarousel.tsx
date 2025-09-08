import React, { useRef, useEffect } from "react";
import { View, StyleSheet, FlatList, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = 60;
const ITEM_SPACING = 20;

const images = [
  require("../assets/logos/revenuecat.png"),
  require("../assets/logos/sentry.png"),
  require("../assets/logos/supabase.png"),
  require("../assets/logos/stripe.png"),
  require("../assets/logos/posthog.png"),
];

const duplicatedImages = [...images, ...images, ...images];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ImageCarousel = () => {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const contentWidth = (ITEM_WIDTH + ITEM_SPACING) * images.length;

  const scrollToOffset = (offset: number, animated = true) => {
    flatListRef.current?.scrollToOffset({ offset, animated });
  };

  useEffect(() => {
    let animationFrame: number;
    let currentOffset = 0;
    const step = 0.9;

    const animate = () => {
      currentOffset += step;

      if (currentOffset >= contentWidth) {
        currentOffset = 0;
        scrollToOffset(currentOffset, false);
      } else {
        scrollToOffset(currentOffset, false);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [contentWidth]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Animated.Image source={item} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef}
        data={duplicatedImages}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.1, y: 0.5 }}
        style={styles.leftGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0)"]}
        start={{ x: 0.9, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rightGradient}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: width - 40,
    overflow: "hidden",
    position: "relative",
  },
  listContent: {
    paddingHorizontal: ITEM_SPACING,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: 100,
    marginHorizontal: ITEM_SPACING / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: ITEM_WIDTH * 0.8,
    height: ITEM_WIDTH * 0.8,
    objectFit: "contain",
    borderRadius: 5,
  },
  leftGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 2,
  },
  rightGradient: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 2,
  },
});

export default ImageCarousel;
