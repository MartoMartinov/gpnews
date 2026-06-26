import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../shared/components';

/** Article detail placeholder (Phase 4). Route param: :id. */
@Component({
  selector: 'app-article-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    EmptyStateComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/home" /></ion-buttons>
        <ion-title>Статия</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state
        icon="news"
        title="Статия {{ id() }}"
        text="Съдържание + коментари (Phase 4)."
      />
    </ion-content>
  `,
})
export class ArticleDetailPage {
  readonly id = input<string>('');
}
