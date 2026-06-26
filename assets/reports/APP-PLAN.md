# G.P. News — App Development Plan

**Date:** 2026-06-26
**App:** G.P. News
**Bundle ID:** `com.gp.group.news`
**Platform:** Native only — iOS + Android (via Capacitor)
**Language:** Bulgarian only

---

## 1. Overview

G.P. News is a mobile news platform for employees and stakeholders of G.P. Group JSC, a Bulgarian construction company. The app delivers curated news, articles, and announcements organized by construction-industry categories. Users can read articles, comment, vote in polls, submit their own news, and receive push notifications.

The design reference is the interactive React prototype in Claude Design ("GP Group - News App"), which defines the component library, all screens, and the data model. The prototype offers two visual directions; **Direction A (Steel) has been selected** for this build (see §4).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (21.2.17 — latest version NgRx SignalStore supports; standalone, signals, OnPush) |
| Mobile shell | Ionic (latest, blank template) |
| Native runtime | Capacitor (latest) + `@capacitor/app` |
| State management | NgRx SignalStore (`@ngrx/signals`) |
| Styling | Tailwind CSS v4 (PostCSS) + Ionic SCSS overrides |
| Push notifications | `@capacitor/push-notifications` |
| Native secure storage | `@aparajita/capacitor-secure-storage` |
| User metadata storage | `@ionic/storage-angular` |
| Backend (dev) | Mock backend at `C:/Users/twrkh/Projects/backend-mock` |
| Backend (prod) | Laravel + Sanctum (JWT + httpOnly refresh cookie) |

---

## 3. Project Setup Checklist

- [ ] Scaffold with Ionic CLI: `ionic start gpnews blank --type=angular`
- [ ] Set `appId: 'com.gp.group.news'` in `capacitor.config.ts`
- [ ] Install Tailwind CSS v4 + `@tailwindcss/postcss`, create `postcss.config.js`
- [ ] Create `src/tailwind.css` with `@import "tailwindcss"` + `@theme` block
- [ ] Set `angular.json` styles order: `tailwind.css` before `global.scss`
- [ ] Create environment files: `dev`, `staging`, `production` in `src/environments/`
- [ ] Install `@aparajita/capacitor-secure-storage`, `@ionic/storage-angular`
- [ ] Install `@capacitor/push-notifications`
- [ ] Install `@ngrx/signals`, `@ngrx/operators`
- [ ] Set up `src/theme/` folder structure (see §6)

---

## 4. Theme & Design Tokens

Derived from the Claude Design prototype (`styles.css`):

### Colors
```scss
// Accent (default — configurable in prototype)
--color-accent:        #F2C200;
--color-accent-ink:    #1A1A12;

// Light surfaces (default theme)
--color-bg:            #EAEAE7;
--color-surface:       #FFFFFF;
--color-surface-2:     #F4F4F1;
--color-surface-3:     #ECECE8;
--color-ink:           #17170F;
--color-ink-2:         #56564E;
--color-ink-3:         #8C8C83;
--color-line:          rgba(20,20,10,0.09);
--color-line-2:        rgba(20,20,10,0.16);

// Dark surfaces (dark mode)
--color-bg-dark:       #0D0E0B;
--color-surface-dark:  #191A16;
```

### Typography
Four font stacks (user-selectable in prototype, pick one as default):
- **IBM Plex Sans** (recommended default — technical, readable)
- Manrope (modern)
- Golos Text (neutral)
- Spectral (editorial serif headline + Golos body)

### Spacing scale (density-aware, multiply by density factor)
`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40px`

### Radius
Default `8px` (rounded — Direction A). Use the prototype's derived scale: `--r-sm` = radius × 0.5, `--r-md` = radius × 0.8, `--r-lg` = radius.

### Design Direction — **SELECTED: A — Steel**

The app uses **Direction A (Steel)** — the editorial personality. Implement only this direction; Direction B (Обект) is not built.

Direction A specifics to follow throughout:
- **Rounded** corners (radius scale above)
- **Cards use shadows**, not borders (`--shadow`, `--shadow-lg`)
- **Category tags** rendered in neutral/surface tones (not accent-filled)
- **Section headings** in normal case — no monospaced `//` prefix, no uppercase tracking
- Comment-count badge uses neutral surface background (not accent)

