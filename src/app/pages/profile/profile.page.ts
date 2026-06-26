import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IONIC_IMPORTS } from '../../shared/ionic-imports';
import { EmptyStateComponent } from '../../shared/components';

/** Profile placeholder (Phase 6 adds ProfileStore + my-articles + settings). */
@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Профил</ion-title></ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state icon="user" title="Профил" text="Потребителски профил (Phase 6)." />
    </ion-content>
  `,
})
export class ProfilePage {}
