import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { GpLogoComponent } from '../../../shared/components';
import { AuthStore } from '../../../store/auth/auth.store';

/** Splash — shows the logo while auto-login runs, then routes onward. */
@Component({
  selector: 'app-splash',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, GpLogoComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="splash">
        <gp-logo [height]="84" />
        <span class="gp-spin"></span>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .splash {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 40px;
        color: var(--color-accent);
      }
    `,
  ],
})
export class SplashPage {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    // Route once AuthStore.bootstrap() (run in its onInit) has settled.
    effect(() => {
      if (this.store.initialized()) {
        const target = this.store.isLoggedIn() ? '/tabs/home' : '/onboarding';
        this.router.navigateByUrl(target, { replaceUrl: true });
      }
    });
  }
}
