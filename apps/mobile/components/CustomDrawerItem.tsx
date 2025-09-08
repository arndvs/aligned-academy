import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { Text, View, useThemeColor } from "@/components/Themed";

interface CustomDrawerItemProps {
  icon: (props: { color: string; size: number }) => React.ReactNode;
  label: string;
  onPress: () => void;
}

const CustomDrawerItem = ({ icon, label, onPress }: CustomDrawerItemProps) => {
  const [pressed, setPressed] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      style={[
        styles.option,
        {
          opacity: pressed ? 0.7 : 1,
          backgroundColor: isDarkMode ? "#1c1c1c" : "#f8f8f8",
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: "#333333",
        },
      ]}
    >
      <View style={[styles.optionContent, { backgroundColor: "transparent" }]}>
        {icon({ color: textColor, size: 22 })}
        <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(12),
    marginBottom: responsiveHeight(10),
    borderRadius: 8,
    marginHorizontal: responsiveWidth(12),
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: responsiveWidth(15),
  },
  optionText: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    marginLeft: responsiveWidth(15),
  },
});

export default CustomDrawerItem;
