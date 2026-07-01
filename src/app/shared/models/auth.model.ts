import { User } from './user.model';

/** Login form payload. */
export interface Credentials {
  email: string;
  password: string;
}

/** Registration form payload. */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/** Successful auth response from the API. */
export interface AuthResponse {
  accessToken: string;
  /** ISO 8601 expiry timestamp. Omitted/null means the session never auto-expires. */
  accessExpiresAt: string | null;
  user: User;
}

/** Persisted (non-sensitive) auth metadata — token is stored separately/securely. */
export interface AuthMetadata {
  user: User;
  accessExpiresAt: string | null;
}
