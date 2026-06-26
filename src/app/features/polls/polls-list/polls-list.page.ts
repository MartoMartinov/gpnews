import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../shared/components';

/** Polls list placeholder (Phase 5 adds PollsStore + rows). */
@Component({
  selector: 'app-polls-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Анкети</ion-title></ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state icon="tray" title="Анкети" text="Списък с анкети (Phase 5)." />
    </ion-content>
  `,
})
export class PollsListPage {}
