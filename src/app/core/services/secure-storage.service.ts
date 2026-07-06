import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const TOKEN_KEY = 'gpnews.accessToken';

/**
 * Token storage. On native (iOS Keychain / Android EncryptedSharedPreferences)
 * via @aparajita/capacitor-secure-storage. On web (dev only) the token is kept
 * in memory — never localStorage/sessionStorage (see auth.md security rules).
 *
 * The native value is cached in memory after the first read so the auth
 * interceptor isn't paying a JS<->native round-trip on every request.
 * setToken/clearToken update the cache synchronously with the native write,
 * so it can never drift from what's in the keychain; concurrent first reads
 * (e.g. the home page's forkJoin of categories + articles) share one
 * in-flight native read instead of firing two.
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly isNative = Capacitor.isNativePlatform();
  /** undefined = not yet loaded from native storage. */
  private cachedToken: string | null | undefined = this.isNative
    ? undefined
    : null;
  private pendingRead: Promise<string | null> | null = null;

  async setToken(token: string): Promise<void> {
    this.cachedToken = token;
    if (this.isNative) {
      await SecureStorage.set(TOKEN_KEY, token);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.isNative || this.cachedToken !== undefined) {
      return this.cachedToken ?? null;
    }
    if (!this.pendingRead) {
      this.pendingRead = SecureStorage.get(TOKEN_KEY).then((value) => {
        this.cachedToken = typeof value === 'string' ? value : null;
        this.pendingRead = null;
        return this.cachedToken;
      });
    }
    return this.pendingRead;
  }

  async clearToken(): Promise<void> {
    this.cachedToken = null;
    if (this.isNative) {
      // Throws if the key is absent — ignore that specific case.
      try {
        await SecureStorage.remove(TOKEN_KEY);
      } catch {
        /* key not present — nothing to clear */
      }
    }
  }
}
