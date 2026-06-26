# Tailwind CSS

## Version

**Tailwind CSS v4+** with `@tailwindcss/postcss` (no `tailwind.config.ts` — all configuration lives in a `@theme` block).

---

## Recommended Setup for Angular 17+ (Better Than Separate CLI Build)

The reference project (`thegameoftrading`) uses a separate Tailwind CLI build step that outputs `tailwind-output.css` and requires `concurrently` to run two processes in parallel. **Do not replicate this pattern.**

Angular 17+ uses the `application` builder (esbuild) which has **native PostCSS support**. Reference the Tailwind source file directly — Angular processes it automatically.

### Setup Steps

**1. Install packages**

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

**2. `postcss.config.js` (project root)**

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**3. `src/tailwind.css` (source file — NOT a compiled output)**

> **Why `.css` and not `.scss`?** Angular's build pipeline routes files by extension: `.scss` files go through the **Sass compiler first**, then PostCSS. Sass would try to resolve `@import "tailwindcss"` as a SCSS module, fail, and throw an error before PostCSS ever runs. `.css` files skip Sass and go **directly to PostCSS**, where `@tailwindcss/postcss` processes `@import "tailwindcss"`, `@theme`, and `@layer`. This file contains no Sass syntax and must bypass the Sass compiler. Keep all Sass features (`variables.scss`, `global.scss`, mixins) in `.scss` files — `tailwind.css` is strictly PostCSS territory.

```css
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css' layer(utilities);

@theme {
  /* Brand colors */
  --color-primary: #your-primary;
  --color-dark-bg: #your-bg;
  --color-dark-card: #your-card;

  /* Typography */
  --font-sans: 'YourFont', sans-serif;
}

@layer utilities {
  /* Project-specific utility classes */
  .container {
    @apply max-w-7xl mx-auto px-4;
  }

  /* Use editor class where is expected to have editor-specific styles (eg. Markdown editor) like content comming from backend as html, (in pages like post, news, etc.)
  Modify sizes according to the design and as you deem fit
  */

  .editor {
    a {
      @apply text-blue-500 underline;
    }
    ul,
    ol {
      @apply list-disc list-inside;
    }
    ol {
      @apply list-decimal;
    }
    li {
      @apply ml-4;
    }
    h1 {
      @apply text-2xl font-bold;
    }
    h2 {
      @apply text-xl font-bold;
    }
    h3 {
      @apply text-lg font-bold;
    }
    h4 {
      @apply text-base font-bold;
    }
    h5 {
      @apply text-sm font-bold;
    }
    h6 {
      @apply text-xs font-bold;
    }
    hr {
      @apply border-line my-4;
    }
    p {
      @apply mb-4;
    }
    code {
      @apply p-1 rounded bg-gray-100;
    }
    pre {
      @apply p-4 rounded bg-gray-100;
    }
    blockquote {
      @apply p-4 rounded bg-gray-100;
    }
    img {
      @apply w-full;
    }
    iframe {
      @apply w-full;
    }
    table {
      @apply w-full;
    }
    th,
    td {
      @apply p-2;
    }
    th {
      @apply text-left;
    }
    td {
      @apply text-right;
    }
    th,
    td {
      @apply border border-line;
    }
    th:first-child,
    td:first-child {
      @apply pl-0;
    }
    th:last-child,
    td:last-child {
      @apply pr-0;
    }
    th {
      @apply bg-gray-100;
    }
    table {
      @apply border-collapse;
    }
    table + table {
      @apply mt-4;
    }
    table + p {
      @apply mt-4;
    }
    p + table {
      @apply mt-4;
    }
    table + hr {
      @apply mt-4;
    }
    hr + table {
      @apply mt-4;
    }
    hr + p {
      @apply mt-4;
    }
    p + hr {
      @apply mt-4;
    }
    pre + p {
      @apply mt-4;
    }
    p + pre {
      @apply mt-4;
    }
    pre + hr {
      @apply mt-4;
    }
    hr + pre {
      @apply mt-4;
    }
    pre + table {
      @apply mt-4;
    }
    table + pre {
      @apply mt-4;
    }
    pre + p {
      @apply mt-4;
    }
    p + pre {
      @apply mt-4;
    }
    pre + hr {
      @apply mt-4;
    }
  }
}
```

**4. `angular.json` styles array**

```json
"styles": [
  "src/tailwind.css",
  "src/global.scss"
]
```

Tailwind utilities load first; Ionic and custom styles load second so they can override where needed.

**5. `package.json` scripts — no extra step needed**

```json
"start": "ng serve",
"build": "ng build"
```

Angular's build pipeline runs PostCSS on `tailwind.css` automatically during both `ng serve` and `ng build`. No `concurrently`, no `tw:watch`, no committed `tailwind-output.css`.

---

## Theme Configuration (`@theme` block)

All design tokens are defined in the `@theme` block inside `tailwind.css`. No separate config file.

```css
@theme {
  /* Color palette — define all shades you need */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;

  /* Brand */
  --color-primary: #your-primary;
  --color-secondary: #your-secondary;
  --color-accent: #your-accent;

  /* Surfaces */
  --color-dark-bg: #0d0f14;
  --color-dark-card: #161920;
  --color-dark-border: #1e2330;
}
```

These variables are exposed as both Tailwind utilities (e.g., `bg-dark-card`) and CSS custom properties (e.g., `var(--color-dark-card)`).

---

## Custom Utilities

Define project-specific utilities in `@layer utilities` inside `tailwind.css`:

```css
@layer utilities {
  .isHidden {
    display: none !important;
  }
  .isVisible {
    display: block !important;
  }

  .container {
    @apply max-w-7xl mx-auto px-4;
  }
  .container-sm {
    @apply max-w-2xl mx-auto px-4;
  }
}
```

---

## File Structure

```
src/
  tailwind.css          ← source (imported in angular.json)
  global.scss           ← Ionic imports + custom SCSS
  theme/
    variables.scss      ← Ionic CSS variable overrides + design tokens
    ionic/
      _index.scss       ← Ionic component overrides
    custom/
      base/
        _fonts.scss     ← @font-face / Google Fonts imports
        _global.scss    ← shared component classes (buttons, inputs, cards)
    tailwind/
      _index.scss       ← Tailwind @layer overrides if ever needed
```

---

## Rules for Agents

- Never create `tailwind.config.ts` — use `@theme` block in `tailwind.css`
- Never add a separate `tw` or `tw:watch` script — Angular handles PostCSS automatically
- Never commit `tailwind-output.css` — it is a build artifact
- `tailwind.css` must be listed **before** `global.scss` in `angular.json` styles array
- Color tokens must be defined in both `@theme` (for Tailwind utilities) and `variables.scss` (for Ionic `var()` references) to avoid duplication of values
- Responsive breakpoints: minimum mobile width is **360px** (`sm:` = 360px or adjust in `@theme`)
