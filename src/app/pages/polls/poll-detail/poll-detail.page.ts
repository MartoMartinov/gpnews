import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { BtnComponent, EmptyStateComponent, IconComponent, SkeletonComponent } from '../../../shared/components';
import { PollsStore } from '../../../store/polls/polls.store';
import { PollOption } from '../../../shared/models';

@Component({
  selector: 'app-poll-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, BtnComponent, EmptyStateComponent, IconComponent, SkeletonComponent],
  template: `
    <ion-content [fullscreen]="true">
      @if (store.loading()) {
        <div class="poll-detail">
          <gp-skeleton width="80px" height="20px" style="margin-bottom:var(--s5);display:block" />
          <gp-skeleton width="90%" height="30px" style="margin-bottom:12px;display:block" />
          <gp-skeleton width="70%" height="30px" style="margin-bottom:var(--s6);display:block" />
          @for (i of [0,1,2]; track i) {
            <gp-skeleton width="100%" height="58px" [radius]="14" style="display:block;margin-bottom:var(--s3)" />
          }
        </div>
      } @else if (store.activePoll(); as poll) {
        <div class="poll-detail">
          <button class="poll-back" (click)="back()">
            <gp-icon name="back" [size]="22" /> Анкети
          </button>

          <h1 class="poll-q">{{ poll.question }}</h1>

          <div class="poll-opts">
            @for (opt of poll.options; track opt.id) {
              <button class="poll-opt"
                [class.on]="selected() === opt.id"
                [class.result]="showResults()"
                [disabled]="showResults()"
                (click)="select(opt.id)">
                @if (showResults()) {
                  <span class="poll-bar" [style.width]="pct(opt) + '%'"></span>
                }
                <span class="poll-radio" [class.on]="selected() === opt.id">
                  @if (selected() === opt.id) { <span class="dot"></span> }
                </span>
                <span class="poll-opt-text">{{ opt.text }}</span>
                @if (showResults()) {
                  <span class="poll-pct">{{ pct(opt) }}%</span>
                }
              </button>
            }
          </div>

          @if (showResults()) {
            <div class="poll-voted">
              <gp-icon name="checkc" [size]="18" [sw]="2" />
              <span>Благодарим! Гласът ти е записан · {{ liveTotal() }} гласа общо</span>
            </div>
          } @else {
            <gp-btn variant="dark" size="lg" [full]="true"
              [loading]="store.voting()"
              [disabled]="!selected()"
              (pressed)="save()">
              Запази
            </gp-btn>
          }
        </div>
      } @else {
        <div style="padding-top: 80px">
          <gp-empty-state icon="tray" title="Анкетата не е намерена" text="Провери дали адресът е правилен." />
        </div>
      }
    </ion-content>
  `,
  styles: [`
    ion-content { --background: var(--color-bg); }
  `],
})
export class PollDetailPage {
  readonly id = input<string>('');

  protected readonly store = inject(PollsStore);
  private readonly location = inject(Location);

  protected readonly selected = signal<string | null>(null);
  protected readonly saved = signal(false);

  protected readonly showResults = computed(() =>
    this.saved() || !!this.store.activePoll()?.voted
  );

  protected readonly liveTotal = computed(() => {
    const poll = this.store.activePoll();
    if (!poll) return 0;
    const wasVoted = !!poll.voted;
    return poll.total + (wasVoted ? 0 : this.saved() ? 1 : 0);
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.loadPoll(id);
    });

    effect(() => {
      const poll = this.store.activePoll();
      if (poll?.voted && !this.selected()) {
        this.selected.set(poll.voted);
        this.saved.set(true);
      }
    });
  }

  protected pct(opt: PollOption): number {
    const poll = this.store.activePoll();
    if (!poll) return 0;
    const total = this.liveTotal();
    const extra = this.saved() && this.selected() === opt.id && !poll.voted ? 1 : 0;
    return total ? Math.round(((opt.votes + extra) / total) * 100) : 0;
  }

  select(optId: string): void {
    if (!this.showResults()) this.selected.set(optId);
  }

  save(): void {
    const sel = this.selected();
    const pollId = this.id();
    if (!sel || !pollId) return;
    this.saved.set(true);
    this.store.castVote({ pollId, optionId: sel });
  }

  back(): void {
    this.location.back();
  }
}
