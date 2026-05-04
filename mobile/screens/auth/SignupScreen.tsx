import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../App';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  function startCooldown(seconds: number) {
    setCooldownSeconds(seconds);
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSignup() {
    setError(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      setSuccessMessage('Account created. If confirmation is enabled, check your email before logging in.');
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : 'Sign up failed';
      const lower = rawMessage.toLowerCase();
      let message = rawMessage;
      if (lower.includes('rate limit')) {
        message = 'Too many requests right now. Please wait a minute, then try again.';
        startCooldown(60);
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join Styla</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor="#9C9A90"
        value={fullName}
        onChangeText={setFullName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#9C9A90"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <Pressable
        style={[styles.button, submitting || cooldownSeconds > 0 ? styles.buttonDisabled : null]}
        onPress={handleSignup}
        disabled={submitting || cooldownSeconds > 0}
      >
        {submitting ? <ActivityIndicator color="#FAF8F5" /> : <Text style={styles.buttonText}>Sign up</Text>}
      </Pressable>
      {cooldownSeconds > 0 ? <Text style={styles.cooldownText}>Try again in {cooldownSeconds}s</Text> : null}

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
  successText: {
    color: '#256029',
    marginBottom: 8,
    fontSize: 13,
  },
  cooldownText: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
});
