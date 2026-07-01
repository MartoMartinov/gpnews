import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Stroke-based SVG icon set, ported from the Claude Design prototype.
 * Multi-segment paths are split on " M" so each subpath renders cleanly.
 */
export const ICONS: Record<string, string> = {
  // category line icons
  news: 'M4 5h12v14H6a2 2 0 0 1-2-2V5Zm12 0h3a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2M7 8h6M7 11h6M7 14h4',
  road: 'M12 3v3M12 10v3M12 17v3M5 21l2-18M19 21l-2-18',
  metro: 'M7 4h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 6h10M9 19l-2 2m8-2 2 2M9.5 13h.01M14.5 13h.01',
  tower: 'M4 21V9l5-3 5 3M14 21V5l3-2 3 2v16M7 12h.01M7 16h.01M11 12h.01M11 16h.01M17 9h.01M17 13h.01M2 21h20',
  train: 'M6 4h12a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Zm0 6h12M8.5 13h.01M15.5 13h.01M8 19l-2 2m12-2 2 2',
  water: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  people: 'M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 21h14',
  helmet: 'M4 16a8 8 0 0 1 16 0M2 16h20M9 16V9a3 3 0 0 1 3-3M12 6v3',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01',
  ball: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 3l3 5-3 4-3-4 3-5ZM4 9l5 3M20 9l-5 3M7.5 19 9 13M16.5 19 15 13',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  // ui glyphs
  menu: 'M4 7h16M4 12h16M4 17h16',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  home: 'M3 11 12 3l9 8M5 9.5V21h14V9.5',
  user: 'M16 19a4 4 0 0 0-8 0M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  back: 'M15 5l-7 7 7 7',
  fwd: 'M9 5l7 7-7 7',
  up: 'M5 15l7-7 7 7',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeoff: 'M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.4 3.2M6.1 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3-.5',
  image: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3 17l5-4 4 3 4-4 5 5',
  send: 'M4 12l16-8-5 16-3.5-6.5L4 12Z',
  heart: 'M12 20s-7-4.5-9.5-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.5 5C19 15.5 12 20 12 20Z',
  comment: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  share: 'M6 12a3 3 0 1 0 0-0.01M18 6a3 3 0 1 0 0-0.01M18 18a3 3 0 1 0 0-0.01M8.6 10.6l6.8-3.6M8.6 13.4l6.8 3.6',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  checkc: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 12l2.5 2.5L16 9',
  alertc: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v5M12 16h.01',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.3M21 4v4h-4',
  close: 'M6 6l12 12M18 6 6 18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
  logout: 'M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M9 12h12M21 12l-3-3M21 12l-3 3',
  shield: 'M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3ZM9 12l2 2 4-4',
  hourglass: 'M7 3h10M7 21h10M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9',
  tray: 'M3 13l2.5-7a1 1 0 0 1 .95-.7h11.1a1 1 0 0 1 .95.7L21 13M3 13v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5M3 13h5l1.5 2.2h5L16 13h5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  img: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3 17l5-4 4 3 4-4 5 5',
};

export const ICON_NAMES = Object.keys(ICONS);

@Component({
  selector: 'gp-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      [attr.fill]="fill() ? 'currentColor' : 'none'"
      stroke="currentColor"
      [attr.stroke-width]="sw()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @for (seg of segments(); track $index) {
        <path [attr.d]="seg" />
      }
    </svg>
  `,
  styles: [':host { display: inline-flex; line-height: 0; }'],
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(22);
  readonly sw = input<number>(1.7);
  readonly fill = input<boolean>(false);

  protected readonly segments = computed<string[]>(() => {
    const d = ICONS[this.name()];
    if (!d) {
      return [];
    }
    return d.split(' M').map((s, i) => (i === 0 ? s : 'M' + s));
  });
}
