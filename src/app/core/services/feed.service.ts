import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article, Category, SubmitArticleData } from '../../shared/models';

export interface SearchResult {
  items: Article[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getArticles(catId?: string, page?: number, pageSize?: number): Observable<Article[]> {
    const params: Record<string, string> = {};
    if (catId) params['cat'] = catId;
    if (page) params['page'] = String(page);
    if (pageSize) params['pageSize'] = String(pageSize);
    return this.http.get<Article[]>(`${this.base}/articles`, { params });
  }

  searchArticles(q: string, page?: number, pageSize?: number): Observable<SearchResult> {
    const params: Record<string, string> = { q };
    if (page) params['page'] = String(page);
    if (pageSize) params['pageSize'] = String(pageSize);
    return this.http
      .get<Article[]>(`${this.base}/articles`, { params, observe: 'response' })
      .pipe(
        map((res) => ({
          items: res.body ?? [],
          total: Number(res.headers.get('X-Total-Count')) || (res.body?.length ?? 0),
        })),
      );
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
