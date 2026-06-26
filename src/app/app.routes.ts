import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/auth/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/auth/onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/feed/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'polls',
        loadComponent: () =>
          import('./features/polls/polls-list/polls-list.page').then((m) => m.PollsListPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./features/feed/category-list/category-list.page').then((m) => m.CategoryListPage),
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./features/article/article-detail/article-detail.page').then(
        (m) => m.ArticleDetailPage,
      ),
  },
  {
    path: 'poll/:id',
    loadComponent: () =>
      import('./features/polls/poll-detail/poll-detail.page').then((m) => m.PollDetailPage),
  },
  {
    path: 'add-news',
    loadComponent: () =>
      import('./features/add-news/add-news.page').then((m) => m.AddNewsPage),
  },
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: '**', redirectTo: 'splash' },
];
