import { useCallback, useEffect, useState } from "react";
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { Alert } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

type SubscriptionStatus = "Active" | "Inactive" | "Error" | null;

export function useRevenueCatSubscriptionStatus() {
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOfferring, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);

  const checkSubscriptionStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.entitlements.active["Launchtoday Plus"]) {
        setSubscriptionStatus("Active");
      } else {
        setSubscriptionStatus("Inactive");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setSubscriptionStatus("Error");
    }
  };

  const presentPaywallIfNeeded = useCallback(async () => {
    try {
      setIsLoading(true);

      const paywallResult: PAYWALL_RESULT =
        await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "Premium",
        });

      if (paywallResult === "NOT_PRESENTED") {
        Alert.alert(
          "You've already subscribed",
          "You already have access to the premium features 🎉"
        );
        return;
      }

      await checkSubscriptionStatus();
    } catch (error: any) {
      console.error(
        "presentPaywallIfNeeded() - internal error presenting paywall",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active["Launchtoday Plus"]) {
        setSubscriptionStatus("Active");
        Alert.alert(
          "Success",
          "Your purchases have been restored successfully!"
        );
      } else {
        setSubscriptionStatus("Inactive");
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any active subscriptions linked to your account."
        );
      }
    } catch (error) {
      console.error("Error restoring purchases:", error);
      Alert.alert(
        "Error",
        "There was an error restoring your purchases. Please try again later."
      );
      setSubscriptionStatus("Error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscriptionStatus();

    const getOfferings = async () => {
      const offerings = await Purchases.getOfferings();
      setCurrentOffering(offerings.current);
    };

    getOfferings();
  }, []);

  return {
    subscriptionStatus,
    checkSubscriptionStatus,
    presentPaywallIfNeeded,
    restorePurchases,
    currentOfferring,
    isLoading,
  };
}

type GetNamedPackageParams = {
  currentOfferring: PurchasesOffering | null;
  packageIdentifier: string;
};

export function getNamedPackage({
  currentOfferring,
  packageIdentifier,
}: GetNamedPackageParams): PurchasesPackage | null {
  if (!currentOfferring) return null;

  return (
    currentOfferring.availablePackages.find(
      (pkg) => pkg.identifier === packageIdentifier
    ) || null
  );
}
