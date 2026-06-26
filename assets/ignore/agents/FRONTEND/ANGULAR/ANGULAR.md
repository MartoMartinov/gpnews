---
trigger: always_on
---

This is the source code for the Angular framework. This guide outlines standard practices for AI agents working in this repository.

## Version policy

Use the latest Angular version **that the project's mandated libraries also support** — not blindly the absolute latest. Always check current versions and peer dependencies before scaffolding.

Steps before choosing the Angular version:
1. Check the latest published `@angular/core` and `@angular/cli`.
2. Check the peer-dependency range of every mandated library — at minimum **NgRx** (`@ngrx/signals`, see `./state.md`) and **Ionic** (`@ionic/angular`, see `../IONIC.md`). NgRx releases track Angular majors and often lag by one major right after an Angular release.
3. Pick the **highest Angular major that satisfies all of those peer ranges at once**. Do NOT force-install with `--legacy-peer-deps` to get a newer Angular than a core dependency supports — a mismatched peer on a framework-level package (state, UI kit) is a real runtime/build risk, not a warning to silence.
4. Within that chosen major, use the latest patch/minor.
5. If the absolute-latest Angular is held back only by one mandated library, record it as a one-line decision (which library, which version gap) and note the trivial upgrade path once that library catches up.

> Example (June 2026): Angular 22 was latest, but `@ngrx/signals` peered to `@angular/core@^21` with no v22 release. Correct choice = **Angular 21** (latest NgRx-compatible), not Angular 22 forced past its peer.

The same rule applies on later upgrades: bump the framework only when the mandated stack has compatible releases, then `ng update` everything together.

## Environment
- want to have envireonments for development (localhost), demo, dev, staging and production.
- generate the required files in environments folder
- setup in angular.json accordingly
- for production environment dont want any console.log messages visible.

## Key Documentation

- [Building and Testing](./coding-instuctions.md): definitive guide for running targets.
- [Coding Standards](./coding-standarts.md): style guide for TypeScript and other files.
- [Commit Guidelines](./commit-message-guidelines.md): format for commit messages and PR titles.

## Testing

- **Zoneless & Async-First:** Assume a zoneless environment where state changes schedule updates asynchronously.
  - **Do NOT** use `fixture.detectChanges()` to manually trigger updates.
  - **ALWAYS** use the "Act, Wait, Assert" pattern:
    1. **Act:** Update state or perform an action.
    2. **Wait:** `await fixture.whenStable()` to allow the framework to process the scheduled update.
    3. **Assert:** Verify the output.
- To keep tests fast, minimize the need for waiting:
  - Use `useAutoTick()` (from `packages/private/testing/src/utils.ts`) to fast-forward time via the mock clock.
- When waiting is necessary, use real async tests (`it('...', async () => { ... })`) along with:
  - `await timeout(ms)` (from `packages/private/testing/src/utils.ts`) to wait a specific number of milliseconds.
  - `await fixture.whenStable()` to wait for framework stability.

## Pull Requests

- Use the `gh` CLI (GitHub CLI) for creating and managing pull requests.


# Authentication

- [Angular Security](./security.md)


# Translations

- [Translations](./translations.md)
