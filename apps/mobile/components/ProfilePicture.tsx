import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ErrorCode } from "@/services/error/types";
import { ErrorService } from "@/services/error/ErrorService";
import { supabase } from "@/services/supabase";
import { useTranslation } from "react-i18next";

interface ProfileImageProps {
  initialImage?: string;
  onImageChange?: (newImagePath: string | undefined) => void;
  userId: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  initialImage,
  onImageChange,
  userId,
}) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingInitialImage, setIsLoadingInitialImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const getSignedUrl = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      if (error) {
        if (error.message.includes("Object not found")) {
          return null;
        }
        throw {
          code: ErrorCode.PROFILE_IMAGE_URL_INVALID,
          message: "Failed to get signed URL",
          originalError: error,
        };
      }

      return data.signedUrl;
    } catch (error) {
      ErrorService.handleError(error, "getSignedUrl");

      return null;
    }
  };

  useEffect(() => {
    const refreshSignedUrl = async () => {
      if (!initialImage) {
        setIsLoadingInitialImage(false);
        return;
      }

      setIsLoadingInitialImage(true);
      try {
        const signedUrl = await getSignedUrl(initialImage);
        if (signedUrl) {
          await Image.prefetch(signedUrl);
          setImage(signedUrl);
        } else {
          // Just reset the image if we couldn't get a signed URL
          setImage(undefined);
        }
      } catch (error) {
        // Log the error but don't show alert to user
        await ErrorService.handleError(error, "refreshSignedUrl");
        setImage(undefined);
      } finally {
        setIsLoadingInitialImage(false);
      }
    };

    refreshSignedUrl();

    const refreshInterval = setInterval(
      refreshSignedUrl,
      180 * 24 * 60 * 60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, [initialImage]);

  const uploadImageToSupabase = async (uri: string) => {
    setIsUploading(true);
    try {
      const fileUri = Platform.OS === "ios" ? uri.replace("file://", "") : uri;

      const response = await fetch(fileUri);
      const binaryData = await response.arrayBuffer();

      // Check file size (max 5MB)
      if (binaryData.byteLength > 5 * 1024 * 1024) {
        throw {
          code: ErrorCode.PROFILE_IMAGE_TOO_LARGE,
          message: t("profile.image.errors.too_large"),
        };
      }

      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";

      // Validate file format
      if (!["jpg", "jpeg", "png"].includes(fileExt)) {
        throw {
          code: ErrorCode.PROFILE_IMAGE_FORMAT_INVALID,
          message: t("profile.image.errors.invalid_format"),
        };
      }

      const fileName = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, binaryData, {
          contentType: `image/${fileExt}`,
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        const appError = {
          code: ErrorCode.PROFILE_IMAGE_UPLOAD_FAILED,
          message: t("profile.image.errors.upload_failed"),
          originalError: error,
        };

        ErrorService.handleError(appError, "uploadImageToSupabase");

        Alert.alert(
          t("profile.image.alerts.upload_error"),
          ErrorService.getUserFacingMessage(appError)
        );
        throw error;
      }

      const signedUrl = await getSignedUrl(fileName);

      if (!signedUrl) {
        throw {
          code: ErrorCode.PROFILE_IMAGE_URL_INVALID,
          message: t("profile.image.errors.url_invalid"),
        };
      }

      return {
        url: signedUrl,
        path: fileName,
      };
    } catch (error) {
      const appError = {
        code: ErrorCode.PROFILE_IMAGE_UPLOAD_FAILED,
        message: t("profile.image.errors.upload_failed"),
        originalError: error,
      };

      ErrorService.handleError(appError, "uploadImageToSupabase");
      Alert.alert(
        t("profile.image.alerts.upload_error"),
        ErrorService.getUserFacingMessage(appError)
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const source = result.assets[0].uri;

        if (!source) {
          const appError = {
            code: ErrorCode.PROFILE_IMAGE_PICKER_FAILED,
            message: t("profile.image.errors.picker_failed"),
          };
          ErrorService.handleError(appError, "pickImage");
          Alert.alert(
            t("profile.image.alerts.selection_error"),
            ErrorService.getUserFacingMessage(appError)
          );
          return;
        }

        try {
          setIsImageLoading(true);
          const { url, path } = await uploadImageToSupabase(source);
          await Image.prefetch(url);
          setImage(url);
          onImageChange && onImageChange(path);
        } catch (error) {
          // Error already handled in uploadImageToSupabase
          setImage(undefined);
          onImageChange && onImageChange(undefined);
        } finally {
          setIsImageLoading(false);
        }
      }
    } catch (error) {
      const appError = {
        code: ErrorCode.PROFILE_IMAGE_PICKER_FAILED,
        message: t("profile.image.errors.picker_failed"),
        originalError: error,
      };
      ErrorService.handleError(appError, "pickImage");
      Alert.alert(
        t("profile.image.alerts.selection_error"),
        ErrorService.getUserFacingMessage(appError)
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={pickImage}
        disabled={isUploading || isLoadingInitialImage || isImageLoading}
      >
        {isLoadingInitialImage || isImageLoading ? (
          <View style={styles.placeholderImage}>
            <ActivityIndicator size="small" color="#000000" />
          </View>
        ) : image ? (
          <View>
            <Image source={{ uri: image }} style={styles.image} />
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            {isUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="person" size={60} color="#ccc" />
            )}
          </View>
        )}
        <View
          style={[
            styles.editIconContainer,
            (isUploading || isLoadingInitialImage || isImageLoading) &&
              styles.editIconDisabled,
          ]}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#000000",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  editIconDisabled: {
    backgroundColor: "#999",
  },
});

export default ProfileImage;
