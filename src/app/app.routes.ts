import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/auth/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/auth/onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/signup',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/feed/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'polls',
        loadComponent: () =>
          import('./pages/polls/polls-list/polls-list.page').then((m) => m.PollsListPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./pages/feed/category-list/category-list.page').then((m) => m.CategoryListPage),
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./pages/article/article-detail/article-detail.page').then(
        (m) => m.ArticleDetailPage,
      ),
  },
  {
    path: 'poll/:id',
    loadComponent: () =>
      import('./pages/polls/poll-detail/poll-detail.page').then((m) => m.PollDetailPage),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'add-news',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/add-news/add-news.page').then((m) => m.AddNewsPage),
  },
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: '**', redirectTo: 'splash' },
];
