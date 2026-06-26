import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

/** Keeps logged-in users out of the auth screens (login/signup). */
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/tabs/home']);
};