> Note: the prototype's `[data-direction="b"]` style branches can be dropped entirely — only the `[data-direction="a"]` / default branches need porting.

---

## 5. Theme Folder Structure

```
src/theme/
  variables.scss          ← All CSS custom properties (design tokens + Ionic overrides)
  ionic/
    _index.scss           ← Ionic component-level overrides (ion-button, ion-card, etc.)
  custom/
    base/
      _fonts.scss         ← Google Fonts imports + font-family global rule
      _global.scss        ← Shared component classes (.gp-btn, .gp-card, .gp-chip, etc.)
      _normalize.scss     ← Rich-text normalization for article body content
  tailwind/
    _index.scss           ← Tailwind @layer overrides (usually empty)
```

`global.scss` import order:
1. Ionic core CSS
2. Optional Ionic utilities
3. Custom fonts
4. `theme/variables`
5. `theme/ionic/index`
6. `theme/custom/base/global`

---

## 6. App Architecture

### Routing Structure

```
/ (AppComponent — tab shell)
├── /splash                    (no tabs, no header)
├── /onboarding                (no tabs, no header)
├── /auth
│   ├── /login
│   └── /signup
├── /tabs (TabsPage)
│   ├── /home                  (HomeTab)
│   ├── /polls                 (PollsTab)
│   ├── /notifications         (NotificationsTab — logged in only)
│   └── /profile               (ProfileTab)
├── /category/:id              (CategoryListPage — pushed from home/drawer)
├── /article/:id               (ArticlePage — pushed from feed/category/notifications)
├── /poll/:id                  (PollPage — pushed from polls tab)
└── /add-news                  (modal overlay — logged in only)
```

Guards:
- `authGuard` — protects `/tabs/notifications`, `/tabs/profile`, `/add-news`
- `guestGuard` — redirects logged-in users away from `/auth/*`

### State Stores (NgRx SignalStore)

| Store | Scope | Responsibility |
|---|---|---|
| `AuthStore` | root | User session, login state, token lifecycle |
| `FeedStore` | root | Articles list, categories, per-category slices |
| `ArticleStore` | route | Single article + comments (scoped to ArticlePage) |
| `NotificationsStore` | root | Notification list, unread count, mark-read |
| `PollsStore` | root | Polls list + vote state |
| `ProfileStore` | route | Editable profile data (scoped to ProfilePage) |
| `AddNewsStore` | component | Draft state for the add-news form |

All stores compose from shared features:
- `withRequestStatus()` — `idle/pending/fulfilled/error` + derived flags
- `withLoading(name)` — bridge to Ionic loading controller
- `withBase(name)` — store name + DevTools integration

### Core Services

| Service | Responsibility |
|---|---|
| `AuthService` | Login, logout, token management, auto-logout timer |
| `AuthInterceptor` | Attach Bearer token, handle 401 silent refresh |
| `ArticleService` | Fetch articles, categories |
| `CommentService` | Fetch/post/like comments |
| `PollService` | Fetch polls, cast votes |
| `NotificationService` | Fetch notifications, mark read |
| `PushNotificationService` | Register device, handle incoming push |
| `StorageService` | Wrapper over `@ionic/storage-angular` |

---

## 7. Screens & Components

### Auth Flow
| Screen | Route | Notes |
|---|---|---|
| Splash | `/splash` | Auto-advances after 1.7s, checks for stored token → onboarding or home |
| Onboarding | `/onboarding` | 3 slides with real app illustrations, skip button, dot pagination |
| Login | `/auth/login` | Email + password, show/hide password, "continue as guest" |
| Signup | `/auth/signup` | Name, email, password, confirm password — all validated |

### Main Feed
| Screen | Route | Notes |
|---|---|---|
| Home | `/tabs/home` | Per-category sections: hero card + 2 list rows each. Guest gate after first section. Pull-to-refresh. |
| Category Drawer | (modal/overlay) | Full category list with icons + article counts. "Add News" CTA at bottom. |
| Category List | `/category/:id` | All articles in category, row layout. Pull-to-refresh. Empty state with add-news CTA. |

