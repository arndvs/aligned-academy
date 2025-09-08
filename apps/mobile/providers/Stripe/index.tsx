import React from "react";
import { StripeProvider as CustomStripeProvider } from "./stripe";

type StripeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
}: StripeProviderProps): JSX.Element => {
  //   const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  //   const merchantIdentifier = process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER;

  const publishableKey =
    "pk_test_51PD1MJRdJkb9J1xwkSgP56O4WzM8qOOQhox8tQsxGgIPSyFYnol0yav8eBwczYcC97lBNd6FBt2pnQSPGymiaw1t00CMLqpzv0";
  const merchantIdentifier = "merchant.com.launchtodayhq.launchtoday";

  if (!publishableKey) {
    throw new Error(
      "publishableKey is not set. Ensure that EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your environment variables."
    );
  }

  return (
    <CustomStripeProvider
      merchantIdentifier={merchantIdentifier}
      publishableKey={publishableKey}
    >
      {children}
    </CustomStripeProvider>
  );
};

export default StripeProvider;
