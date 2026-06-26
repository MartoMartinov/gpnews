import { User } from '../../shared/models';

export interface AuthSlice {
  user: User | null;
  /** ISO 8601 access-token expiry. */
  accessExpiresAt: string | null;
  /** Whether startup auto-login has finished (gates the splash). */
  initialized: boolean;
}

export const initialAuthSlice: AuthSlice = {
  user: null,
  accessExpiresAt: null,
  initialized: false,
};
