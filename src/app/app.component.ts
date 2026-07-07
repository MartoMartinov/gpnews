import { Component, effect, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NetworkService } from './core/services/network.service';
import { PushNotificationService } from './core/services/push-notification.service';
import { AuthStore } from './store/auth/auth.store';
import { IconComponent } from './shared/components';
import { CategoryDrawerComponent } from './pages/feed/category-drawer/category-drawer.component';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet, IconComponent, CategoryDrawerComponent],
  template: `
    <ion-app>
      <ion-router-outlet [swipeGesture]="true" />
      @if (!network.online()) {
        <div class="offline-banner" role="status" aria-live="polite">
          <gp-icon name="wifi" [size]="16" [sw]="2.2" />
          Няма интернет връзка
        </div>
      }
      <app-category-drawer />
    </ion-app>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: env(safe-area-inset-top, 0px);
      left: 0;
      right: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: #1c1c1c;
      color: #fff;
      font-size: 13.5px;
      font-weight: 600;
      font-family: var(--font-head);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.32);
      animation: gpfadein 0.2s ease;
    }
  `],
})
export class AppComponent {
  protected readonly network = inject(NetworkService);
  private readonly push = inject(PushNotificationService);
  private readonly auth = inject(AuthStore);

  constructor() {
    this.push.init();

    effect(() => {
      if (this.auth.isLoggedIn()) {
        void this.push.requestAndRegister();
      }
    });
  }
}
