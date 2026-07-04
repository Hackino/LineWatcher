import { create } from 'zustand';
import { container } from 'tsyringe';
import type { AuthUser } from '../../domain/repositories/AuthRepository';
import { SignIn } from '../../domain/usecases/signIn';
import { SignUp } from '../../domain/usecases/signUp';
import { SignOut } from '../../domain/usecases/signOut';

interface AuthState {
  uid: string | null;
  email: string | null;
  isAuthenticated: boolean;
  /** Set by the watchAuth subscription (Firebase onAuthStateChanged). */
  setUser: (user: AuthUser | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Auth state. `isAuthenticated` is driven by the watchAuth subscription, not by
 * the actions — signIn/up/out call the use-cases; Firebase then emits the new
 * auth state, which flows back through setUser.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  uid: null,
  email: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({ uid: user?.uid ?? null, email: user?.email ?? null, isAuthenticated: user != null }),
  signIn: (email, password) => container.resolve(SignIn).execute(email, password),
  signUp: (email, password) => container.resolve(SignUp).execute(email, password),
  signOut: () => container.resolve(SignOut).execute(),
}));
