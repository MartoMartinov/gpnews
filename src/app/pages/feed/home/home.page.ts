import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import {
  ChipComponent,
  EmptyStateComponent,
  GpLogoComponent,
  IconComponent,
} from '../../../shared/components';

/** Home feed placeholder (Phase 3 adds per-category sections + FeedStore). */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, ChipComponent, EmptyStateComponent, GpLogoComponent, IconComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button aria-label="Меню"><gp-icon name="menu" [size]="24" [sw]="2" /></ion-button>
        </ion-buttons>
        <ion-title><gp-logo /></ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Търсене"><gp-icon name="search" [size]="22" [sw]="2" /></ion-button>
        </ion-buttons>
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
  styles: [
    `
      .pad {
        padding: 20px;
      }
      ion-title {
        display: flex;
        justify-content: center;
      }
      ion-button {
        --color: var(--color-ink);
      }
    `,
  ],
})
export class HomePage {}
