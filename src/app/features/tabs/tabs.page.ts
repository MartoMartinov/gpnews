import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  fileTrayOutline,
  notificationsOutline,
  personOutline,
} from 'ionicons/icons';

/** Bottom tab shell: Home · Polls · Notifications · Profile. */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline" />
          <ion-label>Начало</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="polls">
          <ion-icon name="file-tray-outline" />
          <ion-label>Анкети</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="notifications">
          <ion-icon name="notifications-outline" />
          <ion-label>Известия</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline" />
          <ion-label>Профил</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, fileTrayOutline, notificationsOutline, personOutline });
  }
}
