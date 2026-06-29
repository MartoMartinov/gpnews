import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from '../../shared/ionic-imports';
import { EmptyStateComponent, IconComponent, SkeletonComponent } from '../../shared/components';
import { NotificationsStore } from '../../store/notifications/notifications.store';
import { AuthStore } from '../../store/auth/auth.store';

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, IonRefresher, IonRefresherContent, EmptyStateComponent, IconComponent, SkeletonComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Известия</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      @if (!auth.isLoggedIn()) {
        <gp-empty-state
          icon="bell"
          title="Влез в профила си"
          text="Известията са достъпни само за регистрирани потребители."
        />
      } @else {
        <div class="gp-section-head">
          <span class="t">Известия</span>
          @if (!store.loading() && store.unreadCount() > 0) {
            <button class="notif-readall" (click)="store.markAllRead(undefined)">
              Отбележи всички
            </button>
          }
        </div>

        @if (store.loading()) {
          <div style="padding: 0 var(--s5)">
            @for (i of [0,1,2,3]; track i) {
              <div class="notif-card" style="margin-bottom:var(--s3); pointer-events:none">
                <gp-skeleton width="42px" height="42px" [radius]="12" />
                <div style="flex:1">
                  <gp-skeleton width="92%" height="13px" style="margin-bottom:8px; display:block" />
                  <gp-skeleton width="60%" height="13px" />
                </div>
              </div>
            }
          </div>
        } @else if (store.items().length === 0) {
          <gp-empty-state icon="bell" title="Няма известия"
            text="Когато има нещо ново от бранша, ще го видиш тук." />
        } @else {
          <div class="notif-list">
            @for (n of store.items(); track n.id) {
              <button class="notif-card" [class.unread]="!n.read" (click)="open(n.id, n.art)">
                <span class="notif-ic"><gp-icon name="clock" [size]="20" [sw]="1.7" /></span>
                <span class="notif-body">
                  <span class="notif-title">{{ n.title }}</span>
                </span>
                <span class="notif-ago">{{ n.ago }}</span>
                @if (!n.read) { <span class="notif-dot"></span> }
              </button>
            }
            <div style="height: var(--s6)"></div>
          </div>
        }
      }
    </ion-content>
  `,
})
export class NotificationsPage implements OnInit {
  protected readonly store = inject(NotificationsStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.store.loadNotifications(undefined);
    }
  }

  open(id: string, artId?: string): void {
    this.store.markRead(id);
    if (artId) void this.router.navigate(['/article', artId]);
  }

  refresh(event: CustomEvent): void {
    if (this.auth.isLoggedIn()) {
      this.store.loadNotifications(undefined);
    }
    setTimeout(() => (event.target as HTMLIonRefresherElement).complete(), 1000);
  }
}
