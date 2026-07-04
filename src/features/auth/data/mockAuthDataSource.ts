import { injectable } from 'tsyringe';
import type { AuthRepository, AuthUser } from '../domain/repositories/AuthRepository';

/** Offline auth: any credentials sign in as a fixed mock user. In the mock
 *  build we start already signed in so demos / screenshots land straight on
 *  the app shell. Sign-out on a mock build ends up back on Login as expected. */
@injectable()
export class MockAuthDataSource implements AuthRepository {
  private user: AuthUser | null = { uid: 'mock-uid', email: 'you@example.com' };
  private readonly listeners = new Set<(user: AuthUser | null) => void>();

  watch(onChange: (user: AuthUser | null) => void): () => void {
    onChange(this.user);
    this.listeners.add(onChange);
    return () => {
      this.listeners.delete(onChange);
    };
  }

  async signIn(email: string): Promise<void> {
    this.user = { uid: 'mock-uid', email: email || 'you@example.com' };
    this.emit();
  }

  async signUp(email: string): Promise<void> {
    return this.signIn(email);
  }

  async signOut(): Promise<void> {
    this.user = null;
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((l) => l(this.user));
  }
}
