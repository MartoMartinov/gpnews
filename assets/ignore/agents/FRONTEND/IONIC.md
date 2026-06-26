# Ionic

Always build the app with ionic/cli using blank project template if it is not stated otherwise.

## Version

**`@ionic/angular` ** latest version as of the day of initiating the app with Angular standalone components. Check for current up to date version frist.

---

## Capacitor

**`@capacitor/core`** if not already installed install the latest version as of the day of initiating the app with Angular standalone components. Check for current up to date version frist.
**`@capacitor/app`** if not already installed install the library must always be part of the capacitor app.

**appId in `capacitor.config.ts`** follows reverse-domain notation: `com.<brand>.<descriptor>`

Rules:
- Always use the brand or domain name as the middle segment — never a generic placeholder
- The last segment describes what the app does or is — never use `.app` as a suffix
- Strip filler words (`the`, `a`, `an`) from both segments
- Use full words where the result stays readable; abbreviate only if the total ID exceeds ~40 characters
- Lowercase, no hyphens, no underscores — dots only as separators
- Must be unique enough to pass App Store / Google Play registration

Examples:
- `Example` (single word, brand = product) → `com.example.app` is wrong → `com.example.main` or just ask the client for their domain
- `Example Name` (brand + product) → `com.example.name`
- `Practical Machinist Trivia` → `com.practicalmachinist.trivia`
- `Blue Sky Weather` → `com.bluesky.weather`
- `TurboCharge Fleet Manager` (long) → `com.turbocharge.fleetmanager`

If the client owns a domain (e.g. `practicalmachinist.com`), always derive the appId from it: `com.practicalmachinist.<descriptor>`.

- if app uses Push notifications add to capacitor.config.ts:
```
 plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
```

---

## Shared Ionic imports (reduce per-component clutter)

Standalone components must list every Ionic component they use in `imports`, which gets verbose fast (`IonHeader`, `IonToolbar`, `IonTitle`, `IonContent`, …) repeated across every page. To cut the clutter **without** an NgModule (NgModules are disallowed — see `./ANGULAR/coding-instuctions.md`), group the commonly-used Ionic components into a single exported const array and reference it via Angular's nested-array flattening in `imports`.

- File: `src/app/shared/ionic-imports.ts`
  ```ts
  import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton, IonIcon, IonLabel } from '@ionic/angular/standalone';

  export const IONIC_IMPORTS = [
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonBackButton, IonIcon, IonLabel,
  ] as const;
  ```
- Usage in a component (Angular flattens nested arrays in `imports`):
  ```ts
  imports: [IONIC_IMPORTS, EmptyStateComponent],
  ```

Rules:
- Keep `IONIC_IMPORTS` to **broadly-used page-shell** components. Page-specific / rare ones (e.g. `IonTabs`, `IonModal`, `IonRefresher`, `IonApp`, `IonRouterOutlet`) stay imported directly in the one component that needs them — don't bloat every bundle with components only one page uses.
- Do **not** wrap this in an NgModule. The const-array barrel is the standalone-idiomatic equivalent and preserves tree-shaking.
- Grow the shared set as more components become broadly used; trim ones that fall out of common use.

---

## Global Styles Entry Point (`src/global.scss`)

This file orchestrates the full style stack in order:

```scss
// 1. Ionic core (required)
@import "@ionic/angular/css/core.css";
@import "@ionic/angular/css/normalize.css";
@import "@ionic/angular/css/structure.css";
@import "@ionic/angular/css/typography.css";

// 2. Optional Ionic utilities (import only what you need)
@import "@ionic/angular/css/padding.css";
@import "@ionic/angular/css/float-elements.css";
@import "@ionic/angular/css/text-alignment.css";

// 3. Custom fonts
@import "theme/custom/base/fonts";

// 4. Design tokens / Ionic variable overrides
@import "theme/variables";

// 5. Ionic component overrides
@import "theme/ionic/index";

// 6. Shared component classes
@import "theme/custom/base/global";
```

---

## Theme Folder Structure

