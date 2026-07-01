import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IONIC_IMPORTS } from '../../ionic-imports';
import { DrawerService } from '../../../core/services/drawer.service';
import { IconComponent } from '../icon/icon.component';
import { GpLogoComponent } from '../gp-logo/gp-logo.component';

/** Shared top bar for the main tabs (home, polls, notifications, profile): menu, logo, search. */
@Component({
  selector: 'gp-tab-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, IconComponent, GpLogoComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button aria-label="Категории" (click)="openDrawer()">
            <gp-icon name="menu" [size]="24" [sw]="2" />
          </ion-button>
        </ion-buttons>
        <div class="logo-wrapper"><gp-logo class="" /></div>
        <ion-buttons slot="end">
          <ion-button aria-label="Търсене" (click)="goSearch()">
            <gp-icon name="search" [size]="22" [sw]="2" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  styles: [
    `
      .logo-wrapper {
        display: flex;
        justify-content: center;
         align-items: center;
      }
      gp-logo {
      }
      ion-button {
        --color: var(--color-ink);
      }
    `,
  ],
})
export class TabHeaderComponent {
  private readonly router = inject(Router);
  private readonly drawerSvc = inject(DrawerService);

  goSearch(): void {
    void this.router.navigate(['/search']);
  }

  openDrawer(): void {
    this.drawerSvc.open();
  }
}
