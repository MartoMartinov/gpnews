import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { EmptyStateComponent } from '../../../shared/components';

/** Poll detail placeholder (Phase 5). Route param: :id. */
@Component({
  selector: 'app-poll-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/polls" /></ion-buttons>
        <ion-title>Анкета</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state icon="tray" title="Анкета {{ id() }}" text="Гласуване + резултати (Phase 5)." />
    </ion-content>
  `,
})
export class PollDetailPage {
  readonly id = input<string>('');
}
