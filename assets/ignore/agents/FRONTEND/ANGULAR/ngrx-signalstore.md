# NgRx SignalStore — Architectural Reference & Conventions

**Purpose:** A general, reusable guide for building state with **NgRx SignalStore** (`@ngrx/signals`) in Angular/Ionic apps. It captures the building blocks, the file conventions, the canonical async pattern, how to write composable cross-cutting features, and the best-practice / anti-pattern checklist. Use it as the architectural base for new stores and features — it is intentionally framework-level, not tied to any one domain.

---

## 1. Philosophy

SignalStore is a **signal-first, functional** state container. Prefer it over the classic NgRx Store/actions/reducers/effects when:

- State is read in templates as **signals** (zone-less / `OnPush`-friendly change detection).
- You want **local reasoning** — state, derived values, and the methods that change them live in one cohesive unit.
- Cross-cutting concerns (loading, request status, persistence, entities) should be **composed** from small reusable features rather than re-implemented per store.

Reach for plain Angular signals (`signal()` / `computed()` in a service) only for trivial, self-contained state. Once a slice grows derived values, async flows, or lifecycle, promote it to a SignalStore so it benefits from the shared feature library and DevTools.

**Rule of thumb:** one store per bounded context (a page, a domain aggregate, or a global app concern) — not one giant root store.

---

## 2. Building blocks

| Primitive | Source | Role |
|---|---|---|
| `signalStore(...)` | `@ngrx/signals` | Defines a store as an injectable, composed from features. |
| `signalStoreFeature(...)` | `@ngrx/signals` | Defines a **reusable** feature (state + computed + methods + hooks) to plug into stores. |
| `withState(initial)` | `@ngrx/signals` | Adds a state slice; each key becomes a signal. |
| `withComputed(store => ...)` | `@ngrx/signals` | Adds derived signals. |
| `withMethods(store => ...)` | `@ngrx/signals` | Adds methods (sync or `rxMethod`). |
| `withProps(store => ...)` | `@ngrx/signals` | Adds non-signal props (e.g. injected services, subjects). |
| `withHooks({ onInit, onDestroy })` | `@ngrx/signals` | Lifecycle hooks. |
| `patchState(store, ...updaters)` | `@ngrx/signals` | The **only** way to mutate state. |
| `getState(store)` | `@ngrx/signals` | Snapshot of the full state (for persistence, logging). |
| `rxMethod<T>(pipe)` | `@ngrx/signals/rxjs-interop` | A method backed by an RxJS pipeline (async flows). |
| `tapResponse(...)` | `@ngrx/operators` | Uniform `next/error/complete/finalize` handling inside a pipe. |
| `withEntities()` | `@ngrx/signals/entities` | Normalized entity collections (ids + entityMap + helpers). |
| `withDevtools(name)` | `@angular-architects/ngrx-toolkit` | Redux DevTools integration. |

---

## 3. File & folder convention

Keep each store and each feature split into small, single-responsibility files. This makes state shapes and mutations independently testable and reviewable.

```
feature-or-store/
├─ <name>.slice.ts      // state interface + initial<Name>Slice constant
├─ <name>.updaters.ts   // pure functions returning partial state / PartialStateUpdater
├─ <name>.feature.ts    // signalStoreFeature(...) — for reusable cross-cutting concerns
└─ <name>.store.ts       // signalStore(...) — for a concrete store
```

**Slice** — the shape and its initial value:
```ts
export interface RequestStatusSlice { requestStatus: 'idle' | 'pending' | 'fulfilled' | 'error'; }
export const initialRequestStatusSlice: RequestStatusSlice = { requestStatus: 'idle' };
```

**Updaters** — named, pure, no side effects:
```ts
export const setPending  = (): RequestStatusSlice => ({ requestStatus: 'pending' });
export const setFulfilled = (): RequestStatusSlice => ({ requestStatus: 'fulfilled' });
// For updates that depend on current state, return a PartialStateUpdater:
export const addItems = (items: Item[]): PartialStateUpdater<{ items: Item[] }> =>
  (state) => ({ items: [...state.items, ...items] });
```

---

## 4. State mutation — always `patchState` + named updaters

Never mutate signals directly and avoid inline object literals scattered through methods. Route every change through a **named updater** so mutations are declarative, searchable, and unit-testable:

```ts
patchState(store, setPending());
patchState(store, addItems(response.data.items));
patchState(store, updatePage());
```

Benefits: each mutation reads like a verb, updaters can be tested in isolation, and DevTools shows a meaningful trail.

---

## 5. The canonical async pattern — `rxMethod` + `tapResponse`

Standardize **every** server-backed method on the same shape so loading, errors, success, and cleanup behave identically across the app:

