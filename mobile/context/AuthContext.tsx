import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getEmailRedirectTo(): string {
  return 'styla://auth/callback';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setLoading(false);
        return;
      }
      if (isMounted) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    }

    restoreSession();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      // Ensure profile exists once a real authenticated session is available.
      if (nextSession?.user) {
        await ensureProfile(nextSession.user.id, nextSession.user.email ?? null, nextSession.user.user_metadata?.full_name ?? null);
      }
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }

  async function ensureProfile(userId: string, email: string | null, fullName: string | null) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Profile upsert skipped:', error.message);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      throw error;
    }

    // Try immediate profile insert when a session exists.
    if (data.session?.user) {
      await ensureProfile(data.session.user.id, email, fullName);
      return;
    }

    // If signup did not create a session (common when confirmation is enabled),
    // try signing in immediately. This succeeds when confirmation is disabled.
    await signIn(email, password);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async function resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });
    if (error) {
      throw error;
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resendConfirmationEmail,
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
