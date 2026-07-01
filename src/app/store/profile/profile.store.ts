import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthStore } from '../auth/auth.store';
import { withBase } from '../features';
import { withRequestStatus } from '../features';

interface ProfileState {
  pwPending: boolean;
  deletePending: boolean;
}

const initialState: ProfileState = { pwPending: false, deletePending: false };

/** Route-scoped store for profile editing (name, password, delete account). */
export const ProfileStore = signalStore(
  withBase('profile'),
  withState(initialState),
  withRequestStatus(),
  withProps(() => ({
    _auth: inject(AuthService),
    _authStore: inject(AuthStore),
    _toast: inject(ToastService),
  })),
  withMethods((store) => {
    const toastOpts = { duration: 2400, position: 'top' as const };

    return {
      saveName: rxMethod<string>(
        pipe(
          tap(() => store.setPending()),
          switchMap((name) =>
            store._auth.updateProfile(name).pipe(
              tapResponse({
                next: ({ user }) => {
                  store.setFulfilled();
                  store._authStore.updateUser(user);
                  void store._toast.success('Промените са запазени', toastOpts);
                },
                error: (err: { error?: { message?: string } }) => {
                  store.setError();
                  void store._toast.error(
                    err?.error?.message ?? 'Грешка при запазване',
                    toastOpts,
                  );
                },
              }),
            ),
          ),
        ),
      ),

      changePassword: rxMethod<{ current: string; password: string }>(
        pipe(
          tap(() => patchState(store, { pwPending: true })),
          switchMap((data) =>
            store._auth.changePassword(data.current, data.password).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { pwPending: false });
                  void store._toast.success('Паролата е сменена успешно', toastOpts);
                },
                error: (err: { error?: { message?: string } }) => {
                  patchState(store, { pwPending: false });
                  void store._toast.error(
                    err?.error?.message ?? 'Грешка при смяна на паролата',
                    toastOpts,
                  );
                },
              }),
            ),
          ),
        ),
      ),

      deleteAccount: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { deletePending: true })),
          switchMap(() =>
            store._auth.deleteAccount().pipe(
              tapResponse({
                next: () => {
                  patchState(store, { deletePending: false });
                  store._authStore.logout();
                },
                error: () => {
                  patchState(store, { deletePending: false });
                  void store._toast.error('Грешка при изтриване', toastOpts);
                },
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
