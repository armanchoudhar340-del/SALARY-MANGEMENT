import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsDemoMode(false);
        setIsLoading(false);
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Demo / Local Mode (no Supabase env vars set yet)
      const savedDemoUser = localStorage.getItem('driverpay_demo_admin');
      if (savedDemoUser) {
        setUser(JSON.parse(savedDemoUser));
      } else {
        // Pre-authenticate default admin in demo mode so user can test immediately
        const defaultAdmin = {
          id: 'admin-001',
          email: 'admin@fleetmanager.com',
          app_metadata: {},
          user_metadata: { full_name: 'Fleet Admin' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(defaultAdmin);
        localStorage.setItem('driverpay_demo_admin', JSON.stringify(defaultAdmin));
      }
      setIsDemoMode(true);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(data.user);
      return { success: true };
    } else {
      // Demo authentication: allow test credentials
      if (password.length >= 6) {
        const demoUser = {
          id: 'admin-demo',
          email,
          user_metadata: { full_name: 'Administrator' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(demoUser);
        localStorage.setItem('driverpay_demo_admin', JSON.stringify(demoUser));
        return { success: true };
      } else {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('driverpay_demo_admin');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: Boolean(user),
        isLoading,
        login,
        logout,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
