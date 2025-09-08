import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { Platform, Pressable, StyleSheet } from "react-native";
import CustomDrawerItem from "./CustomDrawerItem";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View, useThemeColor } from "@/components/Themed";
import { useTranslation } from "react-i18next";

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  email: string | undefined;
  onOpenBottomSheet: () => void;
}

const CustomDrawerContent = (props: CustomDrawerContentProps) => {
  const name = props.email?.split("@")[0] || "User";
  const initials = name.slice(0, 2).toUpperCase();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const { t } = useTranslation();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor }]}
    >
      <View style={[styles.content, { backgroundColor }]}>
        <View style={{ backgroundColor }}>
          <CustomDrawerItem
            icon={({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            )}
            label={t("drawer.home")}
            onPress={() => router.push("/(app)/dashboard")}
          />

          <CustomDrawerItem
            icon={({ color, size }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            )}
            label={t("drawer.payments")}
            onPress={() => router.push("/(app)/(payments)")}
          />

          <CustomDrawerItem
            icon={({ color, size }) => (
              <MaterialIcons name="person-outline" size={size} color={color} />
            )}
            label={t("drawer.profile")}
            onPress={() => router.push("/(app)/profile")}
          />

          <CustomDrawerItem
            icon={({ color, size }) => (
              <Ionicons name="megaphone-outline" size={size} color={color} />
            )}
            label={t("drawer.feedback")}
            onPress={() => router.push("/(app)/feedback")}
          />

          <CustomDrawerItem
            icon={({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            )}
            label={t("drawer.settings")}
            onPress={() => router.push("/(app)/settings")}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.footer,
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor,
          },
        ]}
        onPress={props.onOpenBottomSheet}
      >
        <View style={[styles.userInfo, { backgroundColor: "transparent" }]}>
          <View style={styles.initialsContainer}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: textColor }]}>{name}</Text>
        </View>

        <Pressable
          onPress={props.onOpenBottomSheet}
          style={styles.ellipsisButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={textColor} />
        </Pressable>
      </Pressable>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(16),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  initialsContainer: {
    width: responsiveWidth(32),
    height: responsiveWidth(32),
    borderRadius: 4,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(8),
  },
  initials: {
    color: "#FFF",
    fontSize: responsiveFontSize(14),
    fontWeight: "bold",
  },
  name: {
    fontSize: responsiveFontSize(14),
    fontWeight: "500",
  },
  ellipsisButton: {
    padding: responsiveWidth(10),
  },
});

export default CustomDrawerContent;
