import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './context/AuthContext';
import { navigationRef } from './navigationRef';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SignupScreen } from './screens/auth/SignupScreen';

export type { AuthStackParamList, RootStackParamList } from './navigationParamLists';
import type { AuthStackParamList, CombinedNavigationParamList, RootStackParamList } from './navigationParamLists';

import { LegalLinksFooter } from './src/components/LegalLinksFooter';
import { AboutScreen } from './src/screens/AboutScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SubscriptionScreen } from './src/screens/SubscriptionScreen';
import { SubscriptionResultScreen } from './src/screens/SubscriptionResultScreen';
import { AddClientScreen } from './src/screens/AddClientScreen';
import { AddReportScreen } from './src/screens/AddReportScreen';
import { ClientDetailScreen } from './src/screens/ClientDetailScreen';
import { ClientListScreen } from './src/screens/ClientListScreen';
import { StyleAnalysisScreen } from './src/screens/StyleAnalysisScreen';

const linking: LinkingOptions<CombinedNavigationParamList> = {
  prefixes: ['styla://', Linking.createURL('/')],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      Home: '',
      About: 'about',
      StyleAnalysis: 'style-analysis',
      Subscription: 'subscription/manage',
      SubscriptionResult: 'subscription/result',
      ClientList: 'clients',
      AddClient: 'clients/new',
      ClientDetail: {
        path: 'clients/:clientId',
        parse: { clientId: (clientId: string) => decodeURIComponent(clientId) },
      },
      AddReport: {
        path: 'clients/:clientId/reports/new',
        parse: { clientId: (clientId: string) => decodeURIComponent(clientId) },
      },
    },
  },
};

const AppStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const aboutHeaderButton = ({ navigation }: { navigation: { navigate: (name: 'About') => void } }) => (
  <Pressable onPress={() => navigation.navigate('About')} hitSlop={8} style={styles.aboutHeaderBtn}>
    <Text style={styles.aboutHeaderText}>About</Text>
  </Pressable>
);

function AppNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerRight: () => aboutHeaderButton({ navigation }),
      })}
    >
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Styla' }} />
      <AppStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About', headerRight: () => null }}
      />
      <AppStack.Screen
        name="StyleAnalysis"
        component={StyleAnalysisScreen}
        options={{ title: 'Client style report' }}
      />
      <AppStack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Subscription' }} />
      <AppStack.Screen
        name="SubscriptionResult"
        component={SubscriptionResultScreen}
        options={{ title: 'Confirming subscription', headerRight: () => null }}
      />
      <AppStack.Screen name="ClientList" component={ClientListScreen} options={{ title: 'My clients' }} />
      <AppStack.Screen name="AddClient" component={AddClientScreen} options={{ title: 'New client' }} />
      <AppStack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Client' }} />
      <AppStack.Screen name="AddReport" component={AddReportScreen} options={{ title: 'New report' }} />
    </AppStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={({ navigation }) => ({
        headerRight: () => aboutHeaderButton({ navigation }),
      })}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Consultant sign-in' }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: 'Consultant account' }} />
      <AuthStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About', headerRight: () => null }}
      />
    </AuthStack.Navigator>
  );
}

function RootNavigation() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingShell}>
        <ActivityIndicator size="large" color="#C4956A" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  WebBrowser.maybeCompleteAuthSession();
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={styles.appShell}>
          <View style={styles.navigationShell}>
            <RootNavigation />
          </View>
          <LegalLinksFooter />
        </View>
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  navigationShell: {
    flex: 1,
  },
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
  },
  headerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 4,
  },
  aboutHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  aboutHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C4956A',
  },
});
