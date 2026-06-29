import { computed, inject } from '@angular/core';
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
import { pipe, switchMap, tap } from 'rxjs';

import { PollService } from '../../core/services/poll.service';
import { Poll } from '../../shared/models';
import { withBase } from '../features';

async function toast(
  ctrl: ToastController,
  message: string,
  color: 'success' | 'danger',
): Promise<void> {
  const t = await ctrl.create({ message, duration: 2500, position: 'bottom', color });
  await t.present();
}

interface PollsState {
  polls: Poll[];
  activePoll: Poll | null;
  loading: boolean;
  voting: boolean;
}

const initialState: PollsState = {
  polls: [],
  activePoll: null,
  loading: false,
  voting: false,
};

export const PollsStore = signalStore(
  { providedIn: 'root' },
  withBase('polls'),
  withState(initialState),
  withComputed(({ polls }) => ({
    unvotedCount: computed(() => polls().filter((p) => !p.voted).length),
  })),
  withProps(() => ({
    _polls: inject(PollService),
    _toast: inject(ToastController),
  })),
  withMethods((store) => ({
    loadPolls: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          store._polls.getPolls().pipe(
            tapResponse({
              next: (polls) => patchState(store, { polls, loading: false }),
              error: () => {
                patchState(store, { loading: false });
                void toast(store._toast, 'Неуспешно зареждане. Провери интернет връзката.', 'danger');
              },
            }),
          ),
        ),
      ),
    ),

    loadPoll: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { activePoll: null, loading: true })),
        switchMap((id) =>
          store._polls.getPoll(id).pipe(
            tapResponse({
              next: (activePoll) => patchState(store, { activePoll, loading: false }),
              error: () => {
                patchState(store, { loading: false });
                void toast(store._toast, 'Анкетата не може да бъде заредена.', 'danger');
              },
            }),
          ),
        ),
      ),
    ),

    castVote: rxMethod<{ pollId: string; optionId: string }>(
      pipe(
        tap(() => patchState(store, { voting: true })),
        switchMap(({ pollId, optionId }) =>
          store._polls.castVote(pollId, optionId).pipe(
            tapResponse({
              next: (updated) => {
                patchState(store, {
                  activePoll: updated,
                  voting: false,
                  polls: store.polls().map((p) => (p.id === updated.id ? updated : p)),
                });
                void toast(store._toast, 'Гласът ти е записан', 'success');
              },
              error: () => {
                patchState(store, { voting: false });
                void toast(store._toast, 'Грешка при гласуването. Опитай отново.', 'danger');
              },
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks((store) => ({
    onInit: () => store.loadPolls(undefined),
  })),
);
