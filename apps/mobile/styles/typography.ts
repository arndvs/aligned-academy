import {StyleSheet} from 'react-native';
import {responsiveFontSize} from '../utils/responsive';

export const typography = StyleSheet.create({
  title: {
    fontSize: responsiveFontSize(28),
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "GeistSemiBold",
  },
  subtitle: {
    fontSize: responsiveFontSize(16),
    fontFamily: "GeistRegular",
  },
  body: {
    fontSize: responsiveFontSize(16),
    fontFamily: "GeistRegular",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
  },
  h3: {
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
  },
});
