import { supabase } from "../services/supabase";
import { Profile } from "../types/user";
import { ErrorService } from "../services/error/ErrorService";
import { ErrorCode } from "../services/error/types";

export const createProfile = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      username: "username",
      avatar_url: "",
      website: "",
      bio: "",
      has_seen_onboarding: false,
    });

    if (error) {
      throw {
        code: ErrorCode.DB_PROFILE_CREATE_FAILED,
        message: "Failed to create user profile",
        originalError: error,
        metadata: { userId },
      };
    }
  } catch (error) {
    ErrorService.handleError(error, "createProfile");
    throw error;
  }
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw {
          code: ErrorCode.DB_PROFILE_NOT_FOUND,
          message: "Profile not found",
          metadata: { userId },
        };
      }
      throw {
        code: ErrorCode.DB_PROFILE_FETCH_FAILED,
        message: "Failed to fetch user profile",
        originalError: error,
        metadata: { userId },
      };
    }

    return data;
  } catch (error) {
    ErrorService.handleError(error, "getProfile");

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === ErrorCode.DB_PROFILE_NOT_FOUND
    ) {
      return null;
    }

    throw error;
  }
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>,
): Promise<Profile> => {
  try {
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .single();

    if (updateError) {
      throw {
        code: ErrorCode.DB_PROFILE_UPDATE_FAILED,
        message: "Failed to update user profile",
        originalError: updateError,
        metadata: { userId, updates },
      };
    }

    const { data: updatedProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !updatedProfile) {
      throw {
        code: ErrorCode.DB_PROFILE_FETCH_FAILED,
        message: "Failed to fetch updated profile",
        originalError: fetchError,
        metadata: { userId },
      };
    }

    return updatedProfile;
  } catch (error) {
    ErrorService.handleError(error, "updateProfile");
    throw error;
  }
};

export const ensureUserProfile = async (userId: string): Promise<void> => {
  try {
    const existingProfile = await getProfile(userId);

    if (existingProfile) {
      return;
    }

    await createProfile(userId);
  } catch (error) {
    ErrorService.handleError(
      {
        code: ErrorCode.DB_OPERATION_FAILED,
        message: "Failed to ensure user profile",
        originalError: error,
        metadata: { userId },
      },
      "ensureUserProfile",
    );
    throw error;
  }
};

export const submitFeedback = async (
  userId: string,
  feedback: {
    type: "feature" | "bug";
    title: string;
    description: string;
  },
): Promise<void> => {
  try {
    const { error } = await supabase.from("feedback").insert({
      user_id: userId,
      type: feedback.type,
      title: feedback.title.trim(),
      description: feedback.description.trim(),
    });

    if (error) {
      throw {
        code: ErrorCode.DB_FEEDBACK_SUBMIT_FAILED,
        message: "Failed to submit feedback",
        originalError: error,
        metadata: { userId, feedback },
      };
    }
  } catch (error) {
    ErrorService.handleError(error, "submitFeedback");
    throw error;
  }
};
