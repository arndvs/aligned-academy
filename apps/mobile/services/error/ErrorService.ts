import { AppError, ErrorCode } from "./types";
import { ERROR_MESSAGES } from "./messages";
import { Alert } from "react-native";
import { router } from "expo-router";
import { NavigationState, PartialState } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<NavigationState>();

type ErrorConfig = {
  title: string;
  message: string;
  action: "retry" | "login" | "back" | "home";
};

const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  title: "Error",
  message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
  action: "home",
};

export class ErrorService {
  static errorConfig: Record<ErrorCode, ErrorConfig> = {
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
      title: "errors.titles.invalid_credentials",
      message: "errors.messages.invalid_credentials",
      action: "retry",
    },
    [ErrorCode.AUTH_SESSION_EXPIRED]: {
      title: "errors.titles.session_expired",
      message: "errors.messages.session_expired",
      action: "login",
    },
    [ErrorCode.AUTH_NETWORK_ERROR]: {
      title: "errors.titles.network_error",
      message: "errors.messages.auth_network_error",
      action: "retry",
    },
    [ErrorCode.AUTH_APPLE_SIGNIN_FAILED]: {
      title: "errors.titles.signin_failed",
      message: "errors.messages.apple_signin_failed",
      action: "retry",
    },
    [ErrorCode.API_NETWORK_ERROR]: {
      title: "errors.titles.connection_error",
      message: "errors.messages.network_error",
      action: "retry",
    },
    [ErrorCode.API_RATE_LIMIT]: {
      title: "errors.titles.too_many_requests",
      message: "errors.messages.rate_limit",
      action: "back",
    },
    [ErrorCode.API_SERVER_ERROR]: {
      title: "errors.titles.server_error",
      message: "errors.messages.server_error",
      action: "retry",
    },
    [ErrorCode.PAYMENT_FAILED]: {
      title: "errors.titles.payment_failed",
      message: "errors.messages.payment_failed",
      action: "retry",
    },
    [ErrorCode.PAYMENT_CANCELLED]: {
      title: "errors.titles.payment_cancelled",
      message: "errors.messages.payment_cancelled",
      action: "back",
    },
    [ErrorCode.PAYMENT_INVALID_AMOUNT]: {
      title: "errors.titles.invalid_amount",
      message: "errors.messages.payment_invalid_amount",
      action: "retry",
    },
    [ErrorCode.REVENUECAT_OFFERING_UNAVAILABLE]: {
      title: "errors.titles.offering_unavailable",
      message: "errors.messages.offering_unavailable",
      action: "back",
    },
    [ErrorCode.REVENUECAT_PACKAGE_UNAVAILABLE]: {
      title: "errors.titles.package_unavailable",
      message: "errors.messages.package_unavailable",
      action: "back",
    },
    [ErrorCode.REVENUECAT_PURCHASE_FAILED]: {
      title: "errors.titles.purchase_failed",
      message: "errors.messages.purchase_failed",
      action: "retry",
    },
    [ErrorCode.AUTH_GOOGLE_SIGNIN_FAILED]: {
      title: "errors.titles.signin_failed",
      message: "errors.messages.google_signin_failed",
      action: "retry",
    },
    [ErrorCode.AUTH_EMAIL_SIGNIN_FAILED]: {
      title: "errors.titles.signin_failed",
      message: "errors.messages.email_signin_failed",
      action: "retry",
    },
    [ErrorCode.LOGIN_GOOGLE_SIGNIN_CANCELLED]: {
      title: "errors.titles.signin_cancelled",
      message: "errors.messages.google_signin_cancelled",
      action: "back",
    },
    [ErrorCode.LOGIN_APPLE_SIGNIN_CANCELLED]: {
      title: "errors.titles.signin_cancelled",
      message: "errors.messages.apple_signin_cancelled",
      action: "back",
    },
    [ErrorCode.LOGIN_PRIVACY_POLICY_ERROR]: {
      title: "errors.titles.privacy_policy_error",
      message: "errors.messages.privacy_policy_error",
      action: "back",
    },
    [ErrorCode.DB_FEEDBACK_SUBMIT_FAILED]: {
      title: "errors.titles.submission_failed",
      message: "errors.messages.db_feedback_submit_failed",
      action: "retry",
    },
    [ErrorCode.VALIDATION_ERROR]: {
      title: "errors.titles.validation_error",
      message: "errors.messages.validation_error",
      action: "retry",
    },
    [ErrorCode.AUTH_SIGNOUT_FAILED]: {
      title: "errors.titles.signout_failed",
      message: "errors.messages.signout_failed",
      action: "retry",
    },
    [ErrorCode.AUTH_DELETE_ACCOUNT_FAILED]: {
      title: "errors.titles.account_deletion_failed",
      message: "errors.messages.delete_account_failed",
      action: "retry",
    },
    [ErrorCode.AUTH_NO_USER_DATA]: {
      title: "errors.titles.user_data_missing",
      message: "errors.messages.no_user_data",
      action: "login",
    },
    [ErrorCode.AUTH_TOKEN_MISSING]: {
      title: "errors.titles.authentication_error",
      message: "errors.messages.token_missing",
      action: "login",
    },
    [ErrorCode.AUTH_INVALID_REDIRECT]: {
      title: "errors.titles.invalid_redirect",
      message: "errors.messages.invalid_redirect",
      action: "login",
    },
    [ErrorCode.REVENUECAT_PAYWALL_ERROR]: {
      title: "errors.titles.paywall_error",
      message: "errors.messages.paywall_error",
      action: "back",
    },
    [ErrorCode.LOGIN_BROWSER_ERROR]: {
      title: "errors.titles.browser_error",
      message: "errors.messages.browser_error",
      action: "back",
    },
    [ErrorCode.STRIPE_SESSION_ERROR]: {
      title: "errors.titles.session_error",
      message: "errors.messages.stripe_session_error",
      action: "retry",
    },
    [ErrorCode.STRIPE_CUSTOMER_ERROR]: {
      title: "errors.titles.customer_error",
      message: "errors.messages.stripe_customer_error",
      action: "retry",
    },
    [ErrorCode.STRIPE_AUTHORIZATION_ERROR]: {
      title: "errors.titles.authorization_error",
      message: "errors.messages.stripe_authorization_error",
      action: "retry",
    },
    [ErrorCode.STRIPE_REQUEST_ERROR]: {
      title: "errors.titles.request_error",
      message: "errors.messages.stripe_request_error",
      action: "retry",
    },
    [ErrorCode.STRIPE_REQUEST_TIMEOUT]: {
      title: "errors.titles.request_timeout",
      message: "errors.messages.stripe_request_timeout",
      action: "retry",
    },
    [ErrorCode.PROFILE_IMAGE_UPLOAD_FAILED]: {
      title: "errors.titles.upload_failed",
      message: "errors.messages.profile_image_upload_failed",
      action: "retry",
    },
    [ErrorCode.PROFILE_IMAGE_FETCH_FAILED]: {
      title: "errors.titles.image_load_failed",
      message: "errors.messages.profile_image_fetch_failed",
      action: "retry",
    },
    [ErrorCode.PROFILE_IMAGE_PICKER_FAILED]: {
      title: "errors.titles.image_picker_failed",
      message: "errors.messages.profile_image_picker_failed",
      action: "retry",
    },
    [ErrorCode.PROFILE_IMAGE_URL_INVALID]: {
      title: "errors.titles.invalid_image_url",
      message: "errors.messages.profile_image_url_invalid",
      action: "retry",
    },
    [ErrorCode.PROFILE_IMAGE_TOO_LARGE]: {
      title: "errors.titles.image_too_large",
      message: "errors.messages.profile_image_too_large",
      action: "retry",
    },
    [ErrorCode.PROFILE_IMAGE_FORMAT_INVALID]: {
      title: "errors.titles.invalid_image_format",
      message: "errors.messages.profile_image_format_invalid",
      action: "retry",
    },
    [ErrorCode.DB_PROFILE_CREATE_FAILED]: {
      title: "errors.titles.profile_creation_failed",
      message: "errors.messages.db_profile_create_failed",
      action: "retry",
    },
    [ErrorCode.DB_PROFILE_FETCH_FAILED]: {
      title: "errors.titles.profile_load_failed",
      message: "errors.messages.db_profile_fetch_failed",
      action: "retry",
    },
    [ErrorCode.DB_PROFILE_UPDATE_FAILED]: {
      title: "errors.titles.profile_update_failed",
      message: "errors.messages.db_profile_update_failed",
      action: "retry",
    },
    [ErrorCode.DB_PROFILE_NOT_FOUND]: {
      title: "errors.titles.profile_not_found",
      message: "errors.messages.db_profile_not_found",
      action: "retry",
    },
    [ErrorCode.DB_OPERATION_FAILED]: {
      title: "errors.titles.database_error",
      message: "errors.messages.db_operation_failed",
      action: "retry",
    },
    [ErrorCode.UNKNOWN_ERROR]: {
      title: "errors.titles.default",
      message: "errors.messages.default",
      action: "home",
    },
    [ErrorCode.STRIPE_PAYMENT_INTENT_ERROR]: {
      title: "errors.titles.payment_failed",
      message: "errors.messages.stripe_payment_intent_error",
      action: "retry",
    },
  };

  static getErrorConfig(error: AppError): ErrorConfig {
    return this.errorConfig[error.code] || DEFAULT_ERROR_CONFIG;
  }

  static async handleError(
    error: AppError | Error | unknown,
    context?: string
  ): Promise<void> {
    const appError = this.normalizeError(error);

    this.logError(appError, context);

    const errorConfig = this.getErrorConfig(appError);

    if (this.shouldShowAlert(appError.code)) {
      this.showErrorMessage(errorConfig);
      return;
    }

    this.navigateToErrorScreen(errorConfig);
  }

  private static normalizeError(error: any): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error?.message || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
      originalError: error,
    };
  }

  private static isAppError(error: any): error is AppError {
    return error && "code" in error && error.code in ErrorCode;
  }

  private static shouldShowAlert(errorCode: ErrorCode): boolean {
    const alertErrors = [
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.PAYMENT_CANCELLED,
      ErrorCode.LOGIN_GOOGLE_SIGNIN_CANCELLED,
      ErrorCode.LOGIN_APPLE_SIGNIN_CANCELLED,
    ];

    return alertErrors.includes(errorCode);
  }

  static navigateToErrorScreen(errorConfig: ErrorConfig): void {
    router.replace({
      pathname: "/+not-found",
      params: errorConfig,
    });
  }

  static showErrorMessage(errorConfig: ErrorConfig): void {
    Alert.alert(errorConfig.title, errorConfig.message);
  }

  static logError(error: AppError, context?: string): void {
    console.error("Error:", {
      code: error.code,
      message: error.message,
      context,
      originalError: error.originalError,
      screen: navigationRef.current?.getCurrentRoute()?.name ?? "unknown",
      timestamp: new Date().toISOString(),
    });
  }

  static getUserFacingMessage(error: AppError): string {
    return (
      ERROR_MESSAGES[error.code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]
    );
  }
}
