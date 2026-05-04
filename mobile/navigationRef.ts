import { createNavigationContainerRef } from '@react-navigation/native';

/** Combined routes for the single NavigationContainer (auth or app stack mounted). */
export type RootNavigationParamList = {
  Login: undefined;
  Signup: undefined;
  About: undefined;
  Home: undefined;
  StyleAnalysis: undefined;
  Payment: undefined;
  ClientList: undefined;
  AddClient: undefined;
  ClientDetail: { clientId: string };
  AddReport: { clientId: string };
};

export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();

export function navigateToAbout() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('About');
  }
}
