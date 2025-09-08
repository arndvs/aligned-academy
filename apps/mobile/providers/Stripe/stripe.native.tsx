import React, { ReactElement } from "react";
import {
  StripeProvider as RNStripeProvider,
  initPaymentSheet,
  presentPaymentSheet,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
} from "@stripe/stripe-react-native";

type Props = {
  publishableKey: string;
  merchantIdentifier: string;
  children: ReactElement | ReactElement[];
};

export const AppStripeProvider: React.FC<Props> = ({
  publishableKey,
  merchantIdentifier,
  children,
}) => {
  return (
    <RNStripeProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantIdentifier}
    >
      {children}
    </RNStripeProvider>
  );
};

// Re-exports so the rest of the app can import from here
export {
  initPaymentSheet,
  presentPaymentSheet,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
};
