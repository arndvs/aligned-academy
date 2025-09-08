import { StyleSheet } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "../utils/responsive";

export const commonStyles = StyleSheet.create({
  customFontRegular: {
    fontFamily: "InstrumentSerif",
  },
  customFontItalic: {
    fontFamily: "InstrumentSerifItalic",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#000000",
    padding: responsiveHeight(12),
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContainer: {
    paddingHorizontal: responsiveWidth(20),
    paddingVertical: responsiveWidth(10),
  },
  customButton: {
    backgroundColor: "#E5E5EA",
    padding: responsiveHeight(16),
    borderRadius: responsiveWidth(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveHeight(12),
  },
  buttonIcon: {
    width: responsiveWidth(24),
    height: responsiveWidth(24),
    marginRight: responsiveWidth(10),
  },
  buttonText: {
    color: "#000000",
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: responsiveWidth(5),
    padding: responsiveWidth(10),
    fontSize: responsiveFontSize(16),
  },
  saveButton: {
    backgroundColor: "#76ACA2",
    paddingVertical: responsiveHeight(16),
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
  },
});

export const animationConfig = {
  contentDelay: 300,
  buttonDelay: 800,
};
