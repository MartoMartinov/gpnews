import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { BtnComponent } from '../../../shared/components';

/** Onboarding placeholder (Phase 2 will add the 3-slide carousel). */
@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, BtnComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="onb">
        <h1>G.P. News</h1>
        <p>Новини от строителния бранш — на едно място.</p>
        <gp-btn variant="dark" size="lg" [full]="true" (pressed)="start()">Започни</gp-btn>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .onb {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 24px;
        text-align: center;
      }
      h1 {
        font-family: var(--font-head);
        font-weight: 800;
        font-size: 27px;
        margin: 0;
      }
      p {
        color: var(--color-ink-2);
        margin: 0 0 16px;
      }
    `,
  ],
})
export class OnboardingPage {
  private readonly router = inject(Router);

  start(): void {
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
