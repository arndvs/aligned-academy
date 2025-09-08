declare module "*/stripe" {
  import { FC } from "react";

  interface StripeProviderProps {
    merchantIdentifier?: string;
    publishableKey: string;
    children: React.ReactNode;
  }

  export const StripeProvider: FC<StripeProviderProps>;
}

declare module "*/Stripe/functions" {
  export function initPaymentSheet(
    paymentSheetConfig: PaymentSheetConfig
  ): Promise<void>;
  export function presentPaymentSheet(): Promise<void>;
  export const PlatformPay: {
    ButtonType: {
      Pay: string;
    };
    PaymentType: {
      Immediate: string;
    };
    ButtonStyle: {
      Black: string;
      WhiteOutline: string;
      Automatic: string;
    };
    ContactField: {
      PostalAddress: string;
      PhoneNumber: string;
    };
    BillingAddressFormat: {
      Full: string;
    };
  };
  export function PlatformPayButton(
    props: PlatformPayButtonProps
  ): React.ReactNode;
  export function confirmPlatformPayPayment(
    clientSecret: string,
    options: {
      applePay: {
        cartItems: {
          label: string;
          amount: string;
          paymentType: string;
        }[];
        merchantCountryCode: string;
        currencyCode: string;
        requiredShippingAddressFields: string[];
        requiredBillingContactFields: string[];
      };
      googlePay: {
        testEnv: boolean;
        merchantName: string;
        merchantCountryCode: string;
        currencyCode: string;
        billingAddressConfig: {
          format: string;
          isPhoneNumberRequired: boolean;
          isRequired: boolean;
        };
      };
    }
  ): Promise<{
    status: string;
    error: {
      code: string;
      message: string;
    };
  }>;
  export function isPlatformPaySupported({
    googlePay,
  }: {
    googlePay: { testEnv: boolean };
  }): Promise<boolean>;
}
