import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { IonTabBar, IonTabButton, IonLabel, IonTabs } from '@ionic/angular/standalone';
import { IconComponent } from '../../shared/components';
import { AuthStore } from '../../store/auth/auth.store';
import { NotificationsStore } from '../../store/notifications/notifications.store';

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, IconComponent],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        @if (authStore.isLoggedIn()) {
          <ion-tab-button tab="home">
            <gp-icon name="home" [size]="23" [class.ic-active]="tab() === 'home'" />
            <ion-label>Начало</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="polls">
            <gp-icon name="tray" [size]="23" [class.ic-active]="tab() === 'polls'" />
            <ion-label>Анкети</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="notifications">
            <span class="ic-wrap">
              <gp-icon name="bell" [size]="23" [class.ic-active]="tab() === 'notifications'" />
              @if (notifStore.unreadCount() > 0) {
                <span class="ic-badge">{{ notifStore.unreadCount() }}</span>
              }
            </span>
            <ion-label>Известия</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile">
            <gp-icon name="user" [size]="23" [class.ic-active]="tab() === 'profile'" />
            <ion-label>Профил</ion-label>
          </ion-tab-button>
        } @else {
          <ion-tab-button tab="home">
            <gp-icon name="home" [size]="23" [class.ic-active]="tab() === 'home'" />
            <ion-label>Начало</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile">
            <gp-icon name="user" [size]="23" [class.ic-active]="tab() === 'profile'" />
            <ion-label>Профил</ion-label>
          </ion-tab-button>
        }
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .ic-active { color: var(--color-accent); }

    .ic-wrap {
      position: relative;
      display: grid;
      place-items: center;
    }

    .ic-badge {
      position: absolute;
      top: -5px;
      right: -9px;
      min-width: 8px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--color-danger);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      display: grid;
      place-items: center;
      line-height: 1;
      box-shadow: 0 0 0 2px var(--color-surface);
    }
  `],
})
export class TabsPage {
  protected readonly authStore = inject(AuthStore);
  protected readonly notifStore = inject(NotificationsStore);
  private readonly router = inject(Router);

  protected readonly tab = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => this.parseTab((e as NavigationEnd).urlAfterRedirects)),
      startWith(this.parseTab(this.router.url)),
    ),
    { initialValue: 'home' },
  );

  goLogin(): void {
    void this.router.navigateByUrl('/auth/login');
  }

  private parseTab(url: string): string {
    return url.match(/\/tabs\/([^/?#]+)/)?.[1] ?? 'home';
  }
}
