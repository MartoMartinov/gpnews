import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/** G.P. Group brand logo. Renders the static brand PNG (assets/logo.png). */
@Component({
  selector: 'gp-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    <img
      ngSrc="assets/logo.png"
      width="250"
      height="111"
      priority
      alt="G.P. Group JSC."
      class="logo-img"
      [style.height.px]="height()"
    />
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      /* width:auto keeps the intrinsic 250:111 ratio so NgOptimizedImage
         doesn't flag aspect-ratio distortion. */
      .logo-img {
        width: auto;
      }

      /* The brand mark is dark ink on a transparent background, so it
         nearly disappears on dark surfaces. Inverting it turns the dark
         ink light while keeping the shading/highlights intact. */
      @media (prefers-color-scheme: dark) {
        .logo-img {
          filter: invert(1);
        }
      }

      :host-context(.dark) .logo-img {
        filter: invert(1);
      }
    `,
  ],
})
export class GpLogoComponent {
  /** Rendered logo height in px. */
  readonly height = input<number>(30);
}
