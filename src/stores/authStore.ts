import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

export type { UserRole } from '@/types';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return (data?.role as UserRole) || 'staff';
}

async function fetchProfile(userId: string): Promise<{ name: string } | null> {
  const { data } = await supabase
    .from('profiles')
    .select('name')
    .eq('user_id', userId)
    .single();
  return data;
}

async function buildAppUser(supabaseUser: SupabaseUser): Promise<AppUser> {
  const [role, profile] = await Promise.all([
    fetchUserRole(supabaseUser.id),
    fetchProfile(supabaseUser.id),
  ]);
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.email || '',
    role,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    // Set up auth state listener BEFORE getting session
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(async () => {
          const appUser = await buildAppUser(session.user);
          set({ user: appUser, session, isAuthenticated: true, isLoading: false });
        }, 0);
      } else {
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const appUser = await buildAppUser(session.user);
      set({ user: appUser, session, isAuthenticated: true, isLoading: false, initialized: true });
    } else {
      set({ isLoading: false, initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      const appUser = await buildAppUser(data.user);
      set({ user: appUser, session: data.session, isAuthenticated: true });
    }
    return { success: true };
  },

  signup: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    if (data.user && !data.user.identities?.length) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
