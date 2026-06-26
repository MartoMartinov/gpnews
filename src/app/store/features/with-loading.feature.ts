import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export interface LoadingSlice {
  isLoading: boolean;
}

const initialLoadingSlice: LoadingSlice = { isLoading: false };

/** Simple loading flag + present/dismiss/toggle. Type inferred. */
export function withLoading() {
  return signalStoreFeature(
    withState(initialLoadingSlice),
    withComputed(({ isLoading }) => ({
      isBusy: computed(() => isLoading()),
    })),
    withMethods((store) => ({
      presentLoading: () => patchState(store, { isLoading: true }),
      dismissLoading: () => patchState(store, { isLoading: false }),
      toggleLoading: () => patchState(store, (s) => ({ isLoading: !s.isLoading })),
    })),
  );
}