### Article
| Screen | Route | Notes |
|---|---|---|
| Article Detail | `/article/:id` | Hero image, title, date, tags, author, body paragraphs. Scroll-to-comments support. |
| Comments | (inline in Article) | Threaded (1 level deep), sort by newest/top-liked, like button, reply composer. Locked for guests. |

### Engagement
| Screen | Route | Notes |
|---|---|---|
| Polls List | `/tabs/polls` | List rows with vote status chip. Pull-to-refresh. |
| Poll Detail | `/poll/:id` | Radio options, animated bar results after voting. |
| Notifications | `/tabs/notifications` | Tappable cards linking to articles. Mark all read. Unread badge on tab. |

### User
| Screen | Route | Notes |
|---|---|---|
| Profile | `/tabs/profile` | Avatar, name/email display, my articles list (with pending/published chip), edit name, logout. Guest empty state with login CTA. |
| Add News | `/add-news` (modal) | Category picker chips, image upload toggle, title + body fields with validation. Submit → pending confirmation screen. |

### Shared UI Components (map to prototype's `ui.jsx`)
- `GpLogoComponent` — masked SVG logo
- `IconComponent` — 40+ SVG icon set (stroke-based)
- `AvatarComponent` — initials avatar, official variant
- `BtnComponent` — primary / dark / ghost / outline variants, sizes, loading state
- `ChipComponent` — default / accent / warn / ok tones
- `SkeletonComponent` — shimmer placeholder
- `ToastComponent` — success / info / error
- `EmptyStateComponent` — icon + title + text + optional action
- `BlueprintComponent` — SVG background texture
- `ImgPlaceholderComponent` — blueprint-panel image placeholder
- `ArticleThumbComponent` — wrapper around ImgPlaceholder with category color
- `PullToRefreshDirective` — wraps Ionic refresher

---

## 8. Authentication Implementation

### Token Storage
| Platform | Access Token | Refresh Token |
|---|---|---|
| iOS | `@aparajita/capacitor-secure-storage` (Keychain) | Same |
| Android | `@aparajita/capacitor-secure-storage` (EncryptedSharedPreferences) | Same |

No `localStorage` usage for tokens on any platform.

### Flow
1. **Startup** — retrieve token from secure storage → validate expiry → auto-login or show splash/onboarding
2. **Login** — POST `/auth/login` → receive access token (JSON) + refresh token (httpOnly cookie on web / stored natively) → store token → navigate to home
3. **Silent refresh** — `AuthInterceptor` catches 401 → serializes concurrent requests (BehaviorSubject queue) → POST `/auth/refresh` → retry queued requests
4. **Auto-logout** — timer set from `tokenExpirationDate`; fires `logout()` which clears storage and navigates to home-guest

### Guards
- `authGuard` — checks `AuthStore.isLoggedIn()`, redirects to `/auth/login` if false, stores `pendingReturnUrl`
- `guestGuard` — redirects logged-in users away from auth screens

---

## 9. Push Notifications

- Package: `@capacitor/push-notifications`
- Register on first authenticated launch
- Request permission prompt shown after onboarding
- Incoming notifications link to article by ID (navigate to `/article/:id`)
- Native only — not implemented for web

---

## 10. Data Model

### Category
```ts
interface Category {
  id: string;         // 'news' | 'infra' | 'metro' | 'high' | 'rail' | 'water' | 'electro' | 'hr' | 'safety' | 'fun' | 'sport' | 'other'
  name: string;       // Bulgarian display name
  icon: string;       // icon key
  hue: number;        // hue for placeholder color
}
```

### Article
```ts
interface Article {
  id: string;
  cat: string;
  title: string;
  date: string;       // Bulgarian formatted date
  iso: string;        // ISO 8601
  lead: string;
  img: string;        // placeholder key or 'upload'
  body: string[];     // paragraphs
  tags: string[];
  author?: User;
  pending?: boolean;  // submitted, awaiting moderation
}
```

### Comment
```ts
interface Comment {
  id: string;
  user: User;
  text: string;
  ago: number;        // minutes ago
  likes: number;
  liked: boolean;
  replies: Comment[];
}
```

