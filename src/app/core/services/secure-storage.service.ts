import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const TOKEN_KEY = 'gpnews.accessToken';

/**
 * Token storage. On native (iOS Keychain / Android EncryptedSharedPreferences)
 * via @aparajita/capacitor-secure-storage. On web (dev only) the token is kept
 * in memory — never localStorage/sessionStorage (see auth.md security rules).
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly isNative = Capacitor.isNativePlatform();
  /** In-memory web fallback (cleared on reload — acceptable for dev). */
  private memoryToken: string | null = null;

  async setToken(token: string): Promise<void> {
    if (this.isNative) {
      await SecureStorage.set(TOKEN_KEY, token);
    } else {
      this.memoryToken = token;
    }
  }

  async getToken(): Promise<string | null> {
    if (this.isNative) {
      const value = await SecureStorage.get(TOKEN_KEY);
      return typeof value === 'string' ? value : null;
    }
    return this.memoryToken;
  }

  async clearToken(): Promise<void> {
    if (this.isNative) {
      // Throws if the key is absent — ignore that specific case.
      try {
        await SecureStorage.remove(TOKEN_KEY);
      } catch {
        /* key not present — nothing to clear */
      }
    } else {
      this.memoryToken = null;
    }
  }
}
