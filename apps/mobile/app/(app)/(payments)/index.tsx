import { responsiveFontSize } from "@/utils/responsive";
import { responsiveHeight } from "@/utils/responsive";
import { commonStyles } from "@/styles/common";
import { responsiveWidth } from "@/utils/responsive";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Image, useColorScheme } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { openBrowserAsync } from "expo-web-browser";
import { Entypo } from "@expo/vector-icons";
import { Text, View, useThemeColor } from "@/components/Themed";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";

const paymentOptions = [
  {
    key: "stripe",
    image: require("../../../assets/logos/stripe.png"),
    route: "/(app)/(payments)/stripe",
  },
  {
    key: "revenuecat",
    image: require("../../../assets/logos/revenuecat.png"),
    route: "/(app)/(payments)/revenuecat",
  },
  {
    key: "superwall",
    image: require("../../../assets/logos/superwall.png"),
    route: "/(app)/(payments)/superwall",
    comingSoon: true,
  },
];

export default function PaymentsIndex() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const backgroundColor = useThemeColor({}, "background");
  const { t } = useTranslation();

  const handleOptionPress = async (
    option: (typeof paymentOptions)[0] & {
      route?: string;
      url?: string;
    }
  ) => {
    if (option.url) {
      try {
        await openBrowserAsync(option.url, {});
      } catch (error) {
        console.error("Failed to open browser:", error);
      }
    } else if (option.route) {
      router.push(option.route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: t("payments.screen_title"),
          headerTitle: t("payments.screen_title"),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {paymentOptions.map((option, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: isDarkMode ? "#1c1c1c" : "#f8f8f8",
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: "#333333",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => handleOptionPress(option)}
          >
            <View
              style={[
                styles.optionContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <Image source={option.image} style={styles.optionImage} />
              <View
                style={[
                  styles.optionTextContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
                <View
                  style={[
                    styles.titleContainer,
                    { backgroundColor: "transparent" },
                  ]}
                >
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    {t(`payments.${option.key}.title`)}
                  </Text>
                  {option.comingSoon && (
                    <View
                      style={[
                        styles.comingSoonTag,
                        { backgroundColor: isDarkMode ? "#333333" : "#E5E5EA" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.comingSoonText,
                          {
                            color: isDarkMode ? "#ffffff" : "#000000",
                            opacity: 0.6,
                          },
                        ]}
                      >
                        {t("payments.superwall.coming_soon")}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: textColor, opacity: 0.6 },
                  ]}
                >
                  {t(`payments.${option.key}.description`)}
                </Text>
              </View>
              <Entypo
                name="chevron-thin-right"
                size={15}
                color={textColor}
                style={styles.chevron}
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: responsiveWidth(20),
  },
  card: {
    borderRadius: 10,
    marginBottom: responsiveHeight(15),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
    borderWidth: 1,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveWidth(15),
  },
  optionImage: {
    width: responsiveWidth(40),
    height: responsiveWidth(40),
    marginRight: responsiveWidth(15),
    borderRadius: 5,
    objectFit: "contain",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "bold",
    marginBottom: responsiveHeight(2),
  },
  optionDescription: {
    fontSize: responsiveFontSize(14),
    opacity: 0.6,
    lineHeight: responsiveHeight(17),
  },
  chevron: {
    marginLeft: responsiveWidth(10),
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveWidth(10),
    marginBottom: responsiveHeight(2),
  },
  comingSoonTag: {
    paddingHorizontal: responsiveWidth(8),
    paddingVertical: responsiveHeight(2),
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: responsiveFontSize(12),
    fontWeight: "500",
  },
});