### Poll
```ts
interface Poll {
  id: string;
  title: string;
  question: string;
  options: { id: string; text: string; votes: number; }[];
  voted: string | null;   // option id if already voted
  total: number;
  closes: string;
}
```

### Notification
```ts
interface AppNotification {
  id: string;
  title: string;
  ago: string;
  iso: string;
  read: boolean;
  art?: string;   // article id to navigate to
}
```

---

## 11. API Endpoints (mapped to prototype screens)

All prefixed with `/{locale}` per Laravel convention. Since app is Bulgarian only, prefix will be `/bg/`.

| Method | Endpoint | Screen |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Signup |
| POST | `/auth/refresh` | Silent token refresh |
| POST | `/auth/logout` | Profile → logout |
| GET | `/auth/me` | App startup, profile |
| PUT | `/auth/profile-data` | Profile → save changes |
| PUT | `/auth/new-password` | Profile → change password |
| DELETE | `/auth/delete-profile` | Profile → delete account |
| GET | `/articles` | Home feed |
| GET | `/articles?cat=:id` | Category list |
| GET | `/articles/:id` | Article detail |
| GET | `/articles/:id/comments` | Article comments |
| POST | `/articles/:id/comments` | Post comment |
| POST | `/articles/:id/comments/:cid/like` | Like comment |
| POST | `/articles/:id/comments/:cid/replies` | Reply to comment |
| POST | `/articles` | Add News submission |
| GET | `/polls` | Polls list |
| GET | `/polls/:id` | Poll detail |
| POST | `/polls/:id/vote` | Cast vote |
| GET | `/notifications` | Notifications list |
| PUT | `/notifications/:id/read` | Mark notification read |
| PUT | `/notifications/read-all` | Mark all read |
| POST | `/push/register` | Register push token |

---

## 12. Feature Implementation Order

### Phase 1 — Foundation
1. Project scaffold (Ionic + Angular + Capacitor)
2. Theme setup (Tailwind, SCSS structure, design tokens from prototype)
3. Shared UI component library (Icon, Btn, Chip, Avatar, Skeleton, Toast, EmptyState)
4. Routing skeleton (all routes, lazy-loaded, with placeholder pages)
5. Environment config (dev/staging/prod)

### Phase 2 — Auth
6. AuthService + AuthStore + AuthInterceptor
7. Secure storage service wrapper
8. Splash screen + auto-login logic
9. Onboarding screen (3 slides)
10. Login screen
11. Signup screen
12. Auth guards

### Phase 3 — Core Feed
13. FeedStore + ArticleService
14. Home screen (per-category sections, hero card, row cards, pull-to-refresh, guest gate)
15. Category drawer (slide-in overlay)
16. Category list screen
17. Skeleton loading states

### Phase 4 — Article & Comments
18. Article detail screen (hero image, body, tags, author)
19. CommentService
20. Comments section (threaded, sort, like, reply, composer)
21. Scroll-to-comments deep link

### Phase 5 — Engagement
22. PollsStore + PollService
23. Polls list screen
24. Poll detail screen (vote + animated results)
25. NotificationsStore + NotificationService
26. Notifications screen (list, mark read, mark all, unread badge)

### Phase 6 — User & Content Creation
27. ProfileStore + profile screen (my articles, edit name, logout)
28. AddNewsStore + Add News modal (category, image, title, body, submit, confirmation)
29. Profile guest empty state

### Phase 7 — Push Notifications
30. PushNotificationService
31. Permission request flow (post-onboarding)
32. Deep-link from notification to article

### Phase 8 — Polish & QA
33. Page transitions (slide/modal animations matching prototype)
34. Accessibility audit (AXE checks, WCAG AA — color contrast, ARIA, focus management)
35. Error states (network failure, empty states, offline detection)
36. Back-end integration (replace mock with real API)
37. iOS + Android build verification

---

## 13. File Structure (Frontend)

