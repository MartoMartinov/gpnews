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
      <div class="auth-bg"><gp-blueprint [opacity]="0.4" /></div>

      <div class="auth-scroll">
        <div class="auth-logo"><gp-logo [height]="52" /></div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="gp-field" [class.err]="invalid('email')">
            <input
              class="gp-input"
              type="email"
              inputmode="email"
              placeholder="Имейл адрес"
              formControlName="email"
              autocomplete="email"
            />
            @if (invalid('email')) {
              <div class="errmsg">
                <gp-icon name="close" [size]="13" [sw]="2.5" />Невалиден имейл адрес
              </div>
            }
          </div>

          <div class="gp-field" [class.err]="invalid('password')">
            <div class="relative">
              <input
                class="gp-input"
                [type]="showPw() ? 'text' : 'password'"
                placeholder="Парола"
                formControlName="password"
                autocomplete="current-password"
              />
              <button type="button" class="eye-btn" (click)="showPw.set(!showPw())" tabindex="-1">
                <gp-icon [name]="showPw() ? 'eye' : 'eyeoff'" [size]="20" />
              </button>
            </div>
            @if (invalid('password')) {
              <div class="errmsg">
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
      .auth-bg {
        position: absolute;
        right: -10%;
        bottom: -6%;
        width: 75%;
        height: 48%;
        z-index: 1;
        pointer-events: none;
      }
      .auth-scroll {
        position: relative;
        z-index: 2;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: 420px;
        margin: 0 auto;
        padding: 64px 24px 24px;
      }
      .auth-logo {
        display: flex;
        justify-content: center;
        margin: 0 0 40px;
      }
      .relative {
        position: relative;
      }
      .eye-btn {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-ink-3);
        display: grid;
        place-items: center;
        padding: 4px;
      }
      .auth-cta-sub {
        text-align: center;
        color: var(--color-ink-2);
        font-size: 14px;
        line-height: 2;
        margin: var(--s4) 0 var(--s5);
      }
      .auth-cta-sub a {
        color: var(--color-ink);
        font-weight: 700;
        border-bottom: 2px solid var(--color-accent);
        cursor: pointer;
      }
      .auth-guest {
        margin: var(--s5) auto 0;
        color: var(--color-ink-2);
        font-weight: 600;
        font-size: 14.5px;
        padding: 8px;
        background: none;
        border: none;
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
