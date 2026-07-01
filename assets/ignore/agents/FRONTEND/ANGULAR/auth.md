# Authentication & Security

## Overview

Authentication uses **JWT access tokens** + **httpOnly cookie refresh tokens** on web, and **OS Keychain / EncryptedSharedPreferences** on native (iOS/Android via Capacitor).

- use roles only if needed in the current app
- use translation related stuff only if translations are requested in the current app
- always use `withCredentials: true` on web requests so the refresh cookie is sent
- **Never** store access tokens in `localStorage` or `sessionStorage` on web
- **Never** attach the JWT to third-party API requests (interceptor must check URL origin)
- On native, use `@aparajita/capacitor-secure-storage` — never plain `localStorage`
- Token expiration must trigger `autoLogout()` — do not silently ignore expired tokens
- Auto-logout timing is dictated entirely by the backend's `accessExpiresAt` on the auth response — never hardcode a client-side expiry. If the backend omits/nulls `accessExpiresAt`, schedule **no** auto-logout timer (session never auto-expires)
- Silent refresh must serialize concurrent 401s — no parallel refresh calls
- Refresh queue pattern: uses a `BehaviorSubject` to serialize multiple in-flight requests during a refresh
- `@ionic/storage-angular` (encrypted IndexedDB) for user metadata

---

## Token Storage Strategy

| Platform | Access Token                                                       | Refresh Token                        |
| -------- | ------------------------------------------------------------------ | ------------------------------------ |
| Web      | In-memory only (never persisted)                                   | httpOnly cookie (managed by backend) |
| iOS      | `@aparajita/capacitor-secure-storage` (Keychain)                   | Same secure storage                  |
| Android  | `@aparajita/capacitor-secure-storage` (EncryptedSharedPreferences) | Same secure storage                  |

User metadata (without the token) is stored in `@ionic/storage-angular` (encrypted IndexedDB) under the `AUTH_DATA` key. Tokens are explicitly scrubbed before saving metadata.

---

## AuthService

Manages all auth state and operations using Angular **signals**.

```ts
// Reactive state (readonly signals)
user: Signal<User | null>;
isLoggedIn: Signal<boolean>;

// Also exposed as observables for legacy subscriptions
user$: Observable<User | null>;
isLoggedIn$: Observable<boolean>;
```

### Key Methods

- `login(email, password)` — standard credentials login
- `loginWithGoogle()` / `loginWithApple()` — Firebase-verified OAuth
- `register()` / `registerWithGoogle()` / `registerWithApple()`
- `logout()` — clears tokens, resets state
- `updateToken(token)` — called by interceptor after silent refresh
- `autoLogout()` — sets a timer based on the backend-provided `accessExpiresAt`; no timer at all if the backend doesn't provide it

### App Startup (Auto-login)

- **Native**: retrieves token from secure storage
- **Web**: calls `POST /auth/refresh` using the httpOnly cookie to obtain a fresh access token
- Fails silently if no token exists

---

## Auth Interceptor

Handles token attachment and silent refresh for every HTTP request.

**Responsibilities:**

1. Adds `Authorization: Bearer <token>` to all backend requests only (never third-party URLs)
2. Web: adds `withCredentials: true` so the browser sends the httpOnly cookie
3. On **401 response**:
   - **Web**: triggers silent token refresh via `POST /auth/refresh`, queues concurrent requests until refresh completes, then retries them
   - **Native**: immediately logs the user out (no cookie mechanism)

**Refresh queue pattern**: uses a `BehaviorSubject` to serialize multiple in-flight requests during a refresh — only one refresh call is made regardless of how many requests 401'd simultaneously.

---

## Route Guards

| Guard              | Purpose                                                                                      | Applied To            |
| ------------------ | -------------------------------------------------------------------------------------------- | --------------------- |
| `authGuard`        | Redirects unauthenticated users to `/auth/login`; stores attempted URL in `pendingReturnUrl` | Protected pages       |
| `userRoleGuard`    | Redirects based on user role                                                                 | Role-specific routes  |
| `loggedStateGuard` | Observes `isLoggedIn$` for broader state checks                                              | General routes        |
| `translationGuard` | Ensures i18n is initialized before route activates                                           | Applied to all routes |

Protected routes use: `canActivate: [translationGuard, authGuard]`

---

## State Management

Uses a hybrid **NgRx Signals** pattern:

- `AuthService` owns the source-of-truth signals (`_user`, `_isLoggedIn`)
- `AuthStore` (`signalStore`) mirrors these signals for app-wide access
- `AuthStore.updateUser()` and `AuthStore.updateState()` keep the store in sync

---

## User Model

```ts
class User {
  id: number;
  name: string;
  surname: string;
  email: string;
  token: string;
  tokenExpirationDate: Date;
  role: 'user' | 'artist';

  get tokenDuration(): number; // milliseconds until expiration
}
```

---

## API Endpoints (Auth)

| Method   | Endpoint         | Description                                            |
| -------- | ---------------- | ------------------------------------------------------ |
| `POST`   | `/auth/login`    | Email/password login → returns token + expiration      |
| `POST`   | `/auth/register` | Registration (may require email verification)          |
| `POST`   | `/auth/refresh`  | Issues new access token via httpOnly cookie (web only) |
| `POST`   | `/auth/logout`   | Deletes refresh token record server-side               |
| `POST`   | `/auth/google`   | Google Sign-In via Firebase                            |
| `POST`   | `/auth/apple`    | Apple Sign-In via Firebase                             |
| `PUT`    | `/auth/password` | Change password                                        |
| `PUT`    | `/auth/email`    | Change email                                           |
| `DELETE` | `/profile`       | Delete account                                         |

All requests include a `zone` query parameter (timezone offset).

---

## Security Rules for Agents

- **Never** store access tokens in `localStorage` or `sessionStorage` on web
- **Never** attach the JWT to third-party API requests (interceptor must check URL origin)
- Always use `withCredentials: true` on web requests so the refresh cookie is sent
- On native, use `@aparajita/capacitor-secure-storage` — never plain `localStorage`
- Token expiration must trigger `autoLogout()` — do not silently ignore expired tokens
- Silent refresh must serialize concurrent 401s — no parallel refresh calls