```
src/
  app/
    app.component.ts
    app.routes.ts
    app.config.ts
    core/
      guards/
        auth.guard.ts
        guest.guard.ts
      interceptors/
        auth.interceptor.ts
      services/
        auth.service.ts
        storage.service.ts
        push-notification.service.ts
    pages/
      auth/
        login/
        signup/
        onboarding/
        splash/
      feed/
        home/
        category-list/
        category-drawer/
      article/
        article-detail/
        comments/
      polls/
        polls-list/
        poll-detail/
      notifications/
      profile/
      add-news/
    shared/
      components/
        icon/
        btn/
        chip/
        avatar/
        skeleton/
        toast/
        empty-state/
        blueprint/
        img-placeholder/
        article-thumb/
        gp-logo/
      directives/
        pull-to-refresh.directive.ts
      pipes/
      models/
        article.model.ts
        category.model.ts
        comment.model.ts
        poll.model.ts
        notification.model.ts
        user.model.ts
    store/
      pages/
        with-request-status.feature.ts
        with-loading.feature.ts
        with-base.feature.ts
      auth/
        auth.slice.ts
        auth.updaters.ts
        auth.store.ts
      feed/
        feed.slice.ts
        feed.updaters.ts
        feed.store.ts
      notifications/
        notifications.store.ts
      polls/
        polls.store.ts
  theme/
    variables.scss
    ionic/_index.scss
    custom/base/
      _fonts.scss
      _global.scss
      _normalize.scss
  tailwind.css
  global.scss
  environments/
    environment.ts
    environment.staging.ts
    environment.prod.ts
```

---

## 14. Coding Rules Summary

- Angular 20+: standalone components, signals, `OnPush`, `inject()`, `@if`/`@for` control flow
- No `NgModules`, no `*ngIf`/`*ngFor`, no `ngClass`/`ngStyle`, no `@HostBinding`/`@HostListener`
- Use `input()` / `output()` signal-based decorators for component I/O
- NgRx SignalStore for all feature state; plain `signal()` only for trivial local UI state
- All mutations via `patchState()` + named updaters; all async via `rxMethod()` + `tapResponse()`
- Tailwind v4 via PostCSS — no `tailwind.config.ts`, no separate build step
- All token storage through `@aparajita/capacitor-secure-storage` — never `localStorage`
- Push notifications: native only, skip web path
- App is Bulgarian only — no i18n library (per CLAUDE.md: "do not add translations libraries")
- Minimum mobile width: 360px CSS pixels
- Dark mode: implement support but do not force — design defaults to light mode (depends on user operational system settings)
- Shared component CSS classes prefixed `.gp-` (initials of the app name, matching the prototype naming)
- Use `::part()` for Ionic shadow DOM — never `/deep/` or `::ng-deep`
- Build Direction A (Steel) only — do not port `[data-direction="b"]` style branches
- When frontend API needs change, keep the dev mock backend (`C:/Users/twrkh/Projects/backend-mock`) in sync (per CLAUDE.md)

---

## 15. Open Decisions

| Decision | Options | Status |
|---|---|---|
| Design direction (A vs B) | Steel (rounded, editorial) or Обект (sharp, industrial) | ✅ **RESOLVED — Direction A (Steel)** |
| Angular version | 22 (absolute latest) vs 21 (latest NgRx-compatible) | ✅ **RESOLVED — Angular 21.2.17.** NgRx SignalStore (mandated by state.md) has no Angular 22 release; 21 keeps the whole stack on clean peer deps |
| Change detection | Zoneless vs zone-based | Zone-based (`provideZoneChangeDetection`) retained for Ionic compatibility; components are OnPush + signals so a later zoneless switch stays low-risk |
| Default theme | Light (prototype default) or Dark | Light — dark mode rule in IONIC.md requires explicit opt-in, which CLAUDE.md does not give |
| Default font | IBM Plex Sans, Manrope, Golos Text, Spectral | IBM Plex Sans — most technical and readable (aligns with Steel) |
| Accent color | #F2C200 (yellow), #E8741E (orange), #2A6FDB (blue), #10A86A (green) | #F2C200 — matches prototype default and brand |
| Social login (Google/Apple) | Supported by backend | Implement if required; needs Firebase project setup |

---

*Report generated: 2026-06-26*
