import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { BtnComponent } from '../../../shared/components';

/** Signup placeholder (Phase 2 adds the reactive form). */
@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, BtnComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth">
        <h1>Регистрация</h1>
        <gp-btn variant="primary" size="lg" [full]="true" (pressed)="back()">Назад</gp-btn>
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
      h1 {
        font-family: var(--font-head);
        font-weight: 800;
      }
    `,
  ],
})
export class SignupPage {
  private readonly location = inject(Location);

  back(): void {
    this.location.back();
  }
}
