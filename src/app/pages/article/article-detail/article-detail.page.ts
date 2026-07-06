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
  return list.reduce((n, c) => n + 1 + (c.replies.length ?? 0), 0);
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

          <div class="editor" [innerHTML]="a.content" (click)="onEditorClick($event)"></div>

          @if (a.tags.length) {
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

                      @if (c.replies.length) {
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

  /** Route internal links inside the injected article HTML through the Angular router. */
  onEditorClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    event.preventDefault();
    void this.router.navigateByUrl(href);
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
