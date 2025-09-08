import * as AppleAuthentication from "expo-apple-authentication";
import { useStorageState } from "@/hooks/useStorageState";
import React, { useCallback, useEffect } from "react";

import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { FunctionsHttpError, Session, User } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { supabase } from "@/services/supabase";
import { createSessionFromUrl } from "@/utils/createSessionFromUrl";
import { ErrorService } from "@/services/error/ErrorService";
import { ErrorCode } from "@/services/error/types";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

const AuthContext = React.createContext<{
  signInWithApple: (setIsLoading: (value: boolean) => void) => void;
  signInWithGoogle: (setIsLoading: (value: boolean) => void) => void;
  signInWithEmail: (email: string) => void;
  signOut: () => void;
  session: Session | null;
  isLoading: boolean;
  user: User | null;
  deleteAccount: () => Promise<void>;
}>({
  signInWithApple: () => null,
  signInWithGoogle: () => null,
  signInWithEmail: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  user: null,
  deleteAccount: async () => {},
});

export function useSession() {
  const value = React.useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading], setSessionData] = useStorageState("session");
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      console.info("Skipping loading session for web");

      return;
    }

    async function loadSession() {
      const storedSession = await SecureStore.getItemAsync("session");

      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Session;
        setSessionData(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    const response = supabase?.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession) {
            const sessionString = JSON.stringify(newSession);
            setSessionData(sessionString);
            setSession(newSession);
            setUser(newSession.user);
          }
        } else if (event === "SIGNED_OUT") {
          setSessionData(null);
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      if (response) {
        response.data.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const handleDeepLink = async (url: string) => {
      try {
        const newSession = await createSessionFromUrl(url);

        if (newSession) {
          const sessionString = JSON.stringify(newSession);
          setSessionData(sessionString);
          setSession(newSession);
          setUser(newSession.user);
        }
      } catch (error) {
        console.error("Error handling deep link:", error);
        ErrorService.handleError(
          {
            code: ErrorCode.AUTH_INVALID_REDIRECT,
            message: "Failed to process authentication redirect",
            originalError: error,
          },
          "handleDeepLink"
        );
      }
    };

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    // Handle deep links when app is launched from killed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function performAppleOAuth(setIsLoading: (value: boolean) => void) {
    try {
      setIsLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        console.error(
          "performAppleOAuth - error - Could not get identityToken from credential"
        );
        return;
      }

      const response = await supabase?.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (response?.error) {
        console.error(
          "performAppleOAuth - error - error completing sign in with Apple"
        );

        throw {
          code: ErrorCode.AUTH_APPLE_SIGNIN_FAILED,
          message: "Supabase Apple Sign In failed",
          originalError: response.error,
        };
      }

      if (!response?.data.session) {
        console.error(
          "performAppleOAuth - error - could not find session in response.data object"
        );
        return;
      }

      const sessionString = JSON.stringify(response.data.session);
      setSessionData(sessionString);
      setSession(response.data.session);
      setUser(response.data.session.user);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      console.error(
        "performAppleOAuth - error - there was a problem signing in the user with Apple",
        error
      );

      const appError = {
        code: ErrorCode.AUTH_APPLE_SIGNIN_FAILED,
        message: "Failed to sign in with Apple",
        originalError: error,
      };

      ErrorService.handleError(appError, "signInWithApple");
    }
  }

  async function performGoogleOAuth(setIsLoading: (value: boolean) => void) {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "com.launchtoday.expo://login-callback",
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "select_account consent",
          },
        },
      });

      if (error) {
        console.error(
          "performGoogleOAuth - error - error completing sign in with Google"
        );
        return;
      }

      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? "",
        redirectTo
      );

      if (res.type === "cancel") {
        setIsLoading(false);
        return;
      }

      if (res.type === "success") {
        const { url } = res;
        const newSession = await createSessionFromUrl(url);

        if (newSession) {
          const sessionString = JSON.stringify(newSession);
          setSessionData(sessionString);
          setSession(newSession);
          setUser(newSession.user);
        }

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(
        "performGoogleOAuth - error - there was a problem signing in the user with Google"
      );
    }
  }

  async function performSignInWithEmail(email: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: "com.launchtoday.expo://",
          data: {
            redirectTo: "/(app)/dashboard",
          },
        },
      });

      if (error) {
        throw {
          code: ErrorCode.AUTH_EMAIL_SIGNIN_FAILED,
          message: "Failed to send magic link",
          originalError: error,
        };
      }
    } catch (error) {
      const appError = {
        code: ErrorCode.AUTH_EMAIL_SIGNIN_FAILED,
        message: "Failed to send magic link",
        originalError: error,
      };

      ErrorService.handleError(appError, "signInWithEmail");
      throw error;
    }
  }

  async function performSignOut() {
    try {
      const response = await supabase?.auth.signOut();

      if (response?.error) {
        console.error(
          "performSignOut - could not sign out user",
          response.error
        );

        return;
      }

      setSessionData(null);
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error(
        "performSignOut - there was a problem signing out the user"
      );
    }
  }

  async function performDeleteAccount() {
    if (!user) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error } = await supabase.functions.invoke("user-self-delete", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const errorMessage = await error.context.json();
          throw {
            code: ErrorCode.AUTH_DELETE_ACCOUNT_FAILED,
            message: "Failed to delete account",
            originalError: error,
            metadata: { errorMessage },
          };
        }
        throw error;
      }

      void signOut();
    } catch (error) {
      const appError = {
        code: ErrorCode.AUTH_DELETE_ACCOUNT_FAILED,
        message: "Failed to delete account",
        originalError: error,
      };

      ErrorService.handleError(appError, "deleteAccount");
      throw error;
    }
  }

  const signInWithApple = useCallback(
    (setIsLoading: (value: boolean) => void) => {
      performAppleOAuth(setIsLoading);
    },
    [performAppleOAuth]
  );

  const signInWithGoogle = useCallback(
    (setIsLoading: (value: boolean) => void) => {
      performGoogleOAuth(setIsLoading);
    },
    [performGoogleOAuth]
  );

  const signInWithEmail = useCallback(
    (email: string) => {
      performSignInWithEmail(email);
    },
    [performSignInWithEmail]
  );

  const signOut = useCallback(() => {
    performSignOut();
  }, [setSession, performSignOut]);

  const deleteAccount = useCallback(() => {
    return performDeleteAccount();
  }, [performDeleteAccount]);

  const authContextValue = React.useMemo(
    () => ({
      signInWithApple,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      session,
      user,
      isLoading,
      deleteAccount,
    }),
    [
      signInWithApple,
      signInWithGoogle,
      signOut,
      session,
      isLoading,
      user,
      deleteAccount,
    ]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
