import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IONIC_IMPORTS } from '../../shared/ionic-imports';
import { AvatarComponent, BtnComponent, EmptyStateComponent } from '../../shared/components';
import { AuthStore } from '../../store/auth/auth.store';

/** Profile — minimal in Phase 2 (Phase 6 adds my-articles + settings). */
@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, AvatarComponent, BtnComponent, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Профил</ion-title></ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      @if (store.user(); as user) {
        <div class="flex flex-col items-center gap-2 px-5 py-8 text-center">
          <gp-avatar [user]="user" [size]="72" />
          <h1 class="mt-2 text-[22px] font-extrabold tracking-tight">{{ user.name }}</h1>
          <span class="font-mono text-[13.5px] text-[var(--color-ink-3)]">{{ user.email }}</span>
        </div>
        <div class="px-5">
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
