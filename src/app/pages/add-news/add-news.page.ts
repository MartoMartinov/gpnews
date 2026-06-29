import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
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
    @if (submitted()) {
      <!-- ── Done screen ── -->
      <ion-content [fullscreen]="true">
        <div class="addnews-done">
          <div class="done-ic"><gp-icon name="checkc" [size]="40" [sw]="1.6" /></div>
          <h1>Изпратено за одобрение</h1>
          <p>Благодарим! Статията ти е получена и ще бъде публикувана след преглед от администратор.</p>
          <div class="done-card">
            <div class="dc-row">
              <span>Статус</span>
              <gp-chip tone="warn">Изчаква одобрение</gp-chip>
            </div>
            @if (auth.user(); as user) {
              <div class="dc-row">
                <span>Публикувал</span>
                <b>{{ user.name }}</b>
              </div>
              <div class="dc-row">
                <span>ID на автора</span>
                <code>{{ user.id }}</code>
              </div>
            }
            <div class="dc-row">
              <span>Номер</span>
              <code>{{ submittedId() }}</code>
            </div>
          </div>
          <div class="done-foot" style="width: 100%">
            <gp-btn variant="primary" size="lg" [full]="true" (pressed)="goHome()">
              Към началото
            </gp-btn>
            <button class="addnews-secondary" (click)="goProfile()">
              Виж моите публикации
            </button>
          </div>
        </div>
      </ion-content>
    } @else {
      <!-- ── Edit form ── -->
      <div class="addnews-top">
        <button class="icbtn" (click)="close()" aria-label="Затвори">
          <gp-icon name="close" [size]="22" />
        </button>
        <span class="an-title">Добави новина</span>
        <button
          class="addnews-pub"
          [disabled]="loading() || !canSubmit()"
          (click)="submit()"
        >
          @if (loading()) {
            <span class="gp-spin"></span>
          } @else {
            Публикувай
          }
        </button>
      </div>

      <ion-content [fullscreen]="true">
        <div class="addnews-scroll">
          <div class="addnews-note">
            <gp-icon name="shield" [size]="16" [sw]="1.8" />
            <span>Публикациите се преглеждат от администратор преди да станат видими.</span>
          </div>

          <label class="fl">Категория</label>
          <div class="addnews-cats">
            @for (cat of feed.categories(); track cat.id) {
              <button class="anc" [class.on]="selectedCat() === cat.id" (click)="selectCat(cat.id)">
                <gp-icon [name]="cat.icon" [size]="14" [sw]="1.7" />
                {{ cat.name }}
              </button>
            }
          </div>

          <button class="addnews-upload" [class.has]="hasImg()" (click)="hasImg.set(!hasImg())">
            @if (hasImg()) {
              <div class="up-img-mock">
                <gp-icon name="img" [size]="32" [sw]="1.4" />
                <span>КАЧЕНО ИЗОБРАЖЕНИЕ</span>
              </div>
              <span class="up-remove" (click)="$event.stopPropagation(); hasImg.set(false)">
                <gp-icon name="trash" [size]="15" />Премахни
              </span>
            } @else {
              <div class="up-empty">
                <gp-icon name="img" [size]="26" [sw]="1.6" />
                <b>Добави изображение</b>
                <span>Снимка от обекта · JPG, PNG до 10 MB</span>
              </div>
            }
          </button>

          <div class="gp-field" [class.err]="formErr().title">
            <label>Заглавие</label>
            <input
              class="gp-input"
              placeholder="Кратко и ясно заглавие"
              [(ngModel)]="titleVal"
              maxlength="120"
            />
            @if (formErr().title) {
              <div class="errmsg">
                <gp-icon name="close" [size]="13" [sw]="2.5" />{{ formErr().title }}
              </div>
            } @else {
              <div class="fl-help">{{ titleVal.length }}/120</div>
            }
          </div>

          <div class="gp-field" [class.err]="formErr().body">
            <label>Съдържание</label>
            <textarea
              class="gp-textarea"
              rows="7"
              placeholder="Опиши новината — какво, къде и кога се случва…"
              [(ngModel)]="bodyVal"
            ></textarea>
            @if (formErr().body) {
              <div class="errmsg">
                <gp-icon name="close" [size]="13" [sw]="2.5" />{{ formErr().body }}
              </div>
            }
          </div>

          <gp-btn
            variant="primary"
            size="lg"
            [full]="true"
            [loading]="loading()"
            (pressed)="submit()"
          >
            Публикувай за одобрение
          </gp-btn>

          <div style="height: var(--s6)"></div>
        </div>
      </ion-content>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg);
    }
    .addnews-top {
      flex: none;
      padding-top: max(env(safe-area-inset-top), 16px);
    }
    .icbtn {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      color: var(--color-ink);
      background: none;
      border: none;
    }
    .up-img-mock {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: var(--s6) var(--s5);
      background: var(--color-surface-2);
      border-radius: var(--r-md);
      color: var(--color-ink-2);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .addnews-secondary {
      display: block;
      margin: var(--s4) auto 0;
      color: var(--color-ink-2);
      font-weight: 600;
      font-size: 14px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
    }
  `],
})
export class AddNewsPage implements OnDestroy {
  protected readonly feed = inject(FeedStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly selectedCat = signal('');
  protected readonly hasImg = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submittedId = signal('');
  protected readonly loading = signal(false);
  protected readonly formErr = signal<{ title?: string; body?: string }>({});

  protected titleVal = '';
  protected bodyVal = '';

  private _sub?: Subscription;

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  protected canSubmit(): boolean {
    return (
      !!this.selectedCat() &&
      this.titleVal.trim().length >= 6 &&
      this.bodyVal.trim().length >= 20
    );
  }

  selectCat(id: string): void {
    this.selectedCat.set(id);
  }

  submit(): void {
    const e: { title?: string; body?: string } = {};
    if (this.titleVal.trim().length < 6) e.title = 'Заглавието трябва да е поне 6 символа';
    if (this.bodyVal.trim().length < 20) e.body = 'Съдържанието е твърде кратко (мин. 20 символа)';
    this.formErr.set(e);
    if (Object.keys(e).length || !this.selectedCat()) return;

    this.loading.set(true);
    this._sub = this.feed
      .submitArticle({
        cat: this.selectedCat(),
        title: this.titleVal.trim(),
        body: this.bodyVal.trim(),
      })
      .subscribe({
        next: ({ id }) => {
          this.loading.set(false);
          this.submittedId.set(id);
          this.submitted.set(true);
          this.feed.loadMyArticles(undefined);
        },
        error: () => this.loading.set(false),
      });
  }

  close(): void {
    this.location.back();
  }

  goHome(): void {
    void this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }

  goProfile(): void {
    void this.router.navigateByUrl('/tabs/profile', { replaceUrl: true });
  }
}
