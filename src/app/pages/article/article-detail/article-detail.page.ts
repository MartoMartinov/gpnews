import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import {
  AvatarComponent,
  BlueprintComponent,
  EmptyStateComponent,
  IconComponent,
  SkeletonComponent,
} from '../../../shared/components';
import { FeedStore } from '../../../store/feed/feed.store';
import { AuthStore } from '../../../store/auth/auth.store';
import { Comment } from '../../../shared/models';

function countAll(list: Comment[]): number {
  return list.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
}

function fmtAgo(mins: number): string {
  if (mins < 1) return 'сега';
  if (mins < 60) return `преди ${mins} мин`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `преди ${h} ч`;
  return `преди ${Math.floor(h / 24)} д`;
}

@Component({
  selector: 'app-article-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IONIC_IMPORTS,
    FormsModule,
    AvatarComponent,
    BlueprintComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <!-- ── Hero ──────────────────────────────────────── -->
      @if (feed.articleLoading()) {
        <gp-skeleton width="100%" [height]="220" [radius]="0" />
      } @else if (feed.activeArticle(); as a) {
        <div class="art-hero" [style.--cathue]="catHue()">
          <div class="art-hero-tex">
            <gp-blueprint [opacity]="0.5" />
          </div>
          <div class="art-hero-grad"></div>
          <button class="art-back" aria-label="Назад" (click)="back()">
            <gp-icon name="back" [size]="22" [sw]="2" />
          </button>
          @if (cat(); as c) {
            <span class="art-cat gp-cat-tag">
              <gp-icon [name]="c.icon" [size]="12" [sw]="2" />{{ c.name }}
            </span>
          }
        </div>

        <!-- ── Body ──────────────────────────────────────── -->
        <div class="art-body">
          <h1 class="art-title">{{ a.title }}</h1>

          <div class="art-sub">
            <span>Публикувано {{ a.date }}</span>
            <span class="dot"></span>
            <button class="art-cc" (click)="scrollToComments()">
              <gp-icon name="comment" [size]="15" [sw]="2" />
              <b>{{ totalComments() }}</b>&nbsp;{{ totalComments() === 1 ? 'коментар' : 'коментара' }}
            </button>
          </div>

          @if (a.pending) {
            <div class="art-pending">
              <gp-icon name="hourglass" [size]="17" [sw]="1.8" />
              <span>Тази статия чака одобрение от администратор.</span>
            </div>
          }

          <p class="art-lead">{{ a.lead }}</p>

          @for (p of a.body; track $index) {
            <p class="art-p">{{ p }}</p>
          }

          @if (a.tags?.length) {
            <div class="art-tags">
              @for (tag of a.tags; track tag) {
                <span class="gp-cat-tag">{{ tag }}</span>
              }
            </div>
          }

          @if (a.author; as author) {
            <div class="art-author">
              <gp-avatar [user]="author" [size]="40" />
              <div>
                <b>{{ author.name }}</b>
                <span>Автор · ID {{ author.id }}</span>
              </div>
            </div>
          }

          <!-- ── Comments ──────────────────────────────── -->
          <div class="cmt-section" #cmtSection>
            <div class="cmt-sec-head">
              <h3>Коментари <span>{{ totalComments() }}</span></h3>
              @if (feed.activeComments().length > 1) {
                <div class="cmt-sort">
                  <button [class.on]="sortOrder() === 'newest'" (click)="sortOrder.set('newest')">Нови</button>
                  <button [class.on]="sortOrder() === 'top'" (click)="sortOrder.set('top')">Харесани</button>
                </div>
              }
            </div>

            @if (auth.isLoggedIn()) {
              <div class="cmt-composer">
                <gp-avatar [user]="auth.user()!" [size]="36" />
                <div class="cc-input">
                  <textarea class="gp-textarea" rows="2"
                    placeholder="Напиши коментар…"
                    [(ngModel)]="newComment">
                  </textarea>
                </div>
                <button class="cc-send" [class.on]="newComment.trim()"
                  [disabled]="!newComment.trim()"
                  (click)="submitComment()" aria-label="Изпрати">
                  <gp-icon name="send" [size]="20" [sw]="2" [fill]="!!newComment.trim()" />
                </button>
              </div>
            } @else {
              <div class="cmt-locked" (click)="goAuth()">
                <gp-icon name="user" [size]="18" [sw]="1.8" />
                <span>Влез в профила си, за да коментираш</span>
                <gp-icon name="fwd" [size]="16" style="margin-left:auto" />
              </div>
            }

            @if (feed.activeComments().length === 0) {
              <gp-empty-state
                icon="comment"
                title="Все още няма коментари"
                [text]="auth.isLoggedIn() ? 'Бъди първият, който ще се включи в разговора.' : 'Влез, за да започнеш разговора.'"
              />
            } @else {
              <div class="cmt-list">
                @for (c of sortedComments(); track c.id) {
                  <div class="cmt">
                    <gp-avatar [user]="c.user" [size]="38" />
                    <div class="cmt-body">
                      <div class="cmt-head">
                        <span class="cmt-name">{{ c.user.name }}</span>
                        <span class="cmt-time">{{ fmtAgo(c.ago) }}</span>
                      </div>
                      <p class="cmt-text">{{ c.text }}</p>
                      <div class="cmt-actions">
                        <button class="cmt-like" [class.on]="c.liked"
                          [attr.aria-label]="(c.liked ? 'Премахни харесване' : 'Харесай') + ' · ' + c.likes"
                          [attr.aria-pressed]="c.liked"
                          (click)="likeComment(c.id)">
                          <gp-icon name="heart" [size]="14" [sw]="2" [fill]="c.liked" />
                          {{ c.likes }}
                        </button>
                        @if (auth.isLoggedIn()) {
                          <button class="cmt-reply-btn"
                            [attr.aria-expanded]="replyTarget() === c.id"
                            [attr.aria-label]="'Отговори на ' + c.user.name"
                            (click)="toggleReply(c.id)">Отговори</button>
                        }
                      </div>

                      @if (replyTarget() === c.id) {
                        <div class="cmt-composer compact">
                          <gp-avatar [user]="auth.user()!" [size]="30" />
                          <div class="cc-input">
                            <textarea class="gp-textarea" rows="2"
                              [placeholder]="'Отговори на ' + firstName(c.user.name) + '…'"
                              [(ngModel)]="replyText">
                            </textarea>
                          </div>
                          <button class="cc-send" [class.on]="replyText.trim()"
                            [disabled]="!replyText.trim()"
                            (click)="submitReply(c.id)" aria-label="Изпрати">
                            <gp-icon name="send" [size]="20" [sw]="2" [fill]="!!replyText.trim()" />
                          </button>
                        </div>
                      }

                      @if (c.replies?.length) {
                        <div class="cmt-replies">
                          @for (r of c.replies; track r.id) {
                            <div class="cmt reply">
                              <gp-avatar [user]="r.user" [size]="30" />
                              <div class="cmt-body">
                                <div class="cmt-head">
                                  <span class="cmt-name">{{ r.user.name }}</span>
                                  <span class="cmt-time">{{ fmtAgo(r.ago) }}</span>
                                </div>
                                <p class="cmt-text">{{ r.text }}</p>
                                <div class="cmt-actions">
                                  <button class="cmt-like" [class.on]="r.liked"
                                    [attr.aria-label]="(r.liked ? 'Премахни харесване' : 'Харесай') + ' · ' + r.likes"
                                    [attr.aria-pressed]="r.liked"
                                    (click)="likeComment(r.id, c.id)">
                                    <gp-icon name="heart" [size]="14" [sw]="2" [fill]="r.liked" />
                                    {{ r.likes }}
                                  </button>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } @else if (!feed.articleLoading()) {
        <div style="padding-top:80px">
          <gp-empty-state icon="news" title="Статията не е намерена"
            text="Провери дали адресът е правилен." />
        </div>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-content { --background: var(--color-bg); }

      /* ── Hero ──────────────────────────────────────── */
      .art-hero {
        position: relative;
        aspect-ratio: 16 / 11;
        background: linear-gradient(
          135deg,
          color-mix(in oklch, var(--cathue, hsl(210 45% 55%)) 22%, var(--color-surface-3)),
          var(--color-surface-3)
        );
        overflow: hidden;
        color: var(--color-blueprint);
      }
      .art-hero-tex {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .art-hero-grad {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.36) 0%,
          transparent 34%,
          transparent 68%,
          var(--color-bg) 100%
        );
        pointer-events: none;
      }
      .art-back {
        position: absolute;
        top: calc(var(--s4) + env(safe-area-inset-top, 44px));
        left: 16px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: rgba(255, 255, 255, 0.88);
        color: #16160f;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.24);
        z-index: 2;
        -webkit-tap-highlight-color: transparent;
      }
      .art-cat {
        position: absolute;
        left: 18px;
        bottom: 16px;
        z-index: 2;
      }

      /* ── Body ──────────────────────────────────────── */
      .art-body {
        padding: var(--s5) var(--s5) var(--s8);
        margin-top: -8px;
        position: relative;
        background: var(--color-bg);
      }
      .art-title {
        font-family: var(--font-head);
        font-size: 25px;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -0.02em;
        margin: 0 0 var(--s3);
        color: var(--color-ink);
        text-wrap: pretty;
      }
      .art-sub {
        display: flex;
        align-items: center;
        gap: var(--s3);
        color: var(--color-ink-3);
        font-size: 13.5px;
        margin-bottom: var(--s5);
        flex-wrap: wrap;
      }
      .dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
      }
      .art-cc {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--color-ink);
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        background: var(--color-surface-2);
        font-size: 13.5px;
        -webkit-tap-highlight-color: transparent;
      }
      .art-cc:active { background: var(--color-surface-3); }
      .art-cc b { color: color-mix(in srgb, var(--color-accent) 70%, var(--color-ink)); }
      .art-pending {
        display: flex;
        align-items: center;
        gap: 9px;
        background: color-mix(in srgb, #e8741e 14%, var(--color-surface));
        color: #b45309;
        border: 1px solid color-mix(in srgb, #e8741e 35%, transparent);
        padding: 11px 14px;
        border-radius: var(--r-md);
        font-size: 13px;
        font-weight: 600;
        margin-bottom: var(--s5);
      }
      .art-lead {
        font-size: 17px;
        line-height: 1.55;
        color: var(--color-ink);
        font-weight: 600;
        margin: 0 0 var(--s4);
      }
      .art-p {
        font-size: 15.5px;
        line-height: 1.72;
        color: var(--color-ink-2);
        margin: 0 0 var(--s4);
      }
      .art-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: var(--s5) 0;
      }
      .art-author {
        display: flex;
        align-items: center;
        gap: var(--s3);
        padding: var(--s4);
        background: var(--color-surface);
        border-radius: var(--r-lg);
        box-shadow: var(--shadow);
        margin-bottom: var(--s6);
      }
      .art-author b {
        display: block;
        font-family: var(--font-head);
        font-size: 14px;
        font-weight: 700;
        color: var(--color-ink);
      }
      .art-author span {
        font-size: 12px;
        color: var(--color-ink-3);
        font-family: var(--font-mono);
      }

      /* ── Comments ──────────────────────────────────── */
      .cmt-section {
        border-top: 8px solid var(--color-surface-2);
        margin: 0 calc(var(--s5) * -1) calc(var(--s8) * -1);
        padding: var(--s6) var(--s5) var(--s8);
      }
      .cmt-sec-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--s5);
      }
      .cmt-sec-head h3 {
        font-family: var(--font-head);
        font-size: 18px;
        font-weight: 800;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-ink);
      }
      .cmt-sec-head h3 span {
        font-family: var(--font-mono);
        font-size: 13px;
        background: var(--color-surface-2);
        color: var(--color-ink-2);
        padding: 1px 8px;
        border-radius: 999px;
      }
      .cmt-sort {
        display: flex;
        gap: 3px;
        background: var(--color-surface-2);
        padding: 3px;
        border-radius: 999px;
      }
      .cmt-sort button {
        font-size: 11.5px;
        font-weight: 700;
        color: var(--color-ink-3);
        padding: 5px 10px;
        border-radius: 999px;
        -webkit-tap-highlight-color: transparent;
      }
      .cmt-sort button.on {
        background: var(--color-surface);
        color: var(--color-ink);
        box-shadow: var(--shadow);
      }
      .cmt-composer {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin-bottom: var(--s5);
      }
      .cmt-composer.compact {
        margin: 10px 0 0;
      }
      .cc-input { flex: 1; }
      .cmt-composer .gp-textarea {
        padding: 10px 13px;
        border-radius: var(--r-md);
        min-height: 0;
      }
      .cc-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: var(--color-ink-3);
        background: var(--color-surface-2);
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .cc-send.on {
        background: var(--color-accent);
        color: var(--color-accent-ink);
      }
      .cc-send:disabled { opacity: 0.45; }
      .cmt-locked {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: var(--color-surface-2);
        border-radius: var(--r-md);
        color: var(--color-ink-2);
        font-weight: 600;
        font-size: 13.5px;
        margin-bottom: var(--s5);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .cmt-list {
        display: flex;
        flex-direction: column;
        gap: var(--s5);
      }
      .cmt {
        display: flex;
        gap: 11px;
      }
      .cmt-body {
        flex: 1;
        min-width: 0;
      }
      .cmt-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 3px;
      }
      .cmt-name {
        font-family: var(--font-head);
        font-weight: 700;
        font-size: 14px;
        color: var(--color-ink);
      }
      .cmt-time {
        font-size: 11.5px;
        color: var(--color-ink-3);
        font-family: var(--font-mono);
      }
      .cmt-text {
        font-size: 14.5px;
        line-height: 1.5;
        color: var(--color-ink);
        margin: 0 0 7px;
        text-wrap: pretty;
      }
      .cmt-actions {
        display: flex;
        align-items: center;
        gap: var(--s4);
      }
      .cmt-like {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--color-ink-3);
        font-size: 12.5px;
        font-weight: 700;
        transition: color 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .cmt-like.on { color: #e0533b; }
      .cmt-reply-btn {
        color: var(--color-ink-2);
        font-size: 12.5px;
        font-weight: 700;
        -webkit-tap-highlight-color: transparent;
      }
      .cmt-replies {
        margin-top: var(--s4);
        display: flex;
        flex-direction: column;
        gap: var(--s4);
        padding-left: 8px;
        border-left: 2px solid var(--color-line);
      }
    `,
  ],
})
export class ArticleDetailPage {
  readonly id = input<string>('');
  /** ?scroll=comments — auto-scroll to comments section */
  readonly scroll = input<string>('');

  protected readonly sortOrder = signal<'newest' | 'top'>('newest');
  protected readonly replyTarget = signal<string | null>(null);
  protected newComment = '';
  protected replyText = '';

  protected readonly feed = inject(FeedStore);
  protected readonly auth = inject(AuthStore);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  private readonly contentRef = viewChild.required(IonContent);
  private readonly cmtSectionRef = viewChild<ElementRef>('cmtSection');

  protected readonly fmtAgo = fmtAgo;
  protected readonly firstName = (name: string) => name.split(' ')[0];

  protected cat() {
    const a = this.feed.activeArticle();
    return a ? this.feed.catOf(a.cat) : undefined;
  }

  protected catHue(): string {
    const c = this.cat();
    return c ? `hsl(${(c as { hue?: number }).hue ?? 210} 45% 55%)` : 'hsl(210 45% 55%)';
  }

  protected readonly totalComments = computed(() => countAll(this.feed.activeComments()));

  protected readonly sortedComments = computed(() => {
    const list = [...this.feed.activeComments()];
    if (this.sortOrder() === 'top') list.sort((a, b) => b.likes - a.likes);
    return list;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.feed.loadArticle(id);
    });

    effect(() => {
      const shouldScroll = this.scroll() === 'comments';
      const done = !this.feed.articleLoading();
      if (shouldScroll && done) {
        setTimeout(() => void this.doScrollToComments(), 250);
      }
    });
  }

  back(): void {
    this.location.back();
  }

  goAuth(): void {
    void this.router.navigate(['/auth/login']);
  }

  scrollToComments(): void {
    void this.doScrollToComments();
  }

  private async doScrollToComments(): Promise<void> {
    const el = this.cmtSectionRef()?.nativeElement as HTMLElement | undefined;
    if (!el) return;
    const scrollEl = await this.contentRef().getScrollElement();
    const offset =
      el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
    void this.contentRef().scrollToPoint(0, offset - 8, 320);
  }

  submitComment(): void {
    const text = this.newComment.trim();
    if (!text) return;
    this.feed.addComment({ articleId: this.id(), text });
    this.newComment = '';
  }

  toggleReply(commentId: string): void {
    this.replyTarget.update((cur) => (cur === commentId ? null : commentId));
    this.replyText = '';
  }

  submitReply(commentId: string): void {
    const text = this.replyText.trim();
    if (!text) return;
    this.feed.addReply({ articleId: this.id(), commentId, text });
    this.replyText = '';
    this.replyTarget.set(null);
  }

  likeComment(commentId: string, _parentId?: string): void {
    this.feed.likeComment({ articleId: this.id(), commentId });
  }
}
