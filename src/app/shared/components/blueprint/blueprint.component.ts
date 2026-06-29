import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Faint technical-drawing texture used behind auth/splash screens.
 * Ported from the Claude Design prototype. Colour follows currentColor
 * (set via .gp-blueprint host / parent color: var(--color-blueprint)).
 */
@Component({
  selector: 'gp-blueprint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="block w-full h-full "
      [style.opacity]="opacity()"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="currentColor" stroke-width="0.8" fill="none" opacity="0.9">
        <path d="M-20 70 L300 30 L460 60" />
        <path d="M-20 80 L300 40 L460 70" />
        <path d="M40 30 L60 90 L20 92 L40 30Z" />
        <path d="M120 26 L150 86 L100 90 Z" />
        <path d="M210 20 L246 80 L196 84 Z" />
        <circle cx="60" cy="90" r="3" />
        <circle cx="150" cy="86" r="3" />
        <circle cx="246" cy="80" r="3" />
        <path d="M30 200 h140 v70 h-140 Z" />
        <path d="M30 200 l140 70 M170 200 l-140 70" stroke-dasharray="3 4" />
        <path d="M210 210 h120 M210 230 h120 M210 250 h90" />
        <path d="M250 210 v50 M290 210 v50" stroke-dasharray="2 3" />
        <text x="34" y="196" font-size="7" fill="currentColor" stroke="none" font-family="monospace">
          M 1:500
        </text>
      </g>
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--color-blueprint);
      }
    `,
  ],
})
export class BlueprintComponent {
  readonly opacity = input<number>(1);
}
