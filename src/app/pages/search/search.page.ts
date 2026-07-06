import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { BlueprintComponent, EmptyStateComponent, IconComponent, SkeletonComponent } from '../../shared/components';
import { FeedService, SearchResult } from '../../core/services/feed.service';
import { FeedStore } from '../../store/feed/feed.store';
import { Article } from '../../shared/models';

const SEARCH_PAGE_SIZE = 12;

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    BlueprintComponent,
  ],
  template: `
    <div class="search-topbar">
      <button class="search-back" (click)="back()" aria-label="Назад">
        <gp-icon name="back" [size]="22" />
      </button>
      <input
        #inputEl
        class="search-input"
        type="search"
        placeholder="Търси новини…"
        autocomplete="off"
        autocorrect="off"
        [value]="q()"
        (input)="q.set($any($event.target).value)"
      />
      @if (q()) {
        <button class="search-back" (click)="clear()" aria-label="Изчисти">
          <gp-icon name="close" [size]="20" />
        </button>
      } @else {
        <span style="width:40px;flex:none"></span>
      }
    </div>

    <ion-content>
      @if (q().trim().length < 2) {
        <gp-empty-state
          icon="search"
          title="Търси в новините"
          text="Въведи поне 2 символа, за да видиш резултати."
        />
      } @else if (loading()) {
        @for (i of [0,1,2,3]; track i) {
          <div class="gp-row" style="pointer-events:none">
            <div class="thumb">
              <gp-skeleton width="104px" height="104px" [radius]="0" />
            </div>
            <div class="rbody" style="flex:1">
              <gp-skeleton width="92%" height="14px" style="margin-bottom:8px;display:block" />
              <gp-skeleton width="70%" height="14px" style="margin-bottom:12px;display:block" />
              <gp-skeleton width="40%" height="11px" />
            </div>
          </div>
        }
      } @else if (results().length === 0) {
        <gp-empty-state
          icon="search"
          title="Няма резултати"
          [text]="noResultsText()"
        />
      } @else {
        <div class="search-count">
          {{ total() }}&nbsp;{{ total() === 1 ? 'резултат' : 'резултата' }}
        </div>
        @for (a of results(); track a.id) {
          <button class="gp-row" (click)="goArticle(a.id)">
            <div class="thumb">
              <gp-blueprint class="gp-img" [style.--cathue]="catHue(a.cat)" style="aspect-ratio:1/1;height:104px"></gp-blueprint>
            </div>
            <div class="rbody">
              <h3>{{ a.title }}</h3>
              <div class="gp-meta">
                <span>{{ a.date }}</span>
                @if ((a.commentCount ?? 0) > 0) {
                  <span class="dot"></span>
                  <span class="cc">
                    <gp-icon name="comment" [size]="13" [sw]="2" />
                    <b>{{ a.commentCount }}</b>
                  </span>
                }
              </div>
            </div>
          </button>
        }
        <div style="height: var(--s6)"></div>

        <ion-infinite-scroll (ionInfinite)="loadMore($event)" [disabled]="!hasMore()">
          <ion-infinite-scroll-content loadingSpinner="dots" />
        </ion-infinite-scroll>
      }
    </ion-content>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg);
    }
    ion-content { flex: 1; --background: var(--color-bg); }
    .search-back {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      flex: none;
      border: none;
      background: none;
      color: var(--color-ink);
      cursor: pointer;
      border-radius: var(--r-md);
      -webkit-tap-highlight-color: transparent;
    }
    .gp-row {
      display: flex;
      cursor: pointer;
      background: none;
      border: none;
      text-align: left;
    }
  `],
})
export class SearchPage implements AfterViewInit {
  @ViewChild('inputEl') private readonly inputEl!: ElementRef<HTMLInputElement>;

  protected readonly q = signal('');
  protected readonly loading = signal(false);
  protected readonly results = signal<Article[]>([]);
  protected readonly total = signal(0);
  protected readonly searched = signal('');
  protected readonly page = signal(1);
  protected readonly hasMore = signal(true);
  protected readonly loadingMore = signal(false);

  private readonly feedService = inject(FeedService);
  private readonly feedStore = inject(FeedStore);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private pendingInfiniteEvent: CustomEvent | null = null;

  constructor() {
    toObservable(this.q)
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        tap((q) => {
          if (q.trim().length < 2) {
            this.results.set([]);
            this.loading.set(false);
          } else {
            this.loading.set(true);
          }
        }),
        switchMap((q) => {
          const t = q.trim();
          if (t.length < 2) return EMPTY;
          this.page.set(1);
          this.hasMore.set(true);
          return this.feedService.searchArticles(t, 1, SEARCH_PAGE_SIZE).pipe(
            catchError(() => of({ items: [], total: 0 } as SearchResult)),
            tap(({ items, total }) => {
              this.searched.set(t);
              this.results.set(items);
              this.total.set(total);
              this.loading.set(false);
              this.hasMore.set(items.length < total);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    effect(() => {
      if (!this.loadingMore() && this.pendingInfiniteEvent) {
        (this.pendingInfiniteEvent.target as HTMLIonInfiniteScrollElement).complete();
        this.pendingInfiniteEvent = null;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputEl?.nativeElement.focus(), 80);
  }

  protected noResultsText(): string {
    return `Не намерихме нищо за „${this.searched()}".`;
  }

  protected catHue(catId: string): string {
    const cat = this.feedStore.categories().find((c) => c.id === catId);
    return `hsl(${cat?.hue ?? 210} 45% 55%)`;
  }

  clear(): void {
    this.q.set('');
    this.inputEl?.nativeElement.focus();
  }

  back(): void {
    this.location.back();
  }

  goArticle(id: string): void {
    void this.router.navigate(['/article', id]);
  }

  loadMore(event: CustomEvent): void {
    if (!this.hasMore() || this.loadingMore() || this.loading()) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
    this.pendingInfiniteEvent = event;
    this.loadingMore.set(true);
    this.feedService
      .searchArticles(this.searched(), this.page() + 1, SEARCH_PAGE_SIZE)
      .pipe(
        catchError(() => of({ items: [], total: this.total() } as SearchResult)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ items, total }) => {
        const merged = [...this.results(), ...items];
        this.results.set(merged);
        this.total.set(total);
        this.page.set(this.page() + 1);
        this.hasMore.set(merged.length < total);
        this.loadingMore.set(false);
      });
  }
}
