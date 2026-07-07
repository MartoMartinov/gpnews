import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
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
              <button
                class="drawer-item"
                [class.on]="cat.id === activeCatId()"
                (click)="openCategory(cat.id)"
              >
                <span class="di-ic">
                  <gp-icon [name]="cat.icon" [size]="21" [sw]="1.6" />
                </span>
                <span class="di-name">{{ cat.name }}</span>
                <span class="di-count">{{ cat.count ?? 0 }}</span>
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

  protected readonly activeCatId = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => this.parseCatId(e.urlAfterRedirects)),
      startWith(this.parseCatId(this.router.url)),
    ),
    { initialValue: null as string | null },
  );

  private parseCatId(url: string): string | null {
    return url.match(/^\/category\/([^/?#]+)/)?.[1] ?? null;
  }

  openCategory(catId: string): void {
    this.drawer.close();
    void this.router.navigate(['/category', catId]);
  }

  addNews(): void {
    this.drawer.close();
    void this.router.navigate(['/add-news']);
  }
}
