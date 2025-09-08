import { StripePaymentIntentResponse } from "@/types/types";
import { StripePaymentIntentRequestBody } from "@/types/types";
import { supabase } from "../supabase";

export async function createPaymentIntentClientSecret({
  amount,
  currency,
}: StripePaymentIntentRequestBody): Promise<StripePaymentIntentResponse> {
  const session = await supabase?.auth.getSession();

  if (session?.error) {
    throw new Error(
      `Error loading session from Supabase - ${session.error.message}`
    );
  }

  if (!session?.data) {
    throw new Error("Error loading session from Supabase");
  }

  try {
    const response = await fetch(
      `http://192.168.1.120:3000/stripe/create-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.data.session?.access_token}`,
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      }
    );

    const { clientSecret, customer } = await response.json();

    if (!clientSecret || !customer) {
      const errorMessage = "Could not get clientSecret or customer from Stripe";

      throw new Error(errorMessage);
    }

    return { clientSecret, customer };
  } catch (error) {
    return {
      clientSecret: null,
      customer: null,
    };
  }
}
