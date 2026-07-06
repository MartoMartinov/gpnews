import { computed, inject } from '@angular/core';
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
import { filter, pipe, switchMap, tap } from 'rxjs';

import { PollService } from '../../core/services/poll.service';
import { ToastService } from '../../core/services/toast.service';
import { Poll } from '../../shared/models';
import { withBase } from '../features';

const POLLS_PAGE_SIZE = 12;

interface PollsState {
  polls: Poll[];
  activePoll: Poll | null;
  loading: boolean;
  voting: boolean;
  pollsPage: number;
  pollsHasMore: boolean;
  pollsLoadingMore: boolean;
}

const initialState: PollsState = {
  polls: [],
  activePoll: null,
  loading: false,
  voting: false,
  pollsPage: 1,
  pollsHasMore: true,
  pollsLoadingMore: false,
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
    _toast: inject(ToastService),
  })),
  withMethods((store) => ({
    loadPolls: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, pollsPage: 1, pollsHasMore: true })),
        switchMap(() =>
          store._polls.getPolls(1, POLLS_PAGE_SIZE).pipe(
            tapResponse({
              next: (polls) =>
                patchState(store, {
                  polls,
                  loading: false,
                  pollsHasMore: polls.length === POLLS_PAGE_SIZE,
                }),
              error: () => {
                patchState(store, { loading: false });
                void store._toast.error('Неуспешно зареждане. Провери интернет връзката.');
              },
            }),
          ),
        ),
      ),
    ),

    loadMorePolls: rxMethod<void>(
      pipe(
        filter(() => store.pollsHasMore() && !store.pollsLoadingMore() && !store.loading()),
        tap(() => patchState(store, { pollsLoadingMore: true })),
        switchMap(() =>
          store._polls.getPolls(store.pollsPage() + 1, POLLS_PAGE_SIZE).pipe(
            tapResponse({
              next: (more) =>
                patchState(store, {
                  polls: [...store.polls(), ...more],
                  pollsPage: store.pollsPage() + 1,
                  pollsHasMore: more.length === POLLS_PAGE_SIZE,
                  pollsLoadingMore: false,
                }),
              error: () => {
                patchState(store, { pollsLoadingMore: false });
                void store._toast.error('Неуспешно зареждане на още анкети.');
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
                void store._toast.error('Анкетата не може да бъде заредена.');
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
                void store._toast.success('Гласът ти е записан');
              },
              error: () => {
                patchState(store, { voting: false });
                void store._toast.error('Грешка при гласуването. Опитай отново.');
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