```
src/theme/
  variables.scss        ← All CSS custom properties (design tokens + Ionic overrides)
  ionic/
    _index.scss         ← Ionic component-level style overrides
  custom/
    base/
      _fonts.scss       ← Font imports (@font-face or Google Fonts)
      _global.scss      ← Shared component CSS classes (buttons, inputs, cards, badges)
      _normalize.scss   ← Rich-text content normalization (scoped to .article-content)
  swiper/
    _index.scss         ← Swiper slider overrides (if used)
  tailwind/
    _index.scss         ← Tailwind @layer base overrides (usually empty)
```

---

## Design Tokens (`src/theme/variables.scss`)

Override Ionic's CSS variables and define project tokens here. All values in one place.

```scss
:root {
  // Ionic color system overrides
  --ion-color-primary:          #your-primary;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-secondary:        #your-secondary;

  // Surface colors
  --ion-background-color:  #0d0f14;
  --ion-card-background:   #161920;
  --ion-item-background:   #161920;
  --ion-toolbar-background:#0d0f14;

  // Text
  --ion-text-color:        #f1f5f9;

  // Tab bar
  --ion-tab-bar-color-selected: #your-accent;

  // Typography
  --ion-font-family: 'YourFont', sans-serif;

  // Project tokens (used in component SCSS and Tailwind var() refs)
  --color-dark-bg:     #0d0f14;
  --color-dark-card:   #161920;
  --color-dark-border: #1e2330;
  --color-text-muted:  #6b7280;
}
```

Mirror all color values in both `variables.scss` (for `var()` access) and `tailwind.css` `@theme` block (for Tailwind utilities).

---

## Ionic Component Overrides (`src/theme/ionic/_index.scss`)

Override Ionic component defaults globally. Target components by tag name or Ionic CSS parts.

```scss
// Buttons
ion-button {
  --border-radius: 8px;
  font-weight: 600;
}

// Cards
ion-card {
  --border-radius: 12px;
  margin: 0;
}

// Lists
ion-list {
  padding: 16px;
  background: var(--color-dark-card);
}

ion-item {
  --background: var(--color-dark-card);
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

// Header/Toolbar
ion-toolbar {
  --border-width: 0 0 1px 0;
  --border-color: var(--color-dark-border);
}
```

Use `::part()` for Ionic shadow DOM parts:

```scss
ion-tab-bar {
  &::part(background) {
    border-top: 1px solid var(--color-dark-border);
  }
}
```

---

## Shared Component Classes (`src/theme/custom/base/_global.scss`)

Define reusable CSS classes that are too complex for Tailwind utilities alone.

### Pattern: Prefix with project abbreviation

Use the initials of the app name as the prefix (e.g. `G.P. News` → `gp-`).

```scss
// Inputs
.gp-input { ... }
.gp-input__label { ... }
.gp-input__row { ... }

// Buttons
.gp-btn-primary { ... }
.gp-btn-clear { ... }

// Cards
.gp-card { ... }

// Badges
.gp-badge-success { ... }
.gp-badge-danger { ... }
.gp-badge-warning { ... }

// Error states
.gp-error { ... }
```

---

## Font Setup (`src/theme/custom/base/_fonts.scss`)

Import fonts here. Use variable fonts where possible to reduce file size.

```scss
// Google Fonts example (variable weight)
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@100..900&display=swap');

// Set globally
* {
  font-family: var(--ion-font-family);
}
```

---

## `angular.json` Styles Array (correct order)

```json
"styles": [
  "src/tailwind.css",
  "src/global.scss"
]
```

Never swap this order — Tailwind utilities must load before Ionic styles so Ionic specificity can override where necessary.

---

## Rules for Agents

- All Ionic CSS variable overrides go in `theme/variables.scss` — not in component SCSS files
- Ionic component overrides (tag-level) go in `theme/ionic/_index.scss`
- Shared component classes (`.gp-*`) go in `theme/custom/base/_global.scss`
- Use `::part()` selector for Ionic shadow DOM styling — never use deep selectors (`/deep/`, `::ng-deep`)
- Font family must be set via `--ion-font-family` in `:root` and applied globally via `*`
- Never override Ionic component internals from component-scoped SCSS — use the global theme files
