import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { Router } from '@angular/router';
import { BtnComponent, IconComponent } from '../../../shared/components';
import { FeedStore } from '../../../store/feed/feed.store';
import { DrawerService } from '../../../core/services/drawer.service';

@Component({
  selector: 'app-category-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BtnComponent, IconComponent],
  template: `
    @if (drawer.isOpen()) {
      <div class="gp-drawer-scrim" (click)="drawer.close()">
        <div class="gp-drawer" (click)="$event.stopPropagation()">

          <div class="drawer-head">
            <span class="t">Категории</span>
            <button class="icbtn" (click)="drawer.close()" aria-label="Затвори">
              <gp-icon name="close" [size]="22" />
            </button>
          </div>

          <div class="drawer-list">
            @for (cat of feed.categories(); track cat.id) {
              <button class="drawer-item" (click)="openCategory(cat.id)">
                <span class="di-ic">
                  <gp-icon [name]="cat.icon" [size]="21" [sw]="1.6" />
                </span>
                <span class="di-name">{{ cat.name }}</span>
                <span class="di-count">{{ feed.byCat(cat.id).length }}</span>
                <gp-icon name="fwd" [size]="17" class="di-arrow" />
              </button>
            }
          </div>

          <div class="drawer-foot">
            <gp-btn variant="primary" size="lg" [full]="true" icon="plus"
              (pressed)="addNews()">
              Добави новина
            </gp-btn>
          </div>

        </div>
      </div>
    }
  `,
})
export class CategoryDrawerComponent {
  protected readonly feed = inject(FeedStore);
  protected readonly drawer = inject(DrawerService);
  private readonly router = inject(Router);

  openCategory(catId: string): void {
    this.drawer.close();
    void this.router.navigate(['/category', catId]);
  }

  addNews(): void {
    this.drawer.close();
    void this.router.navigate(['/add-news']);
  }
}
