export type RootStackParamList = {
  Home: undefined;
  About: undefined;
  StyleAnalysis: undefined;
  Subscription: undefined;
  SubscriptionResult: undefined;
  ClientList: undefined;
  AddClient: undefined;
  ClientDetail: { clientId: string };
  AddReport: { clientId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  About: undefined;
};

/** Merged param list for NavigationContainer ref (app + auth stacks). */
export type CombinedNavigationParamList = RootStackParamList & AuthStackParamList;
