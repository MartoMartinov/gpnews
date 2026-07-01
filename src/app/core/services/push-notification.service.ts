import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastController);

  private readonly isNative = Capacitor.isNativePlatform();
  private listenersAdded = false;
  private registrationDone = false;

  /**
   * Wire all Capacitor listeners. Call once at app startup from AppComponent.
   * Safe to call on web — all calls are no-ops when not native.
   */
  init(): void {
    if (!this.isNative || this.listenersAdded) return;
    this.listenersAdded = true;

    void PushNotifications.addListener('registration', (token: Token) => {
      this.sendTokenToBackend(token.value);
    });

    void PushNotifications.addListener('registrationError', (err) => {
      console.warn('[Push] Registration error:', err);
    });

    // Foreground notification — show as toast
    void PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        void this.showForegroundToast(notification);
      },
    );

    // User tapped a notification (background / killed state)
    void PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        this.handleNotificationTap(action.notification.data);
      },
    );
  }

  /**
   * Request permission and register for push notifications.
   * Call after successful login. Idempotent — only runs once per app session.
   */
  async requestAndRegister(): Promise<void> {
    if (!this.isNative || this.registrationDone) return;
    this.registrationDone = true;

    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.info('[Push] Permission not granted:', permStatus.receive);
      return;
    }

    await PushNotifications.register();
  }

  private sendTokenToBackend(token: string): void {
    this.http
      .post(`${environment.apiBaseUrl}/push/register`, { token })
      .subscribe({ error: () => {} });
  }

  private async showForegroundToast(notification: PushNotificationSchema): Promise<void> {
    const t = await this.toast.create({
      header: notification.title ?? 'G.P. News',
      message: notification.body ?? '',
      duration: 4000,
      position: 'top',
      color: 'dark',
      buttons: [
        {
          text: 'Отвори',
          handler: () => {
            this.handleNotificationTap(notification.data);
          },
        },
        { icon: 'close', role: 'cancel' },
      ],
    });
    await t.present();
  }

  private handleNotificationTap(data?: Record<string, string>): void {
    if (!data) return;
    if (data['articleId']) {
      void this.router.navigate(['/article', data['articleId']]);
    } else if (data['url']) {
      void this.router.navigateByUrl(data['url']);
    }
  }
}
