import { SafeAreaView as DefaultSafeAreaView } from "react-native-safe-area-context";
import { ViewProps, useThemeColor } from "./Themed";

export function SafeAreaView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <DefaultSafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />
  );
}
