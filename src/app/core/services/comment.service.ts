import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getComments(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/articles/${articleId}/comments`);
  }

  addComment(articleId: string, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.base}/articles/${articleId}/comments`, { text });
  }
}
