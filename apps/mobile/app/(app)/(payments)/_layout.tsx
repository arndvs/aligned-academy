import React from "react";
import { Stack } from "expo-router";
import { useThemeColor } from "@/components/Themed";
import {
  Pressable,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useState, useCallback } from "react";
import { typography } from "@/styles/typography";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "@/utils/responsive";
import { useTranslation } from "react-i18next";

export default function PaymentsLayout() {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const navigation = useNavigation();
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { t } = useTranslation();

  const toggleInfoModal = useCallback(() => {
    setInfoModalVisible((prev) => !prev);
  }, []);

  return (
    <>
      <Stack
        screenOptions={({ route }) => ({
          headerShown: route.name !== "index",
          headerTintColor: textColor,
        })}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Payments",
            headerShown: true,
            headerLeft: () => (
              <Pressable
                onPress={() =>
                  navigation.dispatch(DrawerActions.toggleDrawer())
                }
              >
                <Ionicons name="menu-outline" size={26} color={textColor} />
              </Pressable>
            ),
            headerRight: () => (
              <Pressable onPress={toggleInfoModal}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={textColor}
                />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="stripe"
          options={{
            headerShown: true,
            title: "Stripe",
            headerBackTitle: "Payments",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="revenuecat"
          options={{
            headerShown: true,
            title: "RevenueCat",
            headerBackTitle: "Payments",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="superwall"
          options={{
            headerShown: true,
            title: "Superwall",
            headerBackTitle: "Payments",
            presentation: "card",
          }}
        />
      </Stack>

      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={toggleInfoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {t("app_info.title")}
            </Text>
            <Text style={[styles.modalText, { color: textColor }]}>
              {t("app_info.version", { version: "1.0.0" })}
            </Text>
            <Text style={[styles.modalText, { color: textColor }]}>
              {t("app_info.copyright", { year: "2025" })}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: textColor }]}
              onPress={toggleInfoModal}
            >
              <Text
                style={[
                  styles.closeButtonText,
                  { color: backgroundColor },
                  isDarkMode && styles.darkText,
                ]}
              >
                {t("app_info.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 10,
    padding: responsiveWidth(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    borderWidth: 1,
    borderColor: "#333333",
  },
  modalTitle: {
    ...typography.title,
    fontSize: responsiveFontSize(18),
    marginBottom: responsiveHeight(10),
  },
  modalText: {
    ...typography.body,
    marginBottom: responsiveHeight(5),
  },
  closeButton: {
    marginTop: responsiveHeight(20),
    padding: responsiveWidth(10),
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    fontWeight: "bold",
    fontFamily: "GeistMedium",
  },
  darkText: {
    color: "#000000",
  },
});
