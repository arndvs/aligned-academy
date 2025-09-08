import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  I18nManager,
} from "react-native";
import { typography } from "../../styles/typography";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "../../utils/responsive";
import { commonStyles } from "../../styles/common";
import { Text } from "@/components/Themed";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n";
import * as Localization from "expo-localization";
import { Picker } from "@react-native-picker/picker";

const LANGUAGES = [
  { code: "en-US", name: "English (US) 🇺🇸" },
  { code: "es-ES", name: "Spanish (ES) 🇪🇸" },
  { code: "fr-FR", name: "French (FR) 🇫🇷" },
  { code: "ko-KR", name: "Korean (KR) 🇰🇷" },
  { code: "it-IT", name: "Italian (IT) 🇮🇹" },
  { code: "pt-PT", name: "Portuguese (PT) 🇵🇹" },
  { code: "ar-SA", name: "العربية (SA) 🇸🇦" },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const [initialLang, setInitialLang] = useState(i18n.language);
  const isLanguageChanged = selectedLang !== initialLang;

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Try to get saved language preference
        const savedLanguage = await AsyncStorage.getItem("@app_language");

        if (savedLanguage) {
          setSelectedLang(savedLanguage);
          setInitialLang(savedLanguage);
          return;
        }

        // If no saved language, use device locale
        const deviceLocale = Localization.getLocales()[0]?.languageTag || "en-US";
        const languageCode = deviceLocale.split("-")[0];

        // Try exact locale match first
        const exactMatch = LANGUAGES.find((lang) => lang.code === deviceLocale);
        if (exactMatch) {
          setSelectedLang(exactMatch.code);
          setInitialLang(exactMatch.code);
          return;
        }

        // Then try language code match
        const langMatch = LANGUAGES.find((lang) =>
          lang.code.startsWith(languageCode)
        );
        if (langMatch) {
          setSelectedLang(langMatch.code);
          setInitialLang(langMatch.code);
          return;
        }

        setSelectedLang("en-US");
        setInitialLang("en-US");
      } catch (error) {
        console.error("Failed to initialize language:", error);
        setSelectedLang("en-US");
        setInitialLang("en-US");
      }
    };

    initializeLanguage();
  }, []);

  const handleConfirm = async () => {
    if (!isLanguageChanged) return;

    try {
      await AsyncStorage.setItem("@app_language", selectedLang);
      await i18n.changeLanguage(selectedLang);
      setInitialLang(selectedLang);
      Alert.alert(
        t("settings.language.alerts.success.title"),
        t("settings.language.alerts.success.message"),
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to change language:", error);
      Alert.alert(
        t("settings.language.alerts.error.title"),
        t("settings.language.alerts.error.message")
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("settings.screen_title"),
          headerTitle: t("settings.screen_title"),
        }}
      />

      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, isDark && styles.darkContainer]}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.card, isDark && styles.darkCard]}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                {t("settings.language.title")}
              </Text>

              <View
                style={[
                  styles.pickerContainer,
                  isDark && styles.darkPickerContainer,
                ]}
              >
                <Picker
                  selectedValue={selectedLang}
                  onValueChange={(value: string) => setSelectedLang(value)}
                  style={[styles.picker, isDark && styles.darkPicker]}
                  dropdownIconColor={isDark ? "#fff" : "#000"}
                  itemStyle={{ color: isDark ? "#fff" : "#000" }}
                >
                  {LANGUAGES.map((lang) => (
                    <Picker.Item
                      key={lang.code}
                      label={lang.name}
                      value={lang.code}
                      color={isDark ? "#fff" : "#000"}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isDark && styles.darkSubmitButton,
                !isLanguageChanged && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={!isLanguageChanged}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  isDark && styles.darkSubmitButtonText,
                  !isLanguageChanged && styles.disabledButtonText,
                ]}
              >
                {t("settings.language.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  scrollContent: {
    padding: responsiveWidth(20),
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: responsiveWidth(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
  darkCard: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    shadowColor: "#fff",
  },
  sectionTitle: {
    ...typography.body,
    fontSize: responsiveFontSize(18),
    fontWeight: "bold",
    marginBottom: responsiveHeight(15),
    color: "#000",
    textAlign: I18nManager.isRTL ? "right" : "left",
    width: "100%",
  },
  darkText: {
    color: "#fff",
  },
  pickerContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: responsiveHeight(8),
    overflow: "hidden",
    width: "100%",
  },
  darkPickerContainer: {
    backgroundColor: "#333",
  },
  picker: {
    width: "100%",
    height:
      Platform.OS === "ios" ? responsiveHeight(150) : responsiveHeight(50),
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  darkPicker: {
    color: "#fff",
  },
  buttonContainer: {
    paddingHorizontal: responsiveWidth(20),
    paddingVertical: responsiveWidth(10),
  },
  submitButton: {
    backgroundColor: "#000000",
    padding: responsiveHeight(12),
    borderRadius: 8,
    alignItems: "center",
  },
  darkSubmitButton: {
    backgroundColor: "#ffffff",
  },
  submitButtonText: {
    color: "white",
    fontSize: responsiveFontSize(16),
    fontFamily: "GeistMedium",
  },
  darkSubmitButtonText: {
    color: "#000",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});
