import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'error';

export interface RequestStatusSlice {
  requestStatus: RequestStatus;
}

const initialRequestStatusSlice: RequestStatusSlice = { requestStatus: 'idle' };

/**
 * idle/pending/fulfilled/error state + derived flags + setters.
 * Type is inferred so the computed signals (isPending, …) are exposed.
 */
export function withRequestStatus() {
  return signalStoreFeature(
    withState(initialRequestStatusSlice),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      hasError: computed(() => requestStatus() === 'error'),
    })),
    withMethods((store) => ({
      setPending: () => patchState(store, { requestStatus: 'pending' as const }),
      setFulfilled: () => patchState(store, { requestStatus: 'fulfilled' as const }),
      setError: () => patchState(store, { requestStatus: 'error' as const }),
      resetRequestStatus: () => patchState(store, initialRequestStatusSlice),
    })),
  );
}
