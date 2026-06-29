import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Credentials, RegisterData, User } from '../../shared/models';

/** Thin HTTP layer for auth endpoints. State lives in AuthStore. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, credentials);
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, data);
  }

  /** Bearer token attached by the interceptor. */
  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/refresh`, {});
  }

  logout(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/auth/logout`, {});
  }

  me(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.base}/auth/me`);
  }

  updateProfile(name: string): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.base}/auth/profile-data`, { name });
  }

  changePassword(current: string, password: string): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(`${this.base}/auth/new-password`, { current, password });
  }

  deleteAccount(): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.base}/auth/delete-profile`);
  }
}
