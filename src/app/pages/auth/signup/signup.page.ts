import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { IONIC_IMPORTS } from '../../../shared/ionic-imports';
import {
  BlueprintComponent,
  BtnComponent,
  GpLogoComponent,
  IconComponent,
} from '../../../shared/components';
import { AuthStore } from '../../../store/auth/auth.store';

/** Cross-field: confirm must match password. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pw === confirm ? null : { mismatch: true };
}

/** Registration form. */
@Component({
  selector: 'app-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IONIC_IMPORTS,
    ReactiveFormsModule,
    BlueprintComponent,
    BtnComponent,
    GpLogoComponent,
    IconComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-bg"><gp-blueprint [opacity]="0.4" /></div>
      <div class="auth-scroll">
        <button class="auth-back" (click)="back()" aria-label="Назад">
          <gp-icon name="back" [size]="22" />
        </button>
        <div class="auth-logo sm"><gp-logo [height]="40" /></div>
        <h1 class="auth-h1">Регистрация</h1>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="gp-field" [class.err]="invalid('name')">
            <input class="gp-input" placeholder="Име и фамилия" formControlName="name" autocomplete="name" />
            @if (invalid('name')) {
              <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />Въведи име и фамилия</div>
            }
          </div>

          <div class="gp-field" [class.err]="invalid('email')">
            <input class="gp-input" type="email" inputmode="email" placeholder="Имейл адрес"
              formControlName="email" autocomplete="email" />
            @if (invalid('email')) {
              <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />Невалиден имейл адрес</div>
            }
          </div>

          <div class="gp-field" [class.err]="invalid('password')">
            <div class="gp-input-wrap">
              <input class="gp-input" [type]="showPw() ? 'text' : 'password'" placeholder="Парола"
                formControlName="password" autocomplete="new-password" />
              <button type="button" class="eye-btn" (click)="showPw.set(!showPw())" tabindex="-1">
                <gp-icon [name]="showPw() ? 'eye' : 'eyeoff'" [size]="20" />
              </button>
            </div>
            @if (invalid('password')) {
              <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />Минимум 6 символа</div>
            }
          </div>

          <div class="gp-field" [class.err]="confirmInvalid()">
            <div class="gp-input-wrap">
              <input class="gp-input" [type]="showPw2() ? 'text' : 'password'" placeholder="Повтори паролата"
                formControlName="confirm" autocomplete="new-password" />
              <button type="button" class="eye-btn" (click)="showPw2.set(!showPw2())" tabindex="-1">
                <gp-icon [name]="showPw2() ? 'eye' : 'eyeoff'" [size]="20" />
              </button>
            </div>
            @if (confirmInvalid()) {
              <div class="errmsg"><gp-icon name="close" [size]="13" [sw]="2.5" />Паролите не съвпадат</div>
            }
          </div>

          <p class="auth-cta-sub">
            Имаш регистрация? <a (click)="back()">Влез от тук.</a>
          </p>

          <gp-btn variant="primary" size="lg" [full]="true" type="submit" [loading]="store.isPending()">
            Регистрация
          </gp-btn>
        </form>
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
export class SignupPage {
  protected readonly store = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);

  protected readonly showPw = signal(false);
  protected readonly showPw2 = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected invalid(name: 'name' | 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected confirmInvalid(): boolean {
    const c = this.form.controls.confirm;
    return (this.form.hasError('mismatch') || c.invalid) && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.store.register({ name, email, password });
  }

  back(): void {
    this.location.back();
  }
}
