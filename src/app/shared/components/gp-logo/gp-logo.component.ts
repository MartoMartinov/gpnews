import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * G.P. News wordmark.
 * TODO: swap for the brand PNG via CSS mask once assets/logo.png is added
 * (see prototype `.gp-logo`). Text wordmark is the interim fallback.
 */
@Component({
  selector: 'gp-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="logo" [class.big]="big()">G.P. <b>News</b></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .logo {
        font-family: var(--font-head);
        font-weight: 600;
        font-size: 20px;
        letter-spacing: -0.02em;
        color: var(--color-ink);
      }
      .logo b {
        font-weight: 800;
        color: var(--color-accent-ink);
        background: var(--color-accent);
        padding: 0 6px;
        border-radius: var(--r-sm);
      }
      .logo.big {
        font-size: 40px;
      }
    `,
  ],
})
export class GpLogoComponent {
  readonly big = input<boolean>(false);
}
