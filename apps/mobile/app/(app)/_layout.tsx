import React from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/providers/Auth";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  useColorScheme,
  TouchableOpacity,
  Modal,
} from "react-native";
import { responsiveFontSize } from "@/utils/responsive";
import { responsiveHeight } from "@/utils/responsive";
import { responsiveWidth } from "@/utils/responsive";
import { useState, useRef, useCallback } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { typography } from "@/styles/typography";
import { Redirect } from "expo-router";
import { Text, View } from "@/components/Themed";
import { DrawerActions } from "@react-navigation/native";
import { useRevenueCatSubscriptionStatus } from "@/src/hooks/useRevenueCat";

const RootLayout = () => {
  const { user, signOut, session, isLoading, deleteAccount } = useSession();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);
  const { t } = useTranslation();

  const { subscriptionStatus, presentPaywallIfNeeded, restorePurchases } =
    useRevenueCatSubscriptionStatus();

  const toggleInfoModal = useCallback(() => {
    setInfoModalVisible((prev) => !prev);
  }, []);

  const handleUpgrade = useCallback(() => {
    presentPaywallIfNeeded();
  }, [presentPaywallIfNeeded]);

  const handleRestorePurchases = useCallback(async () => {
    setIsRestoringPurchases(true);
    try {
      await restorePurchases();
    } finally {
      setIsRestoringPurchases(false);
    }
  }, [restorePurchases]);

  const handleOpenBottomSheet = useCallback(() => {
    if (!isBottomSheetOpen) {
      bottomSheetRef.current?.expand();
    }
  }, [isBottomSheetOpen]);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetOpen(false);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await deleteAccount();
              closeBottomSheet();
            } catch (error) {
              Alert.alert(
                "Error",
                "There was a problem deleting your account. Please try again."
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, [closeBottomSheet]);

  const renderBottomSheetContent = () => (
    <BottomSheetView
      style={[
        styles.bottomSheetContent,
        isDarkMode && styles.darkBottomSheetContent,
      ]}
    >
      <View
        style={[
          styles.bottomSheetHeader,
          isDarkMode && styles.darkBottomSheetHeader,
        ]}
      >
        <Text style={[styles.bottomSheetTitle, isDarkMode && styles.darkText]}>
          {t("settings.screen_title")}
        </Text>
        <TouchableOpacity onPress={closeBottomSheet}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={[styles.option, isDarkMode && styles.darkOption]}>
          <Ionicons
            name="mail-outline"
            size={24}
            color={textColor}
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionLabel, isDarkMode && styles.darkText]}>
              {t("settings.email")}
            </Text>
            <Text
              style={[styles.optionValue, isDarkMode && styles.darkOptionValue]}
            >
              {user?.email || "Not available"}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={[styles.option, isDarkMode && styles.darkOption]}>
          <Ionicons
            name="card-outline"
            size={24}
            color={textColor}
            style={styles.optionIcon}
          />
          <View style={styles.subscriptionContainer}>
            <Text style={[styles.optionText, isDarkMode && styles.darkText]}>
              {t("settings.subscription.title")}
            </Text>
            <Text
              style={[styles.optionValue, isDarkMode && styles.darkOptionValue]}
            >
              {subscriptionStatus === "Inactive"
                ? t("settings.subscription.status.free")
                : t("settings.subscription.status.plus")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleUpgrade}
          style={[styles.option, isDarkMode && styles.darkOption]}
        >
          <Ionicons
            name="arrow-up-circle-outline"
            size={24}
            color={textColor}
            style={styles.optionIcon}
          />
          <Text style={[styles.optionText, isDarkMode && styles.darkText]}>
            {t("settings.upgrade")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRestorePurchases}
          disabled={isRestoringPurchases}
          style={[
            styles.option,
            styles.noBorder,
            isDarkMode && styles.darkOption,
            isRestoringPurchases && styles.disabledOption,
          ]}
        >
          <Ionicons
            name="refresh-outline"
            size={24}
            color={
              isRestoringPurchases ? (isDarkMode ? "#666" : "#999") : textColor
            }
            style={styles.optionIcon}
          />
          <Text
            style={[
              styles.optionText,
              isDarkMode && styles.darkText,
              isRestoringPurchases && styles.disabledText,
            ]}
          >
            {t("settings.restore_purchases")}
          </Text>
          {isRestoringPurchases && (
            <ActivityIndicator
              size="small"
              color={textColor}
              style={styles.spinner}
            />
          )}
        </TouchableOpacity>
      </View>

      <View
        style={[styles.card, styles.logoutCard, isDarkMode && styles.darkCard]}
      >
        <TouchableOpacity
          style={[styles.option, isDarkMode && styles.darkOption]}
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#FF3B30"
            style={styles.optionIcon}
          />
          <Text style={[styles.optionText, styles.deleteText]}>
            {t("settings.delete_account")}
          </Text>
          {isDeletingAccount && (
            <ActivityIndicator
              size="small"
              color="#FF3B30"
              style={styles.spinner}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.option,
            styles.noBorder,
            isDarkMode && styles.darkOption,
          ]}
          onPress={signOut}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#FF3B30"
            style={styles.optionIcon}
          />
          <Text style={[styles.optionText, styles.logoutText]}>
            {t("settings.logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={textColor} />
        </View>
      );
    }

    if (!session) {
      return <Redirect href="/sign-in" />;
    }

    return (
      <>
        <Drawer
          drawerContent={(props) => (
            <CustomDrawerContent
              {...props}
              email={user?.email}
              onOpenBottomSheet={handleOpenBottomSheet}
            />
          )}
          screenOptions={({ route, navigation }) => ({
            headerShown: route.name !== "(payments)",
            headerTintColor: textColor,
            headerTitle:
              route.name === "(payments)"
                ? "Payments"
                : route.name === "dashboard"
                ? "Dashboard"
                : route.name === "profile"
                ? "Profile"
                : route.name,
            headerLeft: () => (
              <Pressable
                onPress={() =>
                  navigation.dispatch(DrawerActions.toggleDrawer())
                }
                style={{ marginLeft: 16 }}
              >
                <Ionicons name="menu-outline" size={26} color={textColor} />
              </Pressable>
            ),
            headerRight: () => (
              <Pressable onPress={toggleInfoModal} style={{ marginRight: 16 }}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={textColor}
                />
              </Pressable>
            ),
          })}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={isBottomSheetOpen ? 2 : -1}
          snapPoints={["90%", "90%", "90%"]}
          enablePanDownToClose
          onClose={() => setIsBottomSheetOpen(false)}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: isDarkMode ? "#000000" : "#ffffff",
          }}
        >
          {renderBottomSheetContent()}
        </BottomSheet>

        <Modal
          animationType="fade"
          transparent={true}
          visible={infoModalVisible}
          onRequestClose={toggleInfoModal}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                isDarkMode && styles.darkModalContent,
              ]}
            >
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                {t("app_info.title")}
              </Text>
              <Text style={[styles.modalText, isDarkMode && styles.darkText]}>
                {t("app_info.version", { version: "1.0.0" })}
              </Text>
              <Text style={[styles.modalText, isDarkMode && styles.darkText]}>
                {t("app_info.copyright", { year: "2025" })}
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  isDarkMode && styles.darkCloseButton,
                ]}
                onPress={toggleInfoModal}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    isDarkMode && { color: "#000000" },
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
  };

  return renderContent();
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
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
  },
  subscriptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    marginTop: responsiveHeight(20),
    padding: responsiveWidth(10),
    backgroundColor: "#000000",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "GeistMedium",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  logoutCard: {
    marginBottom: 20,
  },
  logoutText: {
    color: "#FF3B30",
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
  },
  optionTextContainer: {
    flex: 1,
    gap: 5,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionValue: {
    fontSize: 14,
    color: "#666",
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#999",
  },
  spinner: {
    marginLeft: "auto",
  },
  deleteText: {
    color: "#FF3B30",
  },
  darkBottomSheetContent: {
    backgroundColor: "#000000",
  },
  darkBottomSheetHeader: {
    backgroundColor: "#000000",
  },
  darkCard: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333333",
  },
  darkOption: {
    borderBottomColor: "#333333",
  },
  darkText: {
    color: "#ffffff",
  },
  darkOptionValue: {
    color: "#888888",
  },
  darkModalContent: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333333",
    borderWidth: 1,
  },
  darkCloseButton: {
    backgroundColor: "#ffffff",
  },
});

export { RootLayout as default };
