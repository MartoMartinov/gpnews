import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import {
  ChipComponent,
  EmptyStateComponent,
  IconComponent,
  SkeletonComponent,
  TabHeaderComponent,
} from '../../../shared/components';
import { PollsStore } from '../../../store/polls/polls.store';

@Component({
  selector: 'app-polls-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IONIC_IMPORTS,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    ChipComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TabHeaderComponent,
  ],
  template: `
    <gp-tab-header />

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="gp-section-head">
        <span class="t">Анкети</span>
      </div>

      @if (store.loading()) {
        <div style="padding: 0 var(--s5)">
          @for (i of [0,1,2]; track i) {
            <gp-skeleton width="100%" height="62px" [radius]="16" style="display:block;margin-bottom:var(--s3)" />
          }
        </div>
      } @else if (store.polls().length === 0) {
        <gp-empty-state icon="tray" title="Няма активни анкети" text="В момента няма анкети за попълване." />
      } @else {
        <div class="poll-list">
          @for (p of store.polls(); track p.id) {
            <button class="poll-row" (click)="goPoll(p.id)">
              <span class="poll-row-play">
                <gp-icon name="fwd" [size]="16" [sw]="2.4" />
              </span>
              <span class="poll-row-body">
                <span class="poll-row-title">{{ p.title }}</span>
                <span class="poll-row-meta">{{ p.closes }} · {{ p.total }} гласа</span>
              </span>
              @if (p.voted) {
                <gp-chip tone="ok" icon="check">Гласувано</gp-chip>
              } @else {
                <gp-icon name="fwd" [size]="18" class="poll-row-arrow" />
              }
            </button>
          }
          <div style="height: var(--s6)"></div>
        </div>

        <ion-infinite-scroll (ionInfinite)="loadMore($event)" [disabled]="!store.pollsHasMore()">
          <ion-infinite-scroll-content loadingSpinner="dots" />
        </ion-infinite-scroll>
      }
    </ion-content>
  `,
})
export class PollsListPage {
  protected readonly store = inject(PollsStore);
  private readonly router = inject(Router);

  private pendingInfiniteEvent: CustomEvent | null = null;

  constructor() {
    effect(() => {
      if (!this.store.pollsLoadingMore() && this.pendingInfiniteEvent) {
        (this.pendingInfiniteEvent.target as HTMLIonInfiniteScrollElement).complete();
        this.pendingInfiniteEvent = null;
      }
    });
  }

  goPoll(id: string): void {
    void this.router.navigate(['/poll', id]);
  }

  refresh(event: CustomEvent): void {
    this.store.loadPolls(undefined);
    setTimeout(() => (event.target as HTMLIonRefresherElement).complete(), 1000);
  }

  loadMore(event: CustomEvent): void {
    this.pendingInfiniteEvent = event;
    this.store.loadMorePolls(undefined);
  }
}
