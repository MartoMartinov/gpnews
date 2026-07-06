import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import {
  BlueprintComponent,
  EmptyStateComponent,
  IconComponent,
  SkeletonComponent,
} from '../../../shared/components';
import { FeedStore } from '../../../store/feed/feed.store';
import { Category } from '../../../shared/models';

@Component({
  selector: 'app-category-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IONIC_IMPORTS,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IconComponent,
    SkeletonComponent,
    EmptyStateComponent,
    BlueprintComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home" />
        </ion-buttons>
        <ion-title>{{ cat()?.name ?? 'Категория' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="gp-section-head">
        <span class="t">{{ cat()?.name }}</span>
      </div>

      @if (feed.loading()) {
        @for (i of [0, 1, 2]; track i) {
          <div class="gp-row" style="pointer-events:none">
            <div class="thumb">
              <gp-skeleton width="116px" height="104px" [radius]="0" />
            </div>
            <div class="rbody" style="flex:1">
              <gp-skeleton
                width="90%"
                height="14px"
                style="margin-bottom:8px; display:block"
              />
              <gp-skeleton
                width="60%"
                height="14px"
                style="margin-bottom:12px; display:block"
              />
              <gp-skeleton width="40%" height="11px" />
            </div>
          </div>
        }
      } @else if (articles().length === 0) {
        <gp-empty-state
          [icon]="cat()?.icon ?? 'news'"
          title="Все още няма новини"
          [text]="emptyText()"
        />
      } @else {
        @for (a of articles(); track a.id) {
          <button class="gp-row" (click)="goArticle(a.id)">
            <div class="thumb">
              <gp-blueprint
                class="gp-img"
                [style.--cathue]="catHue()"
                style="aspect-ratio:1/1;height:104px"
              ></gp-blueprint>
            </div>
            <div class="rbody">
              <h3>{{ a.title }}</h3>
              <div class="gp-meta">
                <span>{{ a.date }}</span>
                @if ((a.commentCount ?? 0) > 0) {
                  <span class="dot"></span>
                  <span class="cc"
                    ><gp-icon name="comment" [size]="13" [sw]="2" /><b>{{
                      a.commentCount
                    }}</b></span
                  >
                }
              </div>
            </div>
          </button>
        }
        <div style="height: var(--s6)"></div>

        <ion-infinite-scroll (ionInfinite)="loadMore($event)" [disabled]="!feed.categoryHasMore()">
          <ion-infinite-scroll-content loadingSpinner="dots" />
        </ion-infinite-scroll>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-button {
        --color: var(--color-ink);
      }
      .gp-row {
        display: flex;
        cursor: pointer;
        background: none;
        border: none;
        text-align: left;
      }
    `,
  ],
})
export class CategoryListPage implements OnInit {
  readonly id = input<string>('');

  protected readonly feed = inject(FeedStore);
  private readonly router = inject(Router);
  private pendingInfiniteEvent: CustomEvent | null = null;

  constructor() {
    effect(() => {
      if (!this.feed.categoryLoadingMore() && this.pendingInfiniteEvent) {
        (this.pendingInfiniteEvent.target as HTMLIonInfiniteScrollElement).complete();
        this.pendingInfiniteEvent = null;
      }
    });
  }

  protected readonly cat = computed((): Category | undefined =>
    this.feed.categories().find((c) => c.id === this.id()),
  );

  protected readonly articles = computed(() => this.feed.byCat(this.id()));

  protected emptyText(): string {
    return `В „${this.cat()?.name ?? ''}“ още няма публикувани статии.`;
  }

  protected catHue(): string {
    const hue = this.cat()?.hue ?? 210;
    return `hsl(${hue} 45% 55%)`;
  }

  ngOnInit(): void {
    this.feed.loadCategoryArticles(this.id());
  }

  goArticle(artId: string): void {
    void this.router.navigate(['/article', artId]);
  }

  loadMore(event: CustomEvent): void {
    this.pendingInfiniteEvent = event;
    this.feed.loadMoreCategoryArticles(this.id());
  }

  refresh(event: CustomEvent): void {
    this.feed.loadCategoryArticles(this.id());
    setTimeout(
      () => (event.target as HTMLIonRefresherElement).complete(),
      1000,
    );
  }
}
