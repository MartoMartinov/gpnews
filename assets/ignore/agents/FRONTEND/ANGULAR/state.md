- Use NgRx SignalStore if it is not stated otherwise
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

> **Version note:** `@ngrx/signals` peers to a specific Angular major and often trails the latest Angular release by one major. Because NgRx is mandated here, it caps the Angular version — see the Version policy in `./ANGULAR.md`. Pick the latest Angular major that NgRx (and Ionic) support; never force NgRx past its peer range with `--legacy-peer-deps`.

# NgRx SignalStore — Architectural Reference & Conventions
- look into `./ngrx-signalstore.md`
