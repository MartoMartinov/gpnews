import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Poll } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PollService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getPolls(): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.base}/polls`);
  }

  getPoll(id: string): Observable<Poll> {
    return this.http.get<Poll>(`${this.base}/polls/${id}`);
  }

  castVote(pollId: string, optionId: string): Observable<Poll> {
    return this.http.post<Poll>(`${this.base}/polls/${pollId}/vote`, { optionId });
  }
}
