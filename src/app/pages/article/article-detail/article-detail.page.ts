import { ChangeDetectionStrategy, Component, effect, inject, input, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { AvatarComponent, BtnComponent, ChipComponent, EmptyStateComponent, IconComponent, SkeletonComponent } from '../../../shared/components';
import { FeedStore } from '../../../store/feed/feed.store';
import { AuthStore } from '../../../store/auth/auth.store';

function fmtAgo(mins: number): string {
  if (mins < 60) return `${mins} мин.`;
  if (mins < 1440) return `${Math.floor(mins / 60)} ч.`;
  return `${Math.floor(mins / 1440)} дни`;
}

@Component({
  selector: 'app-article-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, FormsModule, AvatarComponent, BtnComponent, ChipComponent, EmptyStateComponent, IconComponent, SkeletonComponent],
  template: `
    <ion-content [fullscreen]="true" #contentEl>
      @if (feed.articleLoading()) {
        <!-- Hero skeleton -->
        <div style="position:relative">
          <gp-skeleton width="100%" height="240px" [radius]="0" />
        </div>
        <div class="art-body">
          <gp-skeleton width="95%" height="26px" style="margin-bottom:12px; display:block" />
          <gp-skeleton width="70%" height="26px" style="margin-bottom:20px; display:block" />
          <gp-skeleton width="50%" height="14px" style="margin-bottom:24px; display:block" />
          <gp-skeleton width="100%" height="14px" style="margin-bottom:10px; display:block" />
          <gp-skeleton width="100%" height="14px" style="margin-bottom:10px; display:block" />
          <gp-skeleton width="80%" height="14px" />
        </div>
      } @else if (feed.activeArticle(); as a) {
        @if (cat(); as c) {
          <div class="art-hero">
            <div class="gp-img" [style.--cathue]="catHue()" style="aspect-ratio:16/11"></div>
            <div class="art-hero-grad"></div>
            <button class="art-back" (click)="back()" aria-label="Назад">
              <gp-icon name="back" [size]="22" />
            </button>
            <span class="art-cat gp-cat-tag">
              <gp-icon [name]="c.icon" [size]="12" [sw]="1.6" />{{ c.name }}
            </span>
          </div>

          <div class="art-body">
            <h1 class="art-title">{{ a.title }}</h1>
            <div class="art-sub">
              <span>Публикувано {{ a.date }}</span>
              @if (commentCount() > 0) {
                <span class="dot"></span>
                <button class="art-cc" (click)="scrollToComments()">
                  <gp-icon name="comment" [size]="15" [sw]="2" />
                  <b>{{ commentCount() }}</b>
                  {{ commentCount() === 1 ? 'коментар' : 'коментара' }}
                </button>
              }
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

            @if (a.author; as author) {
              <div class="art-author">
                <gp-avatar [user]="author" [size]="40" />
                <div>
                  <b>{{ author.name }}</b>
                  <span>Автор · ID {{ author.id }}</span>
                </div>
              </div>
            }

            <!-- Comments section -->
            <div class="cmt-section" #cmtSection>
              <div class="cmt-sec-head">
                <h3>Коментари <span>{{ commentCount() }}</span></h3>
              </div>

              @if (auth.isLoggedIn()) {
                <div class="cmt-composer">
                  <gp-avatar [user]="auth.user()!" [size]="36" />
                  <div class="cc-input">
                    <textarea class="gp-textarea" rows="2" placeholder="Напиши коментар…"
                      [(ngModel)]="commentText">
                    </textarea>
                  </div>
                  <button class="cc-send" [class.on]="commentText.trim()"
                    (click)="submitComment()" aria-label="Изпрати">
                    <gp-icon name="send" [size]="20" [sw]="2" />
                  </button>
                </div>
              } @else {
                <div class="cmt-locked" (click)="goAuth()">
                  <gp-icon name="user" [size]="18" [sw]="1.8" />
                  <span>Влез в профила си, за да коментираш</span>
                  <gp-icon name="fwd" [size]="16" class="fwd-ic" />
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
                  @for (c of feed.activeComments(); track c.id) {
                    <div class="cmt">
                      <gp-avatar [user]="c.user" [size]="38" />
                      <div class="cmt-body">
                        <div class="cmt-head">
                          <span class="cmt-name">{{ c.user.name }}</span>
                          <span class="cmt-time">{{ fmtAgo(c.ago) }}</span>
                        </div>
                        <p class="cmt-text">{{ c.text }}</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div style="padding-top: 60px">
          <button class="art-back" style="position:relative;top:auto;left:auto;margin:var(--s5)" (click)="back()">
            <gp-icon name="back" [size]="22" />
          </button>
          <gp-empty-state icon="news" title="Статията не е намерена" text="Провери дали адресът е правилен." />
        </div>
      }
    </ion-content>
  `,
  styles: [`
    ion-content { --background: var(--color-bg); }
  `],
})
export class ArticleDetailPage {
  readonly id = input<string>('');

  protected readonly feed = inject(FeedStore);
  protected readonly auth = inject(AuthStore);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  @ViewChild('cmtSection') cmtSection?: ElementRef<HTMLElement>;
  @ViewChild('contentEl') contentEl?: IonContent;

  protected commentText = '';
  protected readonly fmtAgo = fmtAgo;

  protected readonly cat = () => {
    const a = this.feed.activeArticle();
    if (!a) return undefined;
    return this.feed.catOf(a.cat);
  };

  protected catHue(): string {
    const c = this.cat();
    return c ? `hsl(${c.hue} 45% 55%)` : 'hsl(210 45% 55%)';
  }

  protected commentCount(): number {
    return this.feed.activeComments().length;
  }

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.feed.loadArticle(id);
    });
  }

  back(): void {
    this.location.back();
  }

  goAuth(): void {
    void this.router.navigate(['/auth/login']);
  }

  submitComment(): void {
    const text = this.commentText.trim();
    if (!text) return;
    const articleId = this.id();
    this.feed.addComment({ articleId, text });
    this.commentText = '';
  }

  scrollToComments(): void {
    if (this.cmtSection?.nativeElement && this.contentEl) {
      void this.contentEl.scrollToPoint(0, this.cmtSection.nativeElement.offsetTop - 8, 400);
    }
  }
}
