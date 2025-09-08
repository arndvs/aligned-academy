import React, { type ReactNode } from "react";
import { StripeProvider as CustomStripeProvider } from "./stripe";

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // Prefer env vars (uncomment these in real code)
  // const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  // const merchantIdentifier = process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER;

  const publishableKey =
    "pk_test_51PD1MJRdJkb9J1xwkSgP56O4WzM8qOOQhox8tQsxGgIPSyFYnol0yav8eBwczYcC97lBNd6FBt2pnQSPGymiaw1t00CMLqpzv0";
  const merchantIdentifier = "merchant.com.launchtodayhq.launchtoday"; // iOS only

  if (!publishableKey) {
    throw new Error(
      "publishableKey is not set. Ensure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is defined."
    );
  }

  return (
    <CustomStripeProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantIdentifier}
    >
      {children}
    </CustomStripeProvider>
  );
};

export default StripeProvider;
