import { Injectable, signal } from '@angular/core';

/**
 * Tracks browser connectivity using the Navigator.onLine API.
 * The `online` signal is true when the device has network access.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {
  readonly online = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
  }
}