```ts
const loadItems = rxMethod<Query>((input$) =>
  input$.pipe(
    tap(() => {
      patchState(store, presentLoading());   // from withLoading
      patchState(store, setPending());        // from withRequestStatus
    }),
    switchMap((query) =>
      dataService.getItems(query).pipe(
        tapResponse({
          next:     (res) => patchState(store, addItems(res.data.items)),
          error:    (err: HttpErrorResponse) => {
            patchState(store, setError());
            toast.present(err?.error?.message);
          },
          complete: () => patchState(store, setFulfilled()),
          finalize: () => patchState(store, dismissLoading()),
        }),
      ),
    ),
  ),
);
```

Guidelines:
- Choose the flattening operator deliberately: `switchMap` (cancel previous — search/navigation), `concatMap` (queue — ordered writes), `exhaustMap` (ignore while in-flight — submit buttons), `mergeMap` (parallel — independent loads).
- `tapResponse` keeps the error inside the stream so the `rxMethod` subscription isn't torn down on failure.
- Expose a thin public method that forwards to the `rxMethod`, so callers get a clean signature: `loadItems: (q: Query) => loadItems(q)`.

---

## 6. Derived state — `withComputed`

Push all derivations into `withComputed` instead of recomputing in components:

```ts
withComputed((store) => ({
  query:        computed(() => `?page=${store.currentPage()}`),
  isEmpty:      computed(() => store.items().length === 0),
  totalCost:    computed(() => store.items().reduce((s, i) => s + i.price, 0)),
}));
```

Status flags belong here too (`isPending`, `isFulfilled`, `hasError` computed off a single `requestStatus` signal) — store one source of truth, derive the booleans.

---

## 7. Lifecycle — `withHooks`

Use `onInit` for wiring that must run when the store is created (subscriptions, hydration) and `onDestroy` for teardown. Register `effect()`s here for reactive side effects:

```ts
withHooks((store) => ({
  onInit: () => {
    // react to external streams; reset on logout, reload on login, etc.
    inject(SessionService).user$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => (user ? store.load() : store.reset()));
  },
  onDestroy: () => { /* cleanup */ },
}));
```

If the **same** init logic appears in several stores (e.g. "reset on logout"), that is a signal to extract it into a custom feature (§9) rather than copy-paste.

---

## 8. Dependency injection inside stores

Call `inject(...)` inside `withMethods`/`withProps`/`withHooks` factory functions (they run in an injection context). Use `withProps` to expose injected singletons as store props when methods/effects need them:

```ts
withProps(() => ({ _loading: inject(LoadingService), platform: inject(Platform) })),
withMethods((store) => ({
  refresh: () => store._loading.present(),
}));
```

Prefix internal/injected props with `_` to signal "not part of the public surface."

---

## 9. Reusable cross-cutting features (the feature library)

The biggest payoff of SignalStore is a small library of **composable features**. Each is a `signalStoreFeature` with a **typed overload signature** so host stores get full inference. Common ones to build/standardize:

```ts
// Typed overload: declares the feature's input (required) and output (provided) shapes.
export function withRequestStatus(): SignalStoreFeature<
  { state: {}; props: {}; methods: {} },
  {
    state: RequestStatusSlice;
    props: {};
    methods: { setPending(): void; setFulfilled(): void; setError(): void; resetRequestStatus(): void };
  }
>;
export function withRequestStatus() {
  return signalStoreFeature(
    withState(initialRequestStatusSlice),
    withComputed(({ requestStatus }) => ({
      isPending:   computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      hasError:    computed(() => requestStatus() === 'error'),
    })),
    withMethods((store) => ({
      setPending:        () => patchState(store, setPending()),
      setFulfilled:      () => patchState(store, setFulfilled()),
      setError:          () => patchState(store, setError()),
      resetRequestStatus:() => patchState(store, initialRequestStatusSlice),
    })),
  );
}
```

Suggested baseline features:

| Feature | Responsibility |
|---|---|
| `withRequestStatus()` | `idle/pending/fulfilled/error` + derived flags + setters. |
| `withLoading(name)` | `isLoading` state + present/dismiss/toggle; bridge to a global loading UI via an `effect` keyed by `name`. |
| `withBase(name)` | Store identity (`storeName`), shared utilities, and central `withDevtools(name)` so every store appears in DevTools. |
| `withLocalStorage(key)` | Hydrate from storage on init; persist `getState(store)` on change. **See pitfall #5.** |
| `withEntities()` | Use the official entities feature for normalized collections instead of hand-rolled arrays. |

**Persistence template** (note the trade-offs in §12):
```ts
export function withLocalStorage(key: string): SignalStoreFeature {
  return signalStoreFeature(
    withProps(() => ({ _storage: inject(StorageService) })),
    withHooks((store) => ({
      onInit: () => {
        // hydrate once
        store._storage.getItem(key).then((json) => json && patchState(store, JSON.parse(json)));
        // persist on change
        effect(() => { void store._storage.setItem(key, JSON.stringify(getState(store))); });
      },
    })),
  );
}
```

---

## 10. Composition

Features compose top-to-bottom; **order matters** — a feature can read state/props/methods declared by features above it.

