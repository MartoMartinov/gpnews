# Translations / i18n

## Library

**`@ngx-translate/core` v17** with **`@ngx-translate/http-loader` v17**.

Not using Angular's built-in i18n system.

---

## Translation Files

- **Location**: `src/assets/i18n/`
- **Format**: JSON (flat key/value, loaded via HTTP)
- **Naming**: one file per language — `en.json`, `bg.json`, etc.
- **Key structure**: dot-notation hierarchy, e.g. `CONSTANTS.ERRORS.FORM.REQUIRED`

---

## Initialization

Configured in `app.config.ts` using functional providers (standalone components pattern):

```ts
provideTranslateService({
  loader: provideTranslateHttpLoader({
    prefix: '/assets/i18n/',
    suffix: '.json',
  }),
  fallbackLang: 'en',
  lang: 'en',
}),
```

---

## TranslationService

A wrapper service (`src/app/services/translation/translation.service.ts`) handles language lifecycle:

- `initLanguage()` — called once on app startup via the translate guard
- `updateLanguage(lang: string)` — switches language at runtime

### Language Detection Order (in `initLanguage`)

1. Query parameter: `?lang=en`
2. Ionic Storage key: `'language'`
3. Default: `en`

### Persistence

Language selection is saved to **Ionic Storage** (IndexedDB → localStorage fallback) under the key `'language'`. It persists across sessions.

---

## Translate Guard

All routes must pass through `translationGuard` before activation. It ensures the language is fully initialized before any component renders.

```ts
// app.routes.ts — applied to every route
canActivate: [translationGuard, authGuard]  // translationGuard always first
```

The guard:
1. Checks if language is already initialized via `translationService.language()` signal
2. If not, awaits `translationService.initLanguage()`
3. Resolves `true` to allow navigation

---

## Usage in Templates

Use the `translate` pipe:

```html
{{ 'CONSTANTS.CLOSE' | translate }}

<img [attr.alt]="'APP_NAME' | translate" />
```

`TranslatePipe` is re-exported via `SharedModule` — import `SharedModule` in any component that needs it.

---

## Usage in TypeScript

Use `TranslateService.instant()` for synchronous access (safe only after guard has run):

```ts
// Inline
this.translateService.instant('CONSTANTS.OK')

// Helper pattern (common in services with many translation calls)
const t = (key: string) => this.translateService.instant(key);
await this.alertService.presentAlert(
  t('AUTH.LOGIN.FAILED.TITLE'),
  '',
  t('AUTH.LOGIN.FAILED.MESSAGE'),
  [{ text: t('CONSTANTS.OK') }],
);
```

Use `translateService.get(key)` (returns `Observable`) only when the translation may not be loaded yet.

---

## Document & Date Locale

When language is set, also update:

```ts
document.documentElement.lang = lang;  // sets <html lang="...">
dayjs.locale(lang);                     // aligns date formatting
```

---

## Rules for Agents

- All user-visible strings must use translation keys — no hardcoded strings in templates or services
- `translationGuard` must be the **first** guard in every route's `canActivate` array
- Use `instant()` in component/service code only inside or after the guard has resolved
- New translation keys go in **all** existing language JSON files simultaneously
- Key names must be `SCREAMING_SNAKE_CASE` grouped by feature: `FEATURE.SECTION.KEY`
- Never call `translateService.use()` directly — always go through `translationService.updateLanguage()`
- Language files are loaded on-demand by ngx-translate — no manual caching needed
