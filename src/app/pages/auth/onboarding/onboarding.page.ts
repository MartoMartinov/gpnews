import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { BtnComponent, IconComponent } from '../../../shared/components';

interface Slide {
  icon: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'news',
    title: 'G.P. News',
    text: 'Бърз и лесен достъп до полезна информация от строителния бранш — на едно място.',
  },
  {
    icon: 'shield',
    title: 'Премиум съдържание',
    text: 'Регистрирай се за пълен достъп до внимателно подбрано съдържание и известия за важното в бранша.',
  },
  {
    icon: 'comment',
    title: 'Готов ли си?',
    text: 'Чети, коментирай и споделяй новини от обектите. Включи се в разговора.',
  },
];

/** Three-slide onboarding carousel. */
@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, BtnComponent, IconComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="flex h-full flex-col px-6 pb-6 pt-14">
        <button class="self-end p-2 font-semibold text-[var(--color-ink-2)]" (click)="skip()">
          Пропусни
        </button>

        <div class="flex flex-1 flex-col items-center justify-center text-center">
          <div class="art">
            <gp-icon [name]="slide().icon" [size]="64" [sw]="1.4" />
          </div>
          <h1 class="mt-6 text-[27px] font-extrabold tracking-tight">{{ slide().title }}</h1>
          <p class="mt-3 max-w-[300px] text-[15.5px] leading-relaxed text-[var(--color-ink-2)]">
            {{ slide().text }}
          </p>
        </div>

        <gp-btn variant="dark" size="lg" [full]="true" (pressed)="next()">
          {{ isLast() ? 'Започни' : 'Напред' }}
        </gp-btn>

        <div class="mt-5 flex justify-center gap-2">
          @for (s of slides; track $index) {
            <span class="dot" [class.on]="$index === index()" (click)="go($index)"></span>
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .art {
        width: 120px;
        height: 120px;
        display: grid;
        place-items: center;
        border-radius: 28px;
        background: var(--color-surface);
        color: var(--color-accent-ink);
        box-shadow: var(--shadow);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-line-2);
        transition: all 0.2s;
        cursor: pointer;
      }
      .dot.on {
        width: 22px;
        border-radius: 4px;
        background: var(--color-accent);
      }
    `,
  ],
})
export class OnboardingPage {
  private readonly router = inject(Router);

  protected readonly slides = SLIDES;
  protected readonly index = signal(0);
  protected readonly slide = computed(() => this.slides[this.index()]);
  protected readonly isLast = computed(() => this.index() === this.slides.length - 1);

  go(i: number): void {
    this.index.set(i);
  }

  next(): void {
    if (this.isLast()) {
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    } else {
      this.index.update((i) => i + 1);
    }
  }

  skip(): void {
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
