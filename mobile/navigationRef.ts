import { createNavigationContainerRef } from '@react-navigation/native';

import type { CombinedNavigationParamList } from './navigationParamLists';

/** Covers both authenticated app stack and auth stack when calling `navigationRef.navigate()`. */
export type RootNavigationParamList = CombinedNavigationParamList;

export const navigationRef = createNavigationContainerRef<CombinedNavigationParamList>();

export function navigateToAbout() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('About');
  }
}
