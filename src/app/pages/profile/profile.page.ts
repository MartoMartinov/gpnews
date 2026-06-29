import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IONIC_IMPORTS } from '../../shared/ionic-imports';
import {
  AvatarComponent,
  BtnComponent,
  ChipComponent,
  EmptyStateComponent,
  IconComponent,
} from '../../shared/components';
import { AuthStore } from '../../store/auth/auth.store';
import { FeedStore } from '../../store/feed/feed.store';
import { ProfileStore } from '../../store/profile/profile.store';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProfileStore],
  imports: [
    IONIC_IMPORTS,
    FormsModule,
    AvatarComponent,
    BtnComponent,
    ChipComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Профил</ion-title></ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      @if (!auth.isLoggedIn()) {
        <!-- ── Guest state ── -->
        <gp-empty-state
          icon="user"
          title="Не си влязъл в профил"
          text="Влез или се регистрирай, за да създаваш новини, да коментираш и да получаваш известия."
        />
        <div class="prof-auth-btns">
          <gp-btn variant="primary" size="md" (pressed)="goLogin()">Вход</gp-btn>
          <gp-btn variant="outline" size="md" (pressed)="goSignup()">Регистрация</gp-btn>
        </div>
      } @else {
        @if (auth.user(); as user) {
          <!-- ── Header ── -->
          <div class="prof-head">
            <gp-avatar [user]="user" [size]="72" />
            <h1>{{ user.name }}</h1>
            <span class="prof-email">{{ user.email }}</span>
          </div>

          <!-- ── My articles ── -->
          <div class="prof-section">
            <div class="prof-sec-title">Моите публикации</div>
            @if (feed.myArticles().length === 0) {
              <gp-empty-state
                icon="news"
                title="Нямаш публикации"
                text="Сподели новина от обекта — ще се появи тук след одобрение."
              />
              <div style="text-align: center; margin-top: -12px; padding-bottom: var(--s4)">
                <gp-btn variant="outline" size="sm" (pressed)="goAddNews()">
                  Добави новина
                </gp-btn>
              </div>
            } @else {
              @for (art of feed.myArticles(); track art.id) {
                <div class="prof-art">
                  <div class="pa-ic">
                    <gp-icon [name]="catIcon(art.cat)" [size]="18" [sw]="1.7" />
                  </div>
                  <div class="pa-body">
                    <b>{{ art.title }}</b>
                    <span>{{ art.date }}</span>
                  </div>
                  @if (art.pending) {
                    <gp-chip tone="warn">Изчаква</gp-chip>
                  } @else {
                    <gp-chip tone="ok">Публикувана</gp-chip>
                  }
                </div>
              }
            }
          </div>

          <!-- ── Settings ── -->
          <div class="prof-section">
            <div class="prof-sec-title">Настройки</div>
            <div class="gp-field">
              <label>Имe и фамилия</label>
              <input class="gp-input" [(ngModel)]="nameVal" autocomplete="name" />
            </div>
            <div class="gp-field">
              <label>Имейл адрес</label>
              <input class="gp-input" [value]="user.email ?? ''" disabled />
            </div>
            <gp-btn
              variant="ghost"
              size="md"
              [full]="true"
              [loading]="profileStore.isPending()"
              (pressed)="saveName()"
            >
              Запази промените
            </gp-btn>
          </div>

          <!-- ── Change password ── -->
          <div class="prof-section">
            <div class="prof-sec-title">Смяна на парола</div>

            <div class="gp-field" [class.err]="pwErr().current">
              <label>Текуща парола</label>
              <div class="gp-input-wrap">
                <input
                  class="gp-input"
                  [type]="showPwC() ? 'text' : 'password'"
                  placeholder="••••••••"
                  [(ngModel)]="pwCurrent"
                  autocomplete="current-password"
                />
                <button type="button" class="eye-btn" (click)="showPwC.set(!showPwC())" tabindex="-1">
                  <gp-icon [name]="showPwC() ? 'eyeoff' : 'eye'" [size]="17" [sw]="1.7" />
                </button>
              </div>
              @if (pwErr().current) {
                <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />{{ pwErr().current }}</div>
              }
            </div>

            <div class="gp-field" [class.err]="pwErr().next">
              <label>Нова парола</label>
              <div class="gp-input-wrap">
                <input
                  class="gp-input"
                  [type]="showPwN() ? 'text' : 'password'"
                  placeholder="••••••••"
                  [(ngModel)]="pwNext"
                  autocomplete="new-password"
                />
                <button type="button" class="eye-btn" (click)="showPwN.set(!showPwN())" tabindex="-1">
                  <gp-icon [name]="showPwN() ? 'eyeoff' : 'eye'" [size]="17" [sw]="1.7" />
                </button>
              </div>
              @if (pwErr().next) {
                <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />{{ pwErr().next }}</div>
              }
            </div>

            <div class="gp-field" [class.err]="pwErr().confirm">
              <label>Потвърди новата парола</label>
              <div class="gp-input-wrap">
                <input
                  class="gp-input"
                  [type]="showPwR() ? 'text' : 'password'"
                  placeholder="••••••••"
                  [(ngModel)]="pwConfirm"
                  autocomplete="new-password"
                />
                <button type="button" class="eye-btn" (click)="showPwR.set(!showPwR())" tabindex="-1">
                  <gp-icon [name]="showPwR() ? 'eyeoff' : 'eye'" [size]="17" [sw]="1.7" />
                </button>
              </div>
              @if (pwErr().confirm) {
                <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />{{ pwErr().confirm }}</div>
              }
            </div>

            <gp-btn
              variant="ghost"
              size="md"
              [full]="true"
              [loading]="profileStore.pwPending()"
              (pressed)="changePassword()"
            >
              Смени паролата
            </gp-btn>
          </div>

          <!-- ── Logout ── -->
          <button class="prof-logout" (click)="auth.logout()">
            <gp-icon name="logout" [size]="18" [sw]="1.8" />
            Изход от профила
          </button>

          <!-- ── Delete account ── -->
          @if (delStep() === 0) {
            <div style="text-align: center; padding: 0 var(--s5) var(--s6)">
              <button class="del-account-trigger" (click)="delStep.set(1)">
                Изтриване на профил
              </button>
            </div>
          }

          @if (delStep() === 1) {
            <div class="del-account-panel">
              <div class="del-icon"><gp-icon name="trash" [size]="22" [sw]="1.6" /></div>
              <h3>Изтриване на профил</h3>
              <p>Това действие е необратимо. Всички твои данни, публикации и коментари ще бъдат изтрити завинаги.</p>
              <div class="del-checklist">
                <span><gp-icon name="close" [size]="13" [sw]="2.5" />Всички твои публикации</span>
                <span><gp-icon name="close" [size]="13" [sw]="2.5" />Всички твои коментари</span>
                <span><gp-icon name="close" [size]="13" [sw]="2.5" />Данните на профила ти</span>
              </div>
              <div class="del-btn-row">
                <gp-btn variant="ghost" size="md" [full]="true" (pressed)="delStep.set(0)">Откажи</gp-btn>
                <gp-btn variant="outline" size="md" [full]="true" (pressed)="delStep.set(2)">Продължи</gp-btn>
              </div>
            </div>
          }

          @if (delStep() === 2) {
            <div class="del-account-panel">
              <div class="del-icon danger"><gp-icon name="trash" [size]="22" [sw]="1.6" /></div>
              <h3>Последна стъпка</h3>
              <p>Напиши <b>ИЗТРИВАНЕ</b> в полето по-долу, за да потвърдиш окончателното изтриване.</p>
              <div
                class="gp-field"
                [class.err]="delTyped() && delTyped() !== 'ИЗТРИВАНЕ'"
                style="margin-top: var(--s4)"
              >
                <input
                  class="gp-input"
                  placeholder="ИЗТРИВАНЕ"
                  [ngModel]="delTyped()"
                  (ngModelChange)="delTyped.set($event.toUpperCase())"
                />
                @if (delTyped() && delTyped() !== 'ИЗТРИВАНЕ') {
                  <div class="errmsg">
                    <gp-icon name="close" [size]="13" [sw]="2.5" />Текстът не съвпада
                  </div>
                }
              </div>
              <div class="del-btn-row">
                <gp-btn
                  variant="ghost"
                  size="md"
                  [full]="true"
                  (pressed)="delStep.set(0); delTyped.set('')"
                >Откажи</gp-btn>
                <button
                  class="del-confirm-btn"
                  [class.ready]="delTyped() === 'ИЗТРИВАНЕ'"
                  [disabled]="delTyped() !== 'ИЗТРИВАНЕ' || profileStore.deletePending()"
                  (click)="deleteAccount()"
                >
                  @if (profileStore.deletePending()) {
                    <span class="gp-spin"></span>
                  } @else {
                    <gp-icon name="trash" [size]="15" [sw]="2" />Изтрий
                  }
                </button>
              </div>
            </div>
          }

          <div style="height: var(--s8)"></div>
        }
      }
    </ion-content>
  `,
})
export class ProfilePage implements OnInit {
  protected readonly auth = inject(AuthStore);
  protected readonly feed = inject(FeedStore);
  protected readonly profileStore = inject(ProfileStore);
  private readonly router = inject(Router);

  // Settings
  protected nameVal = '';

  // Password section
  protected pwCurrent = '';
  protected pwNext = '';
  protected pwConfirm = '';
  protected readonly showPwC = signal(false);
  protected readonly showPwN = signal(false);
  protected readonly showPwR = signal(false);
  protected readonly pwErr = signal<{ current?: string; next?: string; confirm?: string }>({});

  // Delete account
  protected readonly delStep = signal(0);
  protected readonly delTyped = signal('');

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) this.nameVal = user.name;
    });
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.feed.loadMyArticles(undefined);
    }
  }

  protected catIcon(catId: string): string {
    return this.feed.catOf(catId)?.icon ?? 'news';
  }

  protected saveName(): void {
    const name = this.nameVal.trim();
    if (name.length < 3) return;
    this.profileStore.saveName(name);
  }

  protected changePassword(): void {
    const e: { current?: string; next?: string; confirm?: string } = {};
    if (!this.pwCurrent) e.current = 'Въведи текущата парола';
    if (this.pwNext.length < 6) e.next = 'Паролата трябва да е поне 6 символа';
    if (this.pwNext !== this.pwConfirm) e.confirm = 'Паролите не съвпадат';
    this.pwErr.set(e);
    if (Object.keys(e).length) return;
    this.profileStore.changePassword({ current: this.pwCurrent, password: this.pwNext });
    this.pwCurrent = '';
    this.pwNext = '';
    this.pwConfirm = '';
  }

  protected deleteAccount(): void {
    if (this.delTyped() !== 'ИЗТРИВАНЕ') return;
    this.profileStore.deleteAccount(undefined);
  }

  protected goLogin(): void {
    void this.router.navigateByUrl('/auth/login');
  }

  protected goSignup(): void {
    void this.router.navigateByUrl('/auth/signup');
  }

  protected goAddNews(): void {
    void this.router.navigateByUrl('/add-news');
  }
}
