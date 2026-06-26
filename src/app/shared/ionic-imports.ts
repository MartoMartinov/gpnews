import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

/**
 * Common Ionic standalone components, grouped so pages import one symbol
 * instead of a long per-file list. Angular flattens nested arrays in a
 * component's `imports`, so usage is: `imports: [IONIC_IMPORTS, ...]`.
 *
 * Keep this to the broadly-used page-shell building blocks. Rare or
 * page-specific Ionic components (e.g. IonTabs, IonModal, IonRefresher)
 * are still imported directly in the component that needs them, so the
 * shared set doesn't bloat every bundle with components only one page uses.
 */
export const IONIC_IMPORTS = [
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonLabel,
] as const;
