import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { BtnComponent, GpLogoComponent } from '../../../shared/components';

/** Login placeholder (Phase 2 adds the reactive form + AuthService). */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, BtnComponent, GpLogoComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth">
        <gp-logo />
        <gp-btn variant="primary" size="lg" [full]="true" (pressed)="enter()">Вход</gp-btn>
        <button class="guest" (click)="enter()">Продължи като гост</button>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .auth {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 18px;
        padding: 24px;
      }
      .guest {
        color: var(--color-ink-2);
        font-weight: 600;
        background: none;
        border: none;
      }
    `,
  ],
})
export class LoginPage {
  private readonly router = inject(Router);

  enter(): void {
    this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }
}
