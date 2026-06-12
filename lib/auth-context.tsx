'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { DbUser, DbProfile } from './types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  dbUser: DbUser | null;
  profile: DbProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    const [userRes, profileRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
    ]);
    if (userRes.data) setDbUser(userRes.data as DbUser);
    if (profileRes.data) setProfile(profileRes.data as DbProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadUserData(user.id);
  }, [user, loadUserData]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setDbUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      setSession(data.session);
      setUser(data.user);
      await loadUserData(data.user.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setDbUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, dbUser, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
