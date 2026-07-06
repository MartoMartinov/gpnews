import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import { BtnComponent } from '../../../shared/components';

interface Slide {
  img: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    img: 'assets/onb-1.png',
    title: 'G.P. News',
    text: 'Бърз и лесен достъп до полезна информация от строителния бранш — на едно място.',
  },
  {
    img: 'assets/onb-2.png',
    title: 'Премиум съдържание',
    text: 'Регистрирай се за пълен достъп до внимателно подбрано съдържание и известия за важното в бранша.',
  },
  {
    img: 'assets/onb-3.png',
    title: 'Готов ли си?',
    text: 'Чети, коментирай и споделяй новини от обектите. Включи се в разговора.',
  },
];

/** Three-slide onboarding carousel. */
@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IONIC_IMPORTS, BtnComponent],
  template: `
    <ion-content [fullscreen]="true" class="onb-content">
      <div class="onb-view">
        <button class="onb-skip" (click)="skip()">Пропусни</button>

        <div class="onb-scroll">
          <div class="onb-art">
            <img class="onb-illu" [src]="slide().img" [alt]="slide().title" draggable="false" />
          </div>
          <h1 class="onb-title">{{ slide().title }}</h1>
          <p class="onb-text">{{ slide().text }}</p>
        </div>

        <div class="onb-foot">
          <gp-btn variant="dark" size="lg" [full]="true" (pressed)="next()">
            {{ isLast() ? 'Започни' : 'Напред' }}
          </gp-btn>

          <div class="onb-dots">
            @for (s of slides; track $index) {
              <span class="dot" [class.on]="$index === index()" (click)="go($index)"></span>
            }
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host {
        --ion-background-color: var(--color-surface);
      }
      .onb-view {
        position: absolute;
        inset: 0;
        background: var(--color-surface);
        display: flex;
        flex-direction: column;
      }
      .onb-skip {
        position: absolute;
        top: 52px;
        right: 22px;
        z-index: 5;
        font-family: var(--font-body);
        color: var(--color-ink-2);
        font-weight: 600;
        font-size: 14px;
        background: none;
        border: none;
        cursor: pointer;
      }
      .onb-scroll {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 70px var(--s6) 0;
        text-align: center;
      }
      .onb-art {
        width: 100%;
        max-width: 320px;
        margin-bottom: var(--s4);
        position: relative;
      }
      .onb-illu {
        width: 100%;
        height: auto;
        display: block;
        animation: gpfloat 4s ease-in-out infinite;
      }
      @keyframes gpfloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-7px); }
      }
      .onb-title {
        font-family: var(--font-head);
        font-size: 27px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 8px 0 var(--s4);
        white-space: nowrap;
        color: var(--color-ink);
      }
      .onb-text {
        font-family: var(--font-body);
        color: var(--color-ink-2);
        font-size: 15.5px;
        line-height: 1.55;
        max-width: 300px;
        margin: 0;
      }
      .onb-foot {
        padding: var(--s6);
      }
      .onb-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: var(--s5);
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
