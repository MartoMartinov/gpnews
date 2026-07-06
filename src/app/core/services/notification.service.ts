import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getNotifications(page?: number, pageSize?: number): Observable<AppNotification[]> {
    const params: Record<string, string> = {};
    if (page) params['page'] = String(page);
    if (pageSize) params['pageSize'] = String(pageSize);
    return this.http.get<AppNotification[]>(`${this.base}/notifications`, { params });
  }

  markRead(id: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/notifications/read-all`, {});
  }
}
