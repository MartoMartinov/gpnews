import { inject, Injectable } from '@angular/core';
import { ToastButton, ToastController } from '@ionic/angular/standalone';

export type ToastColor = 'success' | 'danger' | 'medium' | 'dark';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  color?: ToastColor;
  header?: string;
  buttons?: ToastButton[];
}

/** Single place that creates/presents Ionic toasts — stores call the color helpers below. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly ctrl = inject(ToastController);

  async show(message: string, opts: ToastOptions = {}): Promise<void> {
    const t = await this.ctrl.create({
      message,
      duration: opts.duration ?? 2500,
      position: opts.position ?? 'bottom',
      color: opts.color ?? 'medium',
      header: opts.header,
      buttons: opts.buttons,
    });
    await t.present();
  }

  success(message: string, opts: Omit<ToastOptions, 'color'> = {}): Promise<void> {
    return this.show(message, { ...opts, color: 'success' });
  }

  error(message: string, opts: Omit<ToastOptions, 'color'> = {}): Promise<void> {
    return this.show(message, { ...opts, color: 'danger' });
  }

  medium(message: string, opts: Omit<ToastOptions, 'color'> = {}): Promise<void> {
    return this.show(message, { ...opts, color: 'medium' });
  }
}
