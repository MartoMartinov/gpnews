import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../shared/components';

/** Category article list placeholder (Phase 3). Route param: :id. */
@Component({
  selector: 'app-category-list',
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
        <ion-title>Категория</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true">
      <gp-empty-state icon="news" title="Категория {{ id() }}" text="Статии по категория (Phase 3)." />
    </ion-content>
  `,
})
export class CategoryListPage {
  /** Bound from the route param via withComponentInputBinding(). */
  readonly id = input<string>('');
}
