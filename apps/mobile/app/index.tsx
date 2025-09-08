import { Redirect } from "expo-router";
import { useSession } from "@/providers/Auth";

export default function Index() {
  const { session } = useSession();

  if (session) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
