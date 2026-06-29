import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article, Category, SubmitArticleData } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getArticles(catId?: string): Observable<Article[]> {
    const params: Record<string, string> = {};
    if (catId) params['cat'] = catId;
    return this.http.get<Article[]>(`${this.base}/articles`, { params });
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/articles/${id}`);
  }

  submitArticle(data: SubmitArticleData): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.base}/articles`, data);
  }

  getMyArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/my-articles`);
  }
}
