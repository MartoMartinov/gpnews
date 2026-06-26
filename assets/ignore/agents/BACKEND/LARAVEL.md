# Laravel Backend

## Authentication

### Package

**Laravel Sanctum** (`laravel/sanctum ^3.2`) with a custom refresh token layer on top.

- User model uses `HasApiTokens` trait
- All authenticated API routes are protected with `middleware('auth:sanctum')`

---

## Token Architecture

### Access Tokens (Sanctum Personal Access Tokens)

- Issued via `$user->createToken()`
- Stored in `personal_access_tokens` table
- Expiry controlled by `SANCTUM_TOKEN_EXPIRY_MINUTES` env var (default: **30 minutes**)
- Returned in the JSON response body
- Validated by Sanctum on every protected request

### Refresh Tokens (Custom)

- Model: `UserRefreshToken`
- Stored in `user_refresh_tokens` table
- Token value is **SHA256 hashed** before DB storage
- Expiry controlled by `SANCTUM_REFRESH_TOKEN_EXPIRY_DAYS` env var (default: **30 days**)
- Sent to the client as an **httpOnly, Secure, SameSite=None** cookie named `refresh_token`
- Cookie path: `/api`
- On refresh: old token deleted, new access + refresh token pair issued (token rotation)

```env
SANCTUM_TOKEN_EXPIRY_MINUTES=30
SANCTUM_REFRESH_TOKEN_EXPIRY_DAYS=30
```

---

## Auth Endpoints

All endpoints are prefixed with `/{locale}` (e.g. `/en/auth/login`).

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/login` | No | Email/password login |
| `POST` | `/auth/register` | No | User registration |
| `POST` | `/auth/google` | No | Google Sign-In (Firebase verified) |
| `POST` | `/auth/apple` | No | Apple Sign-In (Firebase verified) |
| `POST` | `/auth/google/register` | No | Google registration |
| `POST` | `/auth/apple/register` | No | Apple registration |
| `POST` | `/auth/refresh` | No (cookie) | Issue new tokens using refresh token cookie |
| `POST` | `/auth/logout` | Yes | Delete refresh token, invalidate session |
| `GET` | `/auth/me` | Yes | Get current user profile |
| `PUT` | `/auth/new-password` | Yes | Change password |
| `PUT` | `/auth/new-email` | Yes | Change email |
| `PUT` | `/auth/profile-data` | Yes | Update name, phone, DOB |
| `DELETE` | `/auth/delete-profile` | Yes | Delete account |
| `POST` | `/auth/forgotten-password` | No | Request password reset email |
| `POST` | `/auth/verify-reset-code` | No | Verify reset code |
| `PUT` | `/auth/reset-password` | No | Reset password with verified token |

---

## Auth Controller (`AuthController`)

Located at `app/Http/Controllers/Api/AuthController.php`.

### Login Flow

1. `Auth::attempt()` validates email + password
2. Checks `is_active` flag on user
3. Calls `formattedResponse()` which:
   - Creates Sanctum access token with expiry
   - Creates `UserRefreshToken` record (hashed)
   - Sets httpOnly cookie on response
4. Returns access token + expiration + user data as JSON

### Refresh Flow

1. `POST /auth/refresh` — no Authorization header needed
2. Reads `refresh_token` cookie from request
3. Looks up hashed token in `user_refresh_tokens`
4. Validates token is not expired
5. Deletes old refresh token (rotation)
6. Issues new access token + new refresh token cookie

### OAuth Flow (Google / Apple)

1. Client sends Firebase ID token
2. Backend verifies Firebase ID token signature (OpenSSL RS256)
3. Extracts user info (`google_id` or `apple_id`) from token payload
4. Finds or creates user record
5. Same `formattedResponse()` flow as standard login

### Password Reset Flow

1. `POST /auth/forgotten-password` → emails time-limited code
2. `POST /auth/verify-reset-code` → validates code
3. `PUT /auth/reset-password` → bcrypt hashes new password

---

## Middleware

| Middleware | Purpose |
|---|---|
| `auth:sanctum` | Validates Bearer token on protected routes |
| `localization` | Sets locale from `{locale}` route prefix |
| `EncryptCookies` | Encrypts/decrypts cookies (including refresh token) |
| `TestModeMarkerMiddleware` | Sets test mode flag via `X-Test-Mode` header |
| `ThrottleRequests:api` | Rate limiting |
| `HasRoleMiddleware` | Role check (`role:admin`) for admin web routes |

Admin routes use **session-based auth** (web guard), not Sanctum.

---

## User Model

Key fields relevant to auth:

```php
$google_id       // Social auth
$apple_id        // Social auth
$is_active       // Must be true to login
$password        // Cast as 'hashed' (automatic bcrypt)
```

### Password Validation Rule

```
/^(?=.*[0-9])(?=.*[а-яa-zА-ЯA-Z])(?=.*\W)(?!.* ).{8,32}$/
```

Requires: min 8 chars, at least one digit, one letter, one special character.

---

## Security Rules for Agents

- Access tokens expire in **30 minutes** — never assume a token is long-lived
- Refresh tokens are **hashed in DB** — never compare plaintext against DB directly
- The refresh cookie must be `httpOnly`, `Secure`, and `SameSite=None` — do not change these flags
- Never return the raw refresh token in JSON responses — cookie only
- Always delete the old refresh token before issuing a new one (rotation prevents replay attacks)
- Firebase ID token verification must happen server-side before trusting OAuth identity
- User `is_active` must be checked on every login attempt
- Minimum user age is **13 years**; users under 18 require parental consent