```ts
export const ItemsStore = signalStore(
  { providedIn: 'root' },
  withBase('items'),            // provides storeName + devtools
  withState(initialItemsSlice),
  withLoading('items'),
  withRequestStatus(),
  withComputed((store) => ({ query: computed(() => `?page=${store.currentPage()}`) })),
  withMethods((store) => ({ /* rxMethods */ })),
  withHooks((store) => ({ onInit: () => {/* ... */} })),
);
```

**Parametrized & dependent features** — `withFeature` lets a later feature read an earlier one's output (e.g. configure a feature using `storeName()`):
```ts
withFeature((store) => withCollection({ name: store.storeName(), type: 'liked' })),
```
Use this for reusing the **same** feature multiple times with different configuration. Keep features small and orthogonal so composition stays predictable.

---

## 11. Providing & scoping

- `signalStore({ providedIn: 'root' }, ...)` → a global singleton. Use for app-wide concerns (session, cart, app shell).
- **Omit** `providedIn` and instead list the store in a **route's or component's `providers`** → a scoped instance whose lifetime matches that route/component. Use for page/feature state that should reset when the user leaves.

Pick scope intentionally and be consistent — a store that's root in one place and route-scoped in another is a common source of confusion.

---

## 12. Consumption in components

Inject the store and read signals/computed directly in templates; call methods for actions:

```ts
export class ItemsPage {
  readonly store = inject(ItemsStore);
  // template: @if (store.isPending()) {...} @for (item of store.items(); ...) {...}
  //           <button (click)="store.loadItems(store.query())">Load</button>
}
```

Because signals are read in the template, change detection stays fine-grained and `OnPush`/zoneless friendly. Don't copy store signals into local component fields — read them where you need them.

---

## 13. Testing

- **Updaters**: pure functions — test input → output directly, no store needed.
- **Store methods**: instantiate via `TestBed.inject(Store)` with mocked injected services; assert on state signals after calling methods. For `rxMethod`s, use `fakeAsync`/marble tests or provide deterministic mock observables.
- **Features**: test through a minimal host store created in the spec, asserting the feature's contributed state/computed/methods.

---

## 14. Best-practice checklist

- [ ] One store per bounded context; compose concerns from features.
- [ ] Every mutation goes through `patchState` + a **named pure updater**.
- [ ] Every async flow uses `rxMethod` + `tapResponse` with the right flattening operator.
- [ ] Derived values live in `withComputed`, not in components.
- [ ] Cross-cutting concerns (loading, status, persistence, entities) are **features**, not copy-paste.
- [ ] Features expose **typed overload signatures**.
- [ ] DevTools wired centrally (e.g. in a `withBase`).
- [ ] Scope (`root` vs route/component) chosen deliberately and documented.
- [ ] Public method signatures are clean; injected/internal props are `_`-prefixed.
- [ ] Repeated `onInit` logic is extracted into a feature.

---

## 15. Anti-patterns & pitfalls

1. **Bypassing `patchState`** (mutating signals directly or `.set()` on internal state) — breaks DevTools traceability and the updater convention.
2. **Re-implementing loading/status per store** instead of composing features — leads to drift and inconsistent UX.
3. **`rxMethod` argument plumbing mistakes** — e.g. ignoring the passed argument and reading a store signal instead, or passing a **signal reference** (`store.query`) where the **value** (`store.query()`) is required. Always confirm what the pipeline actually receives.
4. **Wrong flattening operator** — using `mergeMap`/`switchMap` for submit actions (allows duplicates / cancels writes). Match the operator to the intent (§5).
5. **Whole-state persistence on every change** — a `withLocalStorage`-style `effect` that stringifies `getState(store)` on every mutation causes write amplification and can leak sensitive fields into storage. Persist a **whitelisted sub-slice**, debounce writes, and never persist tokens/secrets.
6. **Debug `console.log` / debug `effect()`s left in** methods, updaters, and hooks — strip or gate behind an environment flag for production.
7. **Importing/referencing features or modules that don't exist** (half-finished composition) — a store that isn't reachable from the app entry graph won't be type-checked by an app `tsconfig` that only includes the `main.ts` graph, so broken WIP stores can pass the build unnoticed. Wire stores in and type-check the whole `src` (e.g. a separate `tsc --noEmit` over all files) to catch this.
8. **Mixing styles without intent** — plain-signal services and SignalStores can coexist, but decide where each is appropriate and document it, so "how state is done here" has one clear answer.
9. **Giant root store** — prefer several scoped stores over one global mega-store.

---

## 16. Summary

A healthy SignalStore architecture is: **small stores per context**, composed from a **typed, reusable feature library**, with **all mutations through named updaters + `patchState`**, **all async through `rxMethod` + `tapResponse`**, **derivations in `withComputed`**, **lifecycle in `withHooks`**, and **DevTools wired centrally**. Choose store scope deliberately, keep persistence narrow and debounced, extract repeated lifecycle into features, and keep the public surface clean. Following these conventions yields stores that look the same, behave the same, and are easy to test and extend.
