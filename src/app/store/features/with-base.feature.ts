import { signalStoreFeature, withProps } from '@ngrx/signals';

/**
 * Store identity. Carries a `storeName` prop used for logging/debugging and
 * as a key for future cross-cutting features (persistence, devtools).
 */
export function withBase(name: string) {
  return signalStoreFeature(withProps(() => ({ storeName: name })));
}
