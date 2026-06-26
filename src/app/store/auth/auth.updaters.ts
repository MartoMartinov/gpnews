import { User } from '../../shared/models';
import { AuthSlice } from './auth.slice';

/** Set the authenticated session. */
export const setSession = (
  user: User,
  accessExpiresAt: string,
): Partial<AuthSlice> => ({ user, accessExpiresAt });

/** Clear the session (logout / expiry). */
export const clearSession = (): Partial<AuthSlice> => ({
  user: null,
  accessExpiresAt: null,
});

/** Mark startup auto-login complete. */
export const setInitialized = (): Partial<AuthSlice> => ({ initialized: true });
