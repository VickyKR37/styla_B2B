import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './context/AuthContext';
import { PaymentAccessProvider } from './context/PaymentAccessContext';
import { navigationRef } from './navigationRef';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SignupScreen } from './screens/auth/SignupScreen';
import { LegalLinksFooter } from './src/components/LegalLinksFooter';
import { AboutScreen } from './src/screens/AboutScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { AddClientScreen } from './src/screens/AddClientScreen';
import { AddReportScreen } from './src/screens/AddReportScreen';
import { ClientDetailScreen } from './src/screens/ClientDetailScreen';
import { ClientListScreen } from './src/screens/ClientListScreen';
import { StyleAnalysisScreen } from './src/screens/StyleAnalysisScreen';

export type RootStackParamList = {
  Home: undefined;
  About: undefined;
  StyleAnalysis: undefined;
  Payment: undefined;
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
      <AppStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Billing' }} />
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
    <NavigationContainer ref={navigationRef}>{session ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaymentAccessProvider>
          <View style={styles.appShell}>
            <View style={styles.navigationShell}>
              <RootNavigation />
            </View>
            <LegalLinksFooter />
          </View>
        </PaymentAccessProvider>
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
