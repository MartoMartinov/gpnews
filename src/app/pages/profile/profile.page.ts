import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IONIC_IMPORTS } from '../../shared/ionic-imports';
import { AvatarComponent, BtnComponent, EmptyStateComponent } from '../../shared/components';
import { AuthStore } from '../../store/auth/auth.store';

/** Profile — minimal in Phase 2 (Phase 6 adds my-articles + settings). */
@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, AvatarComponent, BtnComponent, EmptyStateComponent],
  styles: [`
    .prof-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--s6) var(--s5) var(--s5);
      text-align: center;
      gap: var(--s2);
    }
    .prof-name {
      font-family: var(--font-head);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1.2;
      margin: 8px 0 2px;
      color: var(--color-ink);
    }
    .prof-email {
      font-family: var(--font-mono);
      font-size: 13.5px;
      color: var(--color-ink-3);
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Профил</ion-title></ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      @if (store.user(); as user) {
        <div class="prof-head">
          <gp-avatar [user]="user" [size]="72" />
          <h1 class="prof-name">{{ user.name }}</h1>
          <span class="prof-email">{{ user.email }}</span>
        </div>
        <div style="padding: 0 var(--s5)">
          <gp-btn variant="ghost" size="md" [full]="true" (pressed)="store.logout()">
            Изход от профила
          </gp-btn>
        </div>
      } @else {
        <gp-empty-state icon="user" title="Профил" text="Потребителски профил (Phase 6)." />
      }
    </ion-content>
  `,
})
export class ProfilePage {
  protected readonly store = inject(AuthStore);
}
