import { FC } from "react";

interface StripeProviderProps {
  merchantIdentifier?: string;
  publishableKey: string;
  children: React.ReactNode;
}

export const StripeProvider: FC<StripeProviderProps>;
