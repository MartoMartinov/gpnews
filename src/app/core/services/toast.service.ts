import { inject, Injectable } from '@angular/core';
import { ToastButton, ToastController } from '@ionic/angular/standalone';
import { ICONS } from '../../shared/components/icon/icon.component';

export type ToastColor = 'success' | 'warning' | 'medium' | 'dark';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  color?: ToastColor;
  header?: string;
  buttons?: ToastButton[];
}

/** Leading icon + its contrast color per toast type (matches each color's `-contrast` token). */
const TOAST_ICON: Record<ToastColor, { path: string; contrast: string }> = {
  success: { path: ICONS['checkc'], contrast: '#000' },
  warning: { path: ICONS['alertc'], contrast: '#000' },
  medium: { path: ICONS['info'], contrast: '#fff' },
  dark: { path: ICONS['bell'], contrast: '#fff' },
};

/** Renders a `gp-icon`-style stroke path as a self-contained SVG data URI (no ionicons asset dependency). */
function svgIcon(path: string, color: string): string {
  const segments = path.split(' M').map((seg, i) => (i === 0 ? seg : 'M' + seg));
  const paths = segments.map((seg) => `<path d="${seg}"/>`).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Single place that creates/presents Ionic toasts — stores call the color helpers below. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly ctrl = inject(ToastController);

  async show(message: string, opts: ToastOptions = {}): Promise<void> {
    const color = opts.color ?? 'medium';
    const { path, contrast } = TOAST_ICON[color];

    const closeButton: ToastButton = {
      icon: svgIcon(ICONS['close'], contrast),
      side: 'end',
      role: 'cancel',
      htmlAttributes: { 'aria-label': 'Затвори' },
    };

    const t = await this.ctrl.create({
      message,
      duration: opts.duration ?? 2500,
      position: opts.position ?? 'top',
      color,
      icon: svgIcon(path, contrast),
      header: opts.header,
      buttons: [...(opts.buttons ?? []), closeButton],
    });
    await t.present();
  }

  success(
    message: string,
    opts: Omit<ToastOptions, 'color'> = {},
  ): Promise<void> {
    return this.show(message, { ...opts, color: 'success' });
  }

  error(
    message: string,
    opts: Omit<ToastOptions, 'color'> = {},
  ): Promise<void> {
    return this.show(message, { ...opts, color: 'warning' });
  }

  medium(
    message: string,
    opts: Omit<ToastOptions, 'color'> = {},
  ): Promise<void> {
    return this.show(message, { ...opts, color: 'medium' });
  }
}
