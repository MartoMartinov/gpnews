import { computed, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../shared/models';
import { withBase } from '../features';

interface NotificationsState {
  items: AppNotification[];
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  loading: false,
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withBase('notifications'),
  withState(initialState),
  withComputed(({ items }) => ({
    unreadCount: computed(() => items().filter((n) => !n.read).length),
  })),
  withProps(() => ({
    _notif: inject(NotificationService),
    _toast: inject(ToastController),
  })),
  withMethods((store) => ({
    loadNotifications: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          store._notif.getNotifications().pipe(
            tapResponse({
              next: (items) => patchState(store, { items, loading: false }),
              error: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    markRead: rxMethod<string>(
      pipe(
        switchMap((id) =>
          store._notif.markRead(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, {
                  items: store.items().map((n) => (n.id === id ? { ...n, read: true } : n)),
                }),
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    markAllRead: rxMethod<void>(
      pipe(
        switchMap(() =>
          store._notif.markAllRead().pipe(
            tapResponse({
              next: () => {
                patchState(store, { items: store.items().map((n) => ({ ...n, read: true })) });
                void (async () => {
                  const t = await store._toast.create({
                    message: 'Всички известия са отбелязани',
                    duration: 2000,
                    position: 'bottom',
                    color: 'success',
                  });
                  await t.present();
                })();
              },
              error: () => {},
            }),
          ),
        ),
      ),
    ),
  })),
);
