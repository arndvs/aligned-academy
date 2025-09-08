import {
  initPaymentSheet as nativeInitPaymentSheet,
  presentPaymentSheet as nativePresentPaymentSheet,
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
} from "@stripe/stripe-react-native";

// Type-safe across versions (no direct type imports needed)
type InitSheetParams = Parameters<typeof nativeInitPaymentSheet>[0];
type InitSheetResult = Awaited<ReturnType<typeof nativeInitPaymentSheet>>;
type PresentSheetResult = Awaited<ReturnType<typeof nativePresentPaymentSheet>>;

export const initPaymentSheet = (
  paymentSheetConfig: InitSheetParams
): Promise<InitSheetResult> => nativeInitPaymentSheet(paymentSheetConfig);

export const presentPaymentSheet = (): Promise<PresentSheetResult> =>
  nativePresentPaymentSheet();

export {
  PlatformPay,
  PlatformPayButton,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
};
