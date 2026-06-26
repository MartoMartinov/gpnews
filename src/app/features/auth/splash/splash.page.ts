import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { GpLogoComponent } from '../../../shared/components';

/** Splash — shows the logo briefly, then routes onward. */
@Component({
  selector: 'app-splash',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, GpLogoComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="splash">
        <gp-logo [big]="true" />
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
export class SplashPage implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    // TODO (Phase 2): check stored token → home vs onboarding.
    setTimeout(() => this.router.navigateByUrl('/onboarding', { replaceUrl: true }), 1700);
  }
}
