import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../shared/components';

/** Profile placeholder (Phase 6 adds ProfileStore + my-articles + settings). */
@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, EmptyStateComponent],
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
