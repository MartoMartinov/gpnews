---
trigger: always_on
---

This is the source code for the Angular framework. This guide outlines standard practices for AI agents working in this repository.

Always use the latest version as of the date of initialization. Check for the current version always.

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
