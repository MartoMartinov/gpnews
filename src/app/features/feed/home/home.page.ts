import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { ChipComponent, EmptyStateComponent } from '../../../shared/components';

/** Home feed placeholder (Phase 3 adds per-category sections + FeedStore). */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    ChipComponent,
    EmptyStateComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-button>Меню</ion-button></ion-buttons>
        <ion-title>G.P. News</ion-title>
        <ion-buttons slot="end"><ion-button>Търси</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <div class="pad">
        <gp-chip tone="accent">Phase 1 skeleton</gp-chip>
        <gp-empty-state
          icon="news"
          title="Начален екран"
          text="Тук ще се зареждат новините по категории (Phase 3)."
        />
      </div>
    </ion-content>
  `,
  styles: [`.pad { padding: 20px; }`],
})
export class HomePage {}
