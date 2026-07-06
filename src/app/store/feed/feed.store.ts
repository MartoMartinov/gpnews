import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { filter, forkJoin, pipe, switchMap, tap } from 'rxjs';

import { FeedService } from '../../core/services/feed.service';
import { CommentService } from '../../core/services/comment.service';
import { ToastService } from '../../core/services/toast.service';
import { Article, ArticlePreview, Category, Comment, SubmitArticleData } from '../../shared/models';
import { withBase } from '../features';

const CATEGORY_PAGE_SIZE = 12;

export interface HomeSectionData {
  cat: Category;
  lead: ArticlePreview;
  more: ArticlePreview[];
}

interface FeedState {
  categories: Category[];
  homeSections: HomeSectionData[];
  articles: Article[];
  loading: boolean;
  activeArticle: Article | null;
  activeComments: Comment[];
  articleLoading: boolean;
  myArticles: Article[];
  categoryCatId: string | null;
  categoryPage: number;
  categoryHasMore: boolean;
  categoryLoadingMore: boolean;
}

const initialState: FeedState = {
  categories: [],
  homeSections: [],
  articles: [],
  loading: false,
  activeArticle: null,
  activeComments: [],
  articleLoading: false,
  myArticles: [],
  categoryCatId: null,
  categoryPage: 1,
  categoryHasMore: true,
  categoryLoadingMore: false,
};

export const FeedStore = signalStore(
  { providedIn: 'root' },
  withBase('feed'),
  withState(initialState),
  withProps(() => ({
    _feed: inject(FeedService),
    _comment: inject(CommentService),
    _toast: inject(ToastService),
    _router: inject(Router),
  })),
  withMethods((store) => ({
    loadHome: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          forkJoin([store._feed.getCategories(), store._feed.getHomeArticles()]).pipe(
            tapResponse({
              next: ([categories, sections]) => {
                const homeSections = sections
                  .map((s): HomeSectionData | null => {
                    const cat = categories.find((c) => c.id === s.catId);
                    return cat ? { cat, lead: s.lead, more: s.more } : null;
                  })
                  .filter((s): s is HomeSectionData => s !== null);
                patchState(store, { categories, homeSections, loading: false });
              },
              error: () => {
                patchState(store, { loading: false });
                void store._toast.error('Неуспешно зареждане. Провери интернет връзката.');
              },
            }),
          ),
        ),
      ),
    ),

    loadCategoryArticles: rxMethod<string>(
      pipe(
        tap((catId) =>
          patchState(store, {
            loading: true,
            categoryCatId: catId,
            categoryPage: 1,
            categoryHasMore: true,
          }),
        ),
        switchMap((catId) =>
          store._feed.getArticles(catId, 1, CATEGORY_PAGE_SIZE).pipe(
            tapResponse({
              next: (articles) => {
                const existing = store.articles().filter((a) => a.cat !== catId);
                patchState(store, {
                  articles: [...existing, ...articles],
                  loading: false,
                  categoryHasMore: articles.length === CATEGORY_PAGE_SIZE,
                });
              },
              error: () => {
                patchState(store, { loading: false });
                void store._toast.error('Неуспешно зареждане. Провери интернет връзката.');
              },
            }),
          ),
        ),
      ),
    ),

    loadMoreCategoryArticles: rxMethod<string>(
      pipe(
        filter(
          (catId) =>
            store.categoryCatId() === catId &&
            store.categoryHasMore() &&
            !store.categoryLoadingMore() &&
            !store.loading(),
        ),
        tap(() => patchState(store, { categoryLoadingMore: true })),
        switchMap((catId) =>
          store._feed.getArticles(catId, store.categoryPage() + 1, CATEGORY_PAGE_SIZE).pipe(
            tapResponse({
              next: (more) =>
                patchState(store, {
                  articles: [...store.articles(), ...more],
                  categoryPage: store.categoryPage() + 1,
                  categoryHasMore: more.length === CATEGORY_PAGE_SIZE,
                  categoryLoadingMore: false,
                }),
              error: () => {
                patchState(store, { categoryLoadingMore: false });
                void store._toast.error('Неуспешно зареждане на още статии.');
              },
            }),
          ),
        ),
      ),
    ),

    loadArticle: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { articleLoading: true, activeArticle: null, activeComments: [] })),
        switchMap((id) =>
          forkJoin([store._feed.getArticle(id), store._comment.getComments(id)]).pipe(
            tapResponse({
              next: ([activeArticle, activeComments]) =>
                patchState(store, { activeArticle, activeComments, articleLoading: false }),
              error: () => {
                patchState(store, { articleLoading: false });
                void store._toast.error('Статията не може да бъде заредена.');
              },
            }),
          ),
        ),
      ),
    ),

    addComment: rxMethod<{ articleId: string; text: string }>(
      pipe(
        switchMap(({ articleId, text }) =>
          store._comment.addComment(articleId, text).pipe(
            tapResponse({
              next: (comment: Comment) => {
                patchState(store, { activeComments: [comment, ...store.activeComments()] });
                void store._toast.success('Коментарът е публикуван');
              },
              error: () => void store._toast.error('Грешка при публикуване на коментара.'),
            }),
          ),
        ),
      ),
    ),

    likeComment: rxMethod<{ articleId: string; commentId: string }>(
      pipe(
        switchMap(({ articleId, commentId }) =>
          store._comment.likeComment(articleId, commentId).pipe(
            tapResponse({
              next: ({ liked, likes }: { liked: boolean; likes: number }) => {
                patchState(store, {
                  activeComments: store.activeComments().map((c) => {
                    if (c.id === commentId) return { ...c, liked, likes };
                    if (c.replies?.some((r) => r.id === commentId)) {
                      return {
                        ...c,
                        replies: (c.replies ?? []).map((r) =>
                          r.id === commentId ? { ...r, liked, likes } : r,
                        ),
                      };
                    }
                    return c;
                  }),
                });
              },
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    addReply: rxMethod<{ articleId: string; commentId: string; text: string }>(
      pipe(
        switchMap(({ articleId, commentId, text }) =>
          store._comment.addReply(articleId, commentId, text).pipe(
            tapResponse({
              next: (reply: Comment) => {
                patchState(store, {
                  activeComments: store.activeComments().map((c) =>
                    c.id === commentId
                      ? { ...c, replies: [...(c.replies ?? []), reply] }
                      : c,
                  ),
                });
              },
              error: () => void store._toast.error('Грешка при публикуване на отговора.'),
            }),
          ),
        ),
      ),
    ),

    submitArticle: (data: SubmitArticleData) => store._feed.submitArticle(data),

    loadMyArticles: rxMethod<void>(
      pipe(
        switchMap(() =>
          store._feed.getMyArticles().pipe(
            tapResponse({
              next: (myArticles: Article[]) => patchState(store, { myArticles }),
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    catOf: (catId: string): Category | undefined =>
      store.categories().find((c) => c.id === catId),

    byCat: (catId: string): Article[] =>
      store.articles().filter((a) => a.cat === catId),
  })),
  withHooks((store) => ({
    onInit: () => store.loadHome(undefined),
  })),
);
