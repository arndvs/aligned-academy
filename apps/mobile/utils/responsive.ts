import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const baseWidth = 375;
const baseHeight = 812;

export const scaleWidth = SCREEN_WIDTH / baseWidth;
export const scaleHeight = SCREEN_HEIGHT / baseHeight;

export const scale = Math.min(scaleWidth, scaleHeight);

export function responsiveFontSize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function responsiveWidth(width: number) {
  return Math.round(PixelRatio.roundToNearestPixel(width * scaleWidth));
}

export function responsiveHeight(height: number) {
  return Math.round(PixelRatio.roundToNearestPixel(height * scaleHeight));
}