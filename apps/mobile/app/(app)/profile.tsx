import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";

import { typography } from "../../styles/typography";
import { responsiveHeight, responsiveWidth } from "../../utils/responsive";
import { commonStyles } from "../../styles/common";
import { getProfile, updateProfile } from "../../db";
import { useSession } from "@/providers/Auth";
import ProfileImage from "@/components/ProfilePicture";
import { EvilIcons } from "@expo/vector-icons";

type ProfileUpdates = Partial<{
  username: string;
  website: string;
  bio: string;
  avatar_url: string;
}>;

const ProfileScreen = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowSaving, setShouldShowSaving] = useState(false);
  const [shouldShowSaved, setShouldShowSaved] = useState(false);
  const savingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const savedAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const debouncedSave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useSession();
  const savingOpacity = useRef(new Animated.Value(0)).current;
  const savingTranslateY = useRef(new Animated.Value(-50)).current;
  const savedOpacity = useRef(new Animated.Value(0)).current;
  const savedTranslateY = useRef(new Animated.Value(-50)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | undefined>(undefined);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getProfile(user.id);
      if (profile) {
        setUsername(profile.username || "");
        setWebsite(profile.website || "");
        setBio(profile.bio || "");
        setAvatarPath(profile.avatar_url || undefined);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);


  const updateProfileDebounced = useCallback(
    (updates: ProfileUpdates) => {
      if (!user) return;

      setShouldShowSaving(true);
      setShouldShowSaved(false);

      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }

      debouncedSave.current = setTimeout(async () => {
        try {
          await updateProfile(user.id, updates);
          setShouldShowSaved(true);
        } catch (error) {
          console.error("Error updating profile:", error);
        } finally {
          setShouldShowSaving(false);
        }
      }, 2000);
    },
    [user]
  );

  useEffect(() => {
    if (shouldShowSaving) {
      animateSavingIndicator(true);
    } else {
      animateSavingIndicator(false);
    }
  }, [shouldShowSaving]);

  useEffect(() => {
    if (shouldShowSaved) {
      animateSavedIndicator(true);
    } else {
      animateSavedIndicator(false);
    }
  }, [shouldShowSaved]);

  const animateSavingIndicator = (show: boolean) => {
    if (savingAnimationRef.current) {
      savingAnimationRef.current.stop();
    }

    savingAnimationRef.current = Animated.parallel([
      Animated.timing(savingOpacity, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(savingTranslateY, {
        toValue: show ? 0 : -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    savingAnimationRef.current.start();
  };

  const animateSavedIndicator = (show: boolean) => {
    if (savedAnimationRef.current) {
      savedAnimationRef.current.stop();
    }

    savedAnimationRef.current = Animated.parallel([
      Animated.timing(savedOpacity, {
        toValue: show ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(savedTranslateY, {
        toValue: show ? 0 : -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    savedAnimationRef.current.start(() => {
      if (show) {
        setTimeout(() => setShouldShowSaved(false), 2000);
      }
    });
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    updateProfileDebounced({ username: value });
  };

  const handleWebsiteChange = (value: string) => {
    setWebsite(value);
    updateProfileDebounced({ website: value });
  };

  const handleBioChange = (value: string) => {
    setBio(value);
    updateProfileDebounced({ bio: value });
  };

  const handleImageChange = async (newImagePath: string | undefined) => {
    if (!user || !newImagePath) return;

    try {
      setAvatarPath(newImagePath);
      updateProfileDebounced({
        avatar_url: newImagePath,
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          isDarkMode && styles.darkContainer,
        ]}
      >
        <ActivityIndicator size="small" color={textColor} />
      </View>
    );
  }

  if (!user?.id) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          isDarkMode && styles.darkContainer,
        ]}
      >
        <Text style={{ color: textColor }}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, isDarkMode && styles.darkContainer]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Stack.Screen
        options={{
          title: t("profile.screen_title"),
          headerTitle: t("profile.screen_title"),
        }}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <Animated.View
            style={[
              styles.indicatorContainer,
              {
                opacity: savingOpacity,
                transform: [{ translateY: savingTranslateY }],
              },
            ]}
          >
            <View style={styles.savingPill}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.indicatorText}>
                {t("profile.status.saving")}
              </Text>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.indicatorContainer,
              {
                opacity: savedOpacity,
                transform: [{ translateY: savedTranslateY }],
              },
            ]}
          >
            <View style={styles.savedPill}>
              <EvilIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.indicatorText}>
                {t("profile.status.saved")}
              </Text>
            </View>
          </Animated.View>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS === "android" &&
                keyboardVisible &&
                styles.androidScrollContentWithKeyboard,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <ProfileImage
                initialImage={avatarPath}
                onImageChange={handleImageChange}
                userId={user.id}
              />
              <View style={styles.inputContainer}>
                <Text style={[styles.label, isDarkMode && styles.darkLabel]}>
                  {t("profile.labels.username")}
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder={t("profile.placeholders.username")}
                  placeholderTextColor={isDarkMode ? "#888" : "#999"}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, isDarkMode && styles.darkLabel]}>
                  {t("profile.labels.website")}
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={website}
                  onChangeText={handleWebsiteChange}
                  placeholder={t("profile.placeholders.website")}
                  placeholderTextColor={isDarkMode ? "#888" : "#999"}
                  keyboardType="url"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, isDarkMode && styles.darkLabel]}>
                  {t("profile.labels.bio")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.bioInput,
                    isDarkMode && styles.darkInput,
                  ]}
                  value={bio}
                  onChangeText={handleBioChange}
                  placeholder={t("profile.placeholders.bio")}
                  placeholderTextColor={isDarkMode ? "#888" : "#999"}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: responsiveWidth(20),
    flexGrow: 1,
  },
  androidScrollContentWithKeyboard: {
    paddingBottom: responsiveHeight(150),
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
  inputContainer: {
    marginBottom: responsiveHeight(20),
  },
  label: {
    ...typography.body,
    fontWeight: "bold",
    marginBottom: responsiveHeight(5),
    color: "#333",
  },
  input: {
    ...commonStyles.input,
    backgroundColor: "#f8f8f8",
    borderColor: "#e0e0e0",
    color: "#000000",
  },
  bioInput: {
    height: responsiveHeight(150),
    textAlignVertical: "top",
    paddingTop: 10,
  },
  buttonContainer: {
    padding: responsiveWidth(20),
    backgroundColor: "#fff",
  },
  saveButton: commonStyles.saveButton,
  saveButtonText: commonStyles.saveButtonText,
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  indicatorContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  savingPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 40,
  },
  savedPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50", // Green color for success
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 40,
  },
  indicatorText: {
    ...typography.body,
    marginLeft: responsiveWidth(10),
    color: "#FFFFFF",
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  darkCard: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    shadowColor: "#fff",
  },
  darkLabel: {
    color: "#ffffff",
  },
  darkInput: {
    backgroundColor: "#333",
    borderColor: "#444",
    color: "#ffffff",
  },
});

export default ProfileScreen;
