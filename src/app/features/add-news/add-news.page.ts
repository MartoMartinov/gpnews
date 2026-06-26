import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../shared/components';

/** Add News placeholder (Phase 6 adds the editor + submit flow). */
@Component({
  selector: 'app-add-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    EmptyStateComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-button (click)="close()">Затвори</ion-button></ion-buttons>
        <ion-title>Добави новина</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state icon="plus" title="Добави новина" text="Редактор за нова статия (Phase 6)." />
    </ion-content>
  `,
})
export class AddNewsPage {
  private readonly location = inject(Location);

  close(): void {
    this.location.back();
  }
}
