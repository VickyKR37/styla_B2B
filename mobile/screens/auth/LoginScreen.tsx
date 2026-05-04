import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn, resendConfirmationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleLogin() {
    setError(null);
    setInfo(null);
    setShowResendConfirmation(false);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : 'Login failed';
      const lower = rawMessage.toLowerCase();
      let message = rawMessage;
      if (lower.includes('email not confirmed')) {
        message = 'Please confirm your email first, then try logging in again.';
        setShowResendConfirmation(true);
      } else if (lower.includes('invalid login credentials')) {
        message = 'Invalid email or password. Check your details or sign up first.';
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Enter your email first, then tap resend confirmation.');
      return;
    }
    setResending(true);
    try {
      await resendConfirmationEmail(email.trim());
      setInfo('Confirmation email sent. Please check your inbox (and spam folder).');
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : 'Could not resend confirmation email.';
      const lower = rawMessage.toLowerCase();
      const message = lower.includes('rate limit')
        ? 'Too many confirmation emails requested. Please wait a minute and try again.'
        : rawMessage;
      setError(message);
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9C9A90"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9C9A90"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {info ? <Text style={styles.infoText}>{info}</Text> : null}

      <Pressable style={[styles.button, submitting ? styles.buttonDisabled : null]} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#FAF8F5" /> : <Text style={styles.buttonText}>Login</Text>}
      </Pressable>

      {showResendConfirmation ? (
        <Pressable onPress={handleResendConfirmation} disabled={resending}>
          <Text style={styles.linkText}>
            {resending ? 'Resending confirmation...' : 'Resend confirmation email'}
          </Text>
        </Pressable>
      ) : null}

      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>No account yet? Sign up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2C2C2A',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 15,
    color: '#2C2C2A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2C2C2A',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  button: {
    marginTop: 6,
    backgroundColor: '#C4956A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FAF8F5',
    fontSize: 15,
    fontWeight: '700',
  },
  linkText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#2C2C2A',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#B3261E',
    marginBottom: 8,
    fontSize: 13,
  },
  infoText: {
    color: '#256029',
    marginBottom: 8,
    fontSize: 13,
  },
});
