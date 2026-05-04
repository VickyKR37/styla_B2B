import { createNavigationContainerRef } from '@react-navigation/native';

/** Combined routes for the single NavigationContainer (auth or app stack mounted). */
export type RootNavigationParamList = {
  Login: undefined;
  Signup: undefined;
  About: undefined;
  Home: undefined;
  ColourAnalysis: undefined;
  StyleAnalysis: undefined;
  Payment: { target: 'StyleAnalysis' | 'ColourAnalysis' | 'Bundle' };
};

export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();

export function navigateToAbout() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('About');
  }
}
