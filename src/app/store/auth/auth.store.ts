import { computed } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { exhaustMap, pipe, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SecureStorageService } from '../../core/services/secure-storage.service';
import { StorageService } from '../../core/services/storage.service';
import { AuthMetadata, AuthResponse, Credentials, RegisterData } from '../../shared/models';
import { withBase } from '../features';
import { withRequestStatus } from '../features';
import { initialAuthSlice } from './auth.slice';
import { clearSession, setInitialized, setSession } from './auth.updaters';

const AUTH_DATA = 'gpnews.authData';
/** Auto-logout timer is capped to avoid absurdly long timeouts. */
const MAX_TIMER_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withBase('auth'),
  withState(initialAuthSlice),
  withRequestStatus(),
  withComputed(({ user }) => ({
    isLoggedIn: computed(() => !!user()),
  })),
  withProps(() => ({
    _auth: inject(AuthService),
    _secure: inject(SecureStorageService),
    _storage: inject(StorageService),
    _router: inject(Router),
    _toast: inject(ToastController),
    _timer: { handle: null as ReturnType<typeof setTimeout> | null },
  })),
  withMethods((store) => {
    const showToast = async (message: string, color: 'success' | 'danger' | 'medium') => {
      const t = await store._toast.create({ message, duration: 2400, position: 'bottom', color });
      await t.present();
    };

    const clearTimer = () => {
      if (store._timer.handle) {
        clearTimeout(store._timer.handle);
        store._timer.handle = null;
      }
    };

    const clearPersisted = async () => {
      await store._secure.clearToken();
      await store._storage.remove(AUTH_DATA);
    };

    // Forward-declared so scheduleAutoLogout can call it.
    const doLogout = async (navigate: boolean) => {
      clearTimer();
      await clearPersisted();
      patchState(store, clearSession());
      if (navigate) {
        store._router.navigateByUrl('/tabs/home', { replaceUrl: true });
      }
    };

    const scheduleAutoLogout = (iso: string) => {
      clearTimer();
      const ms = new Date(iso).getTime() - Date.now();
      if (ms <= 0) {
        void doLogout(true);
        return;
      }
      store._timer.handle = setTimeout(() => void doLogout(true), Math.min(ms, MAX_TIMER_MS));
    };

    const applySession = async (res: AuthResponse) => {
      await store._secure.setToken(res.accessToken);
      const meta: AuthMetadata = { user: res.user, accessExpiresAt: res.accessExpiresAt };
      await store._storage.set(AUTH_DATA, meta);
      patchState(store, setSession(res.user, res.accessExpiresAt));
      scheduleAutoLogout(res.accessExpiresAt);
    };

    const onAuthSuccess = (res: AuthResponse, welcome: boolean) => {
      void (async () => {
        await applySession(res);
        store.setFulfilled();
        if (welcome) {
          await showToast('Добре дошъл, ' + res.user.name.split(' ')[0] + '!', 'success');
        }
        store._router.navigateByUrl('/tabs/home', { replaceUrl: true });
      })();
    };

    const onAuthError = (err: HttpErrorResponse) => {
      store.setError();
      void showToast(err?.error?.message || 'Възникна грешка. Опитай отново.', 'danger');
    };

    return {
      login: rxMethod<Credentials>(
        pipe(
          tap(() => store.setPending()),
          exhaustMap((creds) =>
            store._auth.login(creds).pipe(
              tapResponse({
                next: (res) => onAuthSuccess(res, true),
                error: onAuthError,
              }),
            ),
          ),
        ),
      ),

      register: rxMethod<RegisterData>(
        pipe(
          tap(() => store.setPending()),
          exhaustMap((data) =>
            store._auth.register(data).pipe(
              tapResponse({
                next: (res) => onAuthSuccess(res, true),
                error: onAuthError,
              }),
            ),
          ),
        ),
      ),

      /** Best-effort server logout, then clear local session. */
      logout: () => {
        store._auth.logout().subscribe({ next: () => {}, error: () => {} });
        void (async () => {
          await doLogout(true);
          await showToast('Излезе от профила', 'medium');
        })();
      },

      /** Continue without an account. */
      continueAsGuest: () => {
        store._router.navigateByUrl('/tabs/home', { replaceUrl: true });
      },

      /** Startup auto-login from stored token + metadata. */
      bootstrap: async () => {
        const token = await store._secure.getToken();
        const meta = await store._storage.get<AuthMetadata>(AUTH_DATA);
        if (token && meta && new Date(meta.accessExpiresAt).getTime() > Date.now()) {
          patchState(store, setSession(meta.user, meta.accessExpiresAt));
          scheduleAutoLogout(meta.accessExpiresAt);
        } else {
          await clearPersisted();
          patchState(store, clearSession());
        }
        patchState(store, setInitialized());
      },

      /** Called by the interceptor after a successful token refresh. */
      applyAuthResponse: (res: AuthResponse) => applySession(res),

      /** Called by the interceptor when refresh fails. */
      forceLogout: () => void doLogout(true),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      void store.bootstrap();
    },
  })),
);
