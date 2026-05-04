import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './context/AuthContext';
import { PaymentAccessProvider } from './context/PaymentAccessContext';
import { navigationRef } from './navigationRef';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SignupScreen } from './screens/auth/SignupScreen';
import { LegalLinksFooter } from './src/components/LegalLinksFooter';
import { FAQ_URL } from './src/constants/externalLinks';
import { AboutScreen } from './src/screens/AboutScreen';
import { ColourAnalysisScreen } from './src/screens/ColourAnalysisScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { StyleAnalysisScreen } from './src/screens/StyleAnalysisScreen';

export type RootStackParamList = {
  Home: undefined;
  About: undefined;
  ColourAnalysis: undefined;
  StyleAnalysis: undefined;
  Payment: { target: 'StyleAnalysis' | 'ColourAnalysis' | 'Bundle' };
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
        name="ColourAnalysis"
        component={ColourAnalysisScreen}
        options={{ title: 'Colour Analysis' }}
      />
      <AppStack.Screen
        name="StyleAnalysis"
        component={StyleAnalysisScreen}
        options={{ title: 'Style Analysis' }}
      />
      <AppStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
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
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
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
