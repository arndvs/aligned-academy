import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { typography } from "../../styles/typography";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "../../utils/responsive";
import { commonStyles } from "../../styles/common";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { submitFeedback } from "../../db";
import { useSession } from "@/providers/Auth";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const descriptionInputRef = useRef<TextInput>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useSession();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isButtonEnabled = title.trim() !== "" && description.trim() !== "";

  const handleSubmitFeedback = useCallback(async () => {
    if (!isButtonEnabled || !user) return;

    setIsLoading(true);

    try {
      await submitFeedback(user.id, {
        type: selectedIndex === 0 ? "feature" : "bug",
        title: title.trim(),
        description: description.trim(),
      });

      Alert.alert(
        t(
          `feedback.alerts.success.${
            selectedIndex === 0 ? "feature" : "bug"
          }.title`
        ),
        t(
          `feedback.alerts.success.${
            selectedIndex === 0 ? "feature" : "bug"
          }.message`
        ),
        [{ text: "OK" }]
      );

      setTitle("");
      setDescription("");
    } catch (error) {
      Alert.alert(
        t(
          `feedback.alerts.error.${
            selectedIndex === 0 ? "feature" : "bug"
          }.title`
        ),
        t(
          `feedback.alerts.error.${
            selectedIndex === 0 ? "feature" : "bug"
          }.message`
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [title, description, isButtonEnabled, selectedIndex, user, t]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t("feedback.screen_title"),
          headerTitle: t("feedback.screen_title"),
        }}
      />

      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, isDark && styles.darkContainer]}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={[styles.card, isDark && styles.darkCard]}>
                <SegmentedControl
                  values={[
                    t("feedback.segments.feature"),
                    t("feedback.segments.bug"),
                  ]}
                  selectedIndex={selectedIndex}
                  onChange={(event) => {
                    setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
                  }}
                  style={styles.segmentedControl}
                  fontStyle={{ fontSize: 14, color: isDark ? "#fff" : "#000" }}
                  activeFontStyle={{
                    fontSize: 14,
                    color: isDark ? "#ffffff" : "#000",
                  }}
                  backgroundColor={isDark ? "#333" : "#f0f0f0"}
                  tintColor={isDark ? "#666" : "#ffffff"}
                />
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, isDark && styles.darkLabel]}>
                    {t("feedback.labels.title")}
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.darkInput]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t(
                      `feedback.placeholders.${
                        selectedIndex === 0 ? "feature" : "bug"
                      }.title`
                    )}
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    returnKeyType="next"
                    onSubmitEditing={() => descriptionInputRef.current?.focus()}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, isDark && styles.darkLabel]}>
                    {t("feedback.labels.description")}
                  </Text>
                  <TextInput
                    ref={descriptionInputRef}
                    style={[
                      styles.input,
                      styles.descriptionInput,
                      isDark && styles.darkInput,
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t(
                      `feedback.placeholders.${
                        selectedIndex === 0 ? "feature" : "bug"
                      }.description`
                    )}
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    multiline
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isButtonEnabled && styles.disabledButton,
                isDark && styles.darkSubmitButton,
              ]}
              onPress={handleSubmitFeedback}
              disabled={!isButtonEnabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={isDark ? "#000" : "#fff"} />
              ) : (
                <Text
                  style={[styles.submitButtonText, isDark && { color: "#000" }]}
                >
                  {t(
                    `feedback.submit.${selectedIndex === 0 ? "feature" : "bug"}`
                  )}
                </Text>
              )}
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
  },
  darkCard: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    shadowColor: "#fff",
  },
  segmentedControl: {
    marginBottom: responsiveHeight(20),
    height: 40,
  },
  inputContainer: {
    marginBottom: responsiveHeight(20),
  },
  label: {
    ...typography.body,
    fontWeight: "bold",
    marginBottom: responsiveHeight(5),
    color: "#333",
  },
  darkLabel: {
    color: "#fff",
  },
  input: {
    ...commonStyles.input,
    backgroundColor: "#f8f8f8",
    borderColor: "#e0e0e0",
    color: "#000",
  },
  darkInput: {
    backgroundColor: "#333",
    borderColor: "#444",
    color: "#fff",
  },
  descriptionInput: {
    height: responsiveHeight(150),
    textAlignVertical: "top",
  },
  buttonContainer: {
    paddingHorizontal: responsiveWidth(20),
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
  disabledButton: {
    opacity: 0.5,
  },
});
