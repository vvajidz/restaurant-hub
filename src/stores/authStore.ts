import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@restaurant.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@restaurant.com',
      name: 'John Admin',
      role: 'admin',
    },
  },
  'staff@restaurant.com': {
    password: 'staff123',
    user: {
      id: '2',
      email: 'staff@restaurant.com',
      name: 'Sarah Staff',
      role: 'staff',
    },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser = MOCK_USERS[email.toLowerCase()];
        
        if (!mockUser) {
          return { success: false, error: 'User not found' };
        }

        if (mockUser.password !== password) {
          return { success: false, error: 'Invalid password' };
        }

        set({ user: mockUser.user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
