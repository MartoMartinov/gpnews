import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import {
  BlueprintComponent,
  BtnComponent,
  GpLogoComponent,
  IconComponent,
} from '../../../shared/components';
import { AuthStore } from '../../../store/auth/auth.store';

/** Email/password login. */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IONIC_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    BlueprintComponent,
    BtnComponent,
    GpLogoComponent,
    IconComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-bg"><gp-blueprint [opacity]="0.2" /></div>

      <div class="auth-scroll">
        <div class="auth-logo"><gp-logo [height]="52" /></div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="gp-field" [class.err]="invalid('email')">
            <input
              class="gp-input"
              type="email"
              inputmode="email"
              placeholder="Имейл адрес"
              aria-label="Имейл адрес"
              [attr.aria-invalid]="invalid('email') || null"
              aria-describedby="email-err"
              formControlName="email"
              autocomplete="email"
            />
            @if (invalid('email')) {
              <div class="errmsg" id="email-err" role="alert">
                <gp-icon name="close" [size]="13" [sw]="2.5" />Невалиден имейл адрес
              </div>
            }
          </div>

          <div class="gp-field" [class.err]="invalid('password')">
            <div class="gp-input-wrap">
              <input
                class="gp-input"
                [type]="showPw() ? 'text' : 'password'"
                placeholder="Парола"
                aria-label="Парола"
                [attr.aria-invalid]="invalid('password') || null"
                aria-describedby="pw-err"
                formControlName="password"
                autocomplete="current-password"
              />
              <button type="button" class="eye-btn"
                [attr.aria-label]="showPw() ? 'Скрий паролата' : 'Покажи паролата'"
                [attr.aria-pressed]="showPw()"
                (click)="showPw.set(!showPw())" tabindex="-1">
                <gp-icon [name]="showPw() ? 'eye' : 'eyeoff'" [size]="20" />
              </button>
            </div>
            @if (invalid('password')) {
              <div class="errmsg" id="pw-err" role="alert">
                <gp-icon name="close" [size]="13" [sw]="2.5" />Паролата е твърде кратка
              </div>
            }
          </div>

          <p class="auth-cta-sub">
            Нямаш профил?<br />
            <a routerLink="/auth/signup">Регистрирай се за пълен достъп</a>
          </p>

          <gp-btn
            variant="primary"
            size="lg"
            [full]="true"
            type="submit"
            [loading]="store.isPending()"
          >
            Вход
          </gp-btn>
        </form>

        <button class="auth-guest" (click)="guest()">Продължи като гост</button>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: var(--color-surface);
      }
    `,
  ],
})
export class LoginPage {
  protected readonly store = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  protected readonly showPw = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  protected invalid(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.login(this.form.getRawValue());
  }

  guest(): void {
    this.store.continueAsGuest();
  }
}
