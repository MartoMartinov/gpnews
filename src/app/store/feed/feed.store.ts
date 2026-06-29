import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';

import { FeedService } from '../../core/services/feed.service';
import { CommentService } from '../../core/services/comment.service';
import { Article, Category, Comment, SubmitArticleData } from '../../shared/models';
import { withBase } from '../features';

export interface HomeSectionData {
  cat: Category;
  lead: Article;
  more: Article[];
}

interface FeedState {
  categories: Category[];
  articles: Article[];
  loading: boolean;
  activeArticle: Article | null;
  activeComments: Comment[];
  articleLoading: boolean;
  myArticles: Article[];
}

const initialState: FeedState = {
  categories: [],
  articles: [],
  loading: false,
  activeArticle: null,
  activeComments: [],
  articleLoading: false,
  myArticles: [],
};

export const FeedStore = signalStore(
  { providedIn: 'root' },
  withBase('feed'),
  withState(initialState),
  withComputed(({ articles, categories }) => ({
    homeSections: computed((): HomeSectionData[] => {
      const arts = articles();
      const cats = categories();
      return cats
        .map((cat) => {
          const list = arts.filter((a) => a.cat === cat.id);
          const more = cat.id === 'news' ? [] : list.slice(1, 3);
          return { cat, lead: list[0] ?? null, more };
        })
        .filter((s): s is HomeSectionData => s.lead !== null);
    }),
  })),
  withProps(() => ({
    _feed: inject(FeedService),
    _comment: inject(CommentService),
    _toast: inject(ToastController),
    _router: inject(Router),
  })),
  withMethods((store) => ({
    loadHome: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          forkJoin([store._feed.getCategories(), store._feed.getArticles()]).pipe(
            tapResponse({
              next: ([categories, articles]) =>
                patchState(store, { categories, articles, loading: false }),
              error: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    loadCategoryArticles: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((catId) =>
          store._feed.getArticles(catId).pipe(
            tapResponse({
              next: (articles) => {
                // Merge into master list, replacing articles for this cat.
                const existing = store.articles().filter((a) => a.cat !== catId);
                patchState(store, { articles: [...existing, ...articles], loading: false });
              },
              error: () => patchState(store, { loading: false }),
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
              error: () => patchState(store, { articleLoading: false }),
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
                void (async () => {
                  const t = await store._toast.create({
                    message: 'Коментарът е публикуван',
                    duration: 2000,
                    position: 'bottom',
                    color: 'success',
                  });
                  await t.present();
                })();
              },
              error: () => {},
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
              error: () => {},
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
