import { ErrorCode } from "./types";

// cSpell:ignore REVENUECAT
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Auth Error Messages
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.AUTH_SESSION_EXPIRED]:
    "Your session has expired. Please sign in again",
  [ErrorCode.AUTH_NETWORK_ERROR]: "Unable to connect to authentication service",

  // Payment Error Messages
  [ErrorCode.PAYMENT_FAILED]: "Unable to process payment",
  [ErrorCode.PAYMENT_CANCELLED]: "Payment was cancelled",
  [ErrorCode.PAYMENT_INVALID_AMOUNT]: "Invalid payment amount",

  // API Error Messages
  [ErrorCode.API_NETWORK_ERROR]: "Network connection error",
  [ErrorCode.API_RATE_LIMIT]: "Too many requests. Please try again later",
  [ErrorCode.API_SERVER_ERROR]: "Server error. Please try again later",

  // Generic Error Messages
  [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred",
  [ErrorCode.VALIDATION_ERROR]: "Please check your input and try again",

  // RevenueCat Error Messages
  [ErrorCode.REVENUECAT_OFFERING_UNAVAILABLE]:
    "The subscription offering is currently unavailable",
  [ErrorCode.REVENUECAT_PACKAGE_UNAVAILABLE]:
    "The selected package is currently unavailable",
  [ErrorCode.REVENUECAT_PURCHASE_FAILED]: "Unable to complete the purchase",
  [ErrorCode.REVENUECAT_PAYWALL_ERROR]:
    "Unable to display subscription options",

  // Auth Specific Messages
  [ErrorCode.AUTH_APPLE_SIGNIN_FAILED]: "Unable to sign in with Apple",
  [ErrorCode.AUTH_GOOGLE_SIGNIN_FAILED]: "Unable to sign in with Google",
  [ErrorCode.AUTH_EMAIL_SIGNIN_FAILED]: "Unable to send login link",
  [ErrorCode.AUTH_SIGNOUT_FAILED]: "Unable to sign out",
  [ErrorCode.AUTH_DELETE_ACCOUNT_FAILED]: "Unable to delete account",
  [ErrorCode.AUTH_NO_USER_DATA]: "No user data received",
  [ErrorCode.AUTH_TOKEN_MISSING]: "Authentication token is missing",
  [ErrorCode.AUTH_INVALID_REDIRECT]: "Invalid authentication redirect",

  // Login Screen Messages
  [ErrorCode.LOGIN_GOOGLE_SIGNIN_CANCELLED]: "Google sign in was cancelled",
  [ErrorCode.LOGIN_APPLE_SIGNIN_CANCELLED]: "Apple sign in was cancelled",
  [ErrorCode.LOGIN_BROWSER_ERROR]: "Unable to open browser",
  [ErrorCode.LOGIN_PRIVACY_POLICY_ERROR]: "Unable to open privacy policy",

  // Stripe API Messages
  [ErrorCode.STRIPE_SESSION_ERROR]: "Unable to validate your session",
  [ErrorCode.STRIPE_PAYMENT_INTENT_ERROR]: "Unable to create payment",
  [ErrorCode.STRIPE_CUSTOMER_ERROR]: "Unable to process customer information",
  [ErrorCode.STRIPE_AUTHORIZATION_ERROR]: "Payment authorization failed",
  [ErrorCode.STRIPE_REQUEST_ERROR]: "Unable to process payment request",
  [ErrorCode.STRIPE_REQUEST_TIMEOUT]: "Payment request timed out",

  // Profile Image Messages
  [ErrorCode.PROFILE_IMAGE_UPLOAD_FAILED]: "Unable to upload profile image",
  [ErrorCode.PROFILE_IMAGE_FETCH_FAILED]: "Unable to load profile image",
  [ErrorCode.PROFILE_IMAGE_PICKER_FAILED]: "Unable to select image",
  [ErrorCode.PROFILE_IMAGE_URL_INVALID]: "Invalid image URL",
  [ErrorCode.PROFILE_IMAGE_TOO_LARGE]: "Image size is too large",
  [ErrorCode.PROFILE_IMAGE_FORMAT_INVALID]: "Invalid image format",

  // Database Error Messages
  [ErrorCode.DB_PROFILE_CREATE_FAILED]: "Unable to create user profile",
  [ErrorCode.DB_PROFILE_FETCH_FAILED]: "Unable to fetch user profile",
  [ErrorCode.DB_PROFILE_UPDATE_FAILED]: "Unable to update user profile",
  [ErrorCode.DB_PROFILE_NOT_FOUND]: "User profile not found",
  [ErrorCode.DB_OPERATION_FAILED]: "Database operation failed",
  [ErrorCode.DB_FEEDBACK_SUBMIT_FAILED]: "Unable to submit feedback",
};
