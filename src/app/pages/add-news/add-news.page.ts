import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IONIC_IMPORTS } from '../../shared/ionic-imports';
import { BtnComponent, ChipComponent, IconComponent } from '../../shared/components';
import { FeedStore } from '../../store/feed/feed.store';
import { AuthStore } from '../../store/auth/auth.store';

@Component({
  selector: 'app-add-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, FormsModule, BtnComponent, ChipComponent, IconComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Добави новина</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      @if (!auth.isLoggedIn()) {
        <div class="gp-gate" style="margin: var(--s5)">
          <div class="gate-ico"><gp-icon name="shield" [size]="26" [sw]="1.6" /></div>
          <div class="gate-txt">
            <b>Само за регистрирани</b>
            <span>Влез в профила си, за да добавиш новина.</span>
          </div>
          <gp-btn variant="primary" size="sm" (pressed)="goAuth()">Вход</gp-btn>
        </div>
      } @else if (submitted()) {
        <div class="addnews-done">
          <div class="done-card">
            <div class="dc-row">
              <gp-icon name="checkc" [size]="40" [sw]="1.6" />
            </div>
            <h2>Изпратено!</h2>
            <p>Новината ти е подадена и ще бъде прегледана от администратор.</p>
            <gp-btn variant="dark" size="lg" [full]="true" (pressed)="reset()">
              Добави още
            </gp-btn>
          </div>
        </div>
      } @else {
        <div class="addnews-scroll">
          <div class="addnews-note">
            <gp-icon name="info" [size]="16" [sw]="1.8" />
            <span>Преди да стане видима, новината минава одобрение от администратор.</span>
          </div>

          <label class="gp-label">Категория</label>
          <div class="addnews-cats">
            @for (cat of feed.categories(); track cat.id) {
              <button class="anc" [class.on]="selectedCat() === cat.id"
                (click)="selectCat(cat.id)">
                <gp-icon [name]="cat.icon" [size]="14" [sw]="1.7" />
                {{ cat.name }}
              </button>
            }
          </div>

          <label class="gp-label">Снимка</label>
          <div class="addnews-upload">
            <gp-icon name="img" [size]="32" [sw]="1.4" />
            <span>Натисни, за да качиш снимка</span>
            <span class="fl-help">JPG · PNG · max 5 MB</span>
          </div>

          <label class="gp-label" for="anTitle">Заглавие</label>
          <input id="anTitle" class="gp-input" type="text"
            placeholder="Заглавие на новината…"
            [(ngModel)]="titleVal" maxlength="120" />

          <label class="gp-label" for="anBody">Кратко описание</label>
          <textarea id="anBody" class="gp-textarea" rows="5"
            placeholder="Опиши накратко новината…"
            [(ngModel)]="bodyVal">
          </textarea>

          <div style="height: var(--s5)"></div>

          <gp-btn variant="dark" size="lg" [full]="true"
            [loading]="loading()"
            [disabled]="!canSubmit()"
            (pressed)="submit()">
            Изпрати за одобрение
          </gp-btn>

          <div style="height: var(--s6)"></div>
        </div>
      }
    </ion-content>
  `,
})
export class AddNewsPage implements OnDestroy {
  protected readonly feed = inject(FeedStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly selectedCat = signal('');
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);

  protected titleVal = '';
  protected bodyVal = '';

  private _sub?: Subscription;

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  protected canSubmit(): boolean {
    return !!this.selectedCat() && this.titleVal.trim().length >= 6 && this.bodyVal.trim().length >= 20;
  }

  selectCat(id: string): void {
    this.selectedCat.set(id);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.loading.set(true);
    this._sub = this.feed.submitArticle({
      cat: this.selectedCat(),
      title: this.titleVal.trim(),
      body: this.bodyVal.trim(),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => this.loading.set(false),
    });
  }

  reset(): void {
    this.submitted.set(false);
    this.selectedCat.set('');
    this.titleVal = '';
    this.bodyVal = '';
  }

  goAuth(): void {
    void this.router.navigate(['/auth/login']);
  }
}
