import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, from, switchMap, take, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { AuthStore } from '../../store/auth/auth.store';

// Shared across interceptor invocations so concurrent 401s serialize onto a
// single refresh call (refresh queue pattern, see auth.md).
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/**
 * Attaches the Bearer token to our API requests only (never third-party), and
 * on 401 performs a single serialized silent refresh, then retries. If refresh
 * fails, forces logout.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only touch our own API — never attach the token to third-party hosts.
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const secure = inject(SecureStorageService);
  const isLoginOrRegister = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const isRefresh = req.url.includes('/auth/refresh');

  return from(secure.getToken()).pipe(
    switchMap((token) => {
      const outgoing = token ? withBearer(req, token) : req;
      return next(outgoing).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401 && !isLoginOrRegister && !isRefresh) {
            return handle401(req, next);
          }
          return throwError(() => err);
        }),
      );
    }),
  );
};

function handle401(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const auth = inject(AuthService);
  const store = inject(AuthStore);

  if (isRefreshing) {
    // Queue until the in-flight refresh publishes a fresh token.
    return refreshedToken$.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap((token) => next(withBearer(req, token))),
    );
  }

  isRefreshing = true;
  refreshedToken$.next(null);

  return auth.refresh().pipe(
    switchMap((res) => {
      isRefreshing = false;
      store.applyAuthResponse(res);
      refreshedToken$.next(res.accessToken);
      return next(withBearer(req, res.accessToken));
    }),
    catchError((err: HttpErrorResponse) => {
      isRefreshing = false;
      store.forceLogout();
      return throwError(() => err);
    }),
  );
}
