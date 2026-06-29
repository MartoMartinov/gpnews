import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { BtnComponent, ChipComponent, GpLogoComponent, IconComponent, SkeletonComponent } from '../../../shared/components';
import { FeedStore } from '../../../store/feed/feed.store';
import { AuthStore } from '../../../store/auth/auth.store';
import { Category } from '../../../shared/models';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, IonRefresher, IonRefresherContent, BtnComponent, GpLogoComponent, IconComponent, SkeletonComponent, ChipComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button aria-label="Категории" (click)="openDrawer()">
            <gp-icon name="menu" [size]="24" [sw]="2" />
          </ion-button>
        </ion-buttons>
        <ion-title><gp-logo /></ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Търсене">
            <gp-icon name="search" [size]="22" [sw]="2" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      @if (feed.loading() && feed.articles().length === 0) {
        <div style="padding-top: 4px">
          <gp-skeleton width="46%" height="22px" style="margin: var(--s4) var(--s5) var(--s5); display: block" />
          <div class="gp-card" style="margin: 0 var(--s5) var(--s5)">
            <gp-skeleton width="100%" height="190px" [radius]="0" />
            <div style="padding: var(--s5)">
              <gp-skeleton width="90%" height="18px" style="margin-bottom:10px; display:block" />
              <gp-skeleton width="70%" height="18px" style="margin-bottom:16px; display:block" />
              <gp-skeleton width="40%" height="13px" />
            </div>
          </div>
          @for (i of [0,1]; track i) {
            <div class="gp-row" style="pointer-events:none">
              <div class="thumb"><gp-skeleton width="116px" height="104px" [radius]="0" /></div>
              <div class="rbody" style="flex:1">
                <gp-skeleton width="92%" height="14px" style="margin-bottom:8px; display:block" />
                <gp-skeleton width="75%" height="14px" style="margin-bottom:12px; display:block" />
                <gp-skeleton width="40%" height="11px" />
              </div>
            </div>
          }
        </div>
      } @else {
        @for (sec of feed.homeSections(); track sec.cat.id; let i = $index) {
          <div class="gp-catsec">
            <button class="gp-section-head as-link" (click)="goCategory(sec.cat.id)">
              <span class="t">{{ sec.cat.name }}</span>
              <span class="more"><gp-icon name="fwd" [size]="20" /></span>
            </button>

            <button class="gp-hero gp-card" (click)="goArticle(sec.lead.id)">
              <div class="gp-img" [style.--cathue]="catHue(sec.cat)" style="aspect-ratio:16/10"></div>
              <div class="body">
                <h2>{{ sec.lead.title }}</h2>
                <div class="gp-meta">
                  <span>{{ sec.lead.date }}</span>
                  @if ((sec.lead.commentCount ?? 0) > 0) {
                    <span class="dot"></span>
                    <span class="cc">
                      <gp-icon name="comment" [size]="14" [sw]="2" />
                      <b>{{ sec.lead.commentCount }}</b>
                    </span>
                  }
                </div>
              </div>
            </button>

            @for (a of sec.more; track a.id) {
              <button class="gp-row" (click)="goArticle(a.id)">
                <div class="thumb">
                  <div class="gp-img" [style.--cathue]="catHue(sec.cat)" style="aspect-ratio:1/1;height:104px"></div>
                </div>
                <div class="rbody">
                  <h3>{{ a.title }}</h3>
                  <div class="gp-meta">
                    <span>{{ a.date }}</span>
                    @if ((a.commentCount ?? 0) > 0) {
                      <span class="dot"></span>
                      <span class="cc"><gp-icon name="comment" [size]="13" [sw]="2" /><b>{{ a.commentCount }}</b></span>
                    }
                  </div>
                </div>
              </button>
            }
          </div>

          @if (i === 0 && !auth.isLoggedIn()) {
            <div class="gp-gate">
              <div class="gate-ico"><gp-icon name="shield" [size]="26" [sw]="1.6" /></div>
              <div class="gate-txt">
                <b>Регистрирай се за достъп</b>
                <span>до цялото съдържание и известия от бранша.</span>
              </div>
              <gp-btn variant="primary" size="sm" (pressed)="goAuth()">Вход</gp-btn>
            </div>
          }
        }
        <div style="height: var(--s6)"></div>
      }
    </ion-content>
  `,
  styles: [`
    ion-title { display: flex; justify-content: center; }
    ion-button { --color: var(--color-ink); }
    .gp-hero { display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 0; }
    button.gp-row { cursor: pointer; background: none; border: none; }
    button.gp-section-head { cursor: pointer; }
  `],
})
export class HomePage {
  protected readonly feed = inject(FeedStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected catHue(cat: Category): string {
    return `hsl(${cat.hue} 45% 55%)`;
  }

  goCategory(id: string): void {
    void this.router.navigate(['/category', id]);
  }

  goArticle(id: string): void {
    void this.router.navigate(['/article', id]);
  }

  goAuth(): void {
    void this.router.navigate(['/auth/login']);
  }

  openDrawer(): void {
    // Category drawer — future phase
  }

  refresh(event: CustomEvent): void {
    this.feed.loadHome(undefined);
    setTimeout(() => (event.target as HTMLIonRefresherElement).complete(), 1200);
  }
}
