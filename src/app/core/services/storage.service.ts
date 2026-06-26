import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Wrapper over @ionic/storage-angular (encrypted IndexedDB) for non-sensitive
 * user metadata. Tokens never go here — see SecureStorageService.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(Storage);
  private ready: Promise<void> | null = null;

  private ensureReady(): Promise<void> {
    if (!this.ready) {
      this.ready = this.storage.create().then(() => undefined);
    }
    return this.ready;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureReady();
    return (await this.storage.get(key)) as T | null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureReady();
    await this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.ensureReady();
    await this.storage.remove(key);
  }
}
