import { injectable } from 'tsyringe';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from '@react-native-firebase/auth';
import type { AuthRepository, AuthUser } from '../domain/repositories/AuthRepository';

@injectable()
export class FirebaseAuthDataSource implements AuthRepository {
  watch(onChange: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(getAuth(), (u) =>
      onChange(u ? { uid: u.uid, email: u.email } : null),
    );
  }

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(getAuth(), email, password);
  }

  async signUp(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(getAuth(), email, password);
  }

  async signOut(): Promise<void> {
    await fbSignOut(getAuth());
  }
}
