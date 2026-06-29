import { inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
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
    _toast: inject(ToastController),
  })),
  withMethods((store) => {
    const toast = async (message: string, color: 'success' | 'danger') => {
      const t = await store._toast.create({ message, duration: 2400, position: 'bottom', color });
      await t.present();
    };

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
                  void toast('Промените са запазени', 'success');
                },
                error: (err: { error?: { message?: string } }) => {
                  store.setError();
                  void toast(err?.error?.message ?? 'Грешка при запазване', 'danger');
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
                  void toast('Паролата е сменена успешно', 'success');
                },
                error: (err: { error?: { message?: string } }) => {
                  patchState(store, { pwPending: false });
                  void toast(err?.error?.message ?? 'Грешка при смяна на паролата', 'danger');
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
                  void toast('Грешка при изтриване', 'danger');
                },
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
