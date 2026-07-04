export interface AuthUser {
  uid: string;
  email: string | null;
}

/** Auth contract. Firebase implementation for real; mock for offline dev. */
export interface AuthRepository {
  /** Emits the current user (or null) immediately and on every auth change. */
  watch(onChange: (user: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
