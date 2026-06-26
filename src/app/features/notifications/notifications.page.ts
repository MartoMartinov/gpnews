import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../shared/components';

/** Notifications placeholder (Phase 5 adds NotificationsStore + list). */
@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Известия</ion-title></ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state icon="bell" title="Известия" text="Известия от бранша (Phase 5)." />
    </ion-content>
  `,
})
export class NotificationsPage {}
