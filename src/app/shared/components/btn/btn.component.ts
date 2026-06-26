import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

type BtnVariant = 'primary' | 'dark' | 'ghost' | 'outline';
type BtnSize = 'sm' | 'md' | 'lg';

/** Shared button. Maps to the prototype's `Btn` (Direction A). */
@Component({
  selector: 'gp-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      (click)="pressed.emit($event)"
    >
      @if (loading()) {
        <span class="gp-spin"></span>
      } @else if (icon()) {
        <gp-icon [name]="icon()!" [size]="size() === 'sm' ? 16 : 19" [sw]="2" />
      }
      <span><ng-content /></span>
    </button>
  `,
  styles: [':host { display: contents; }'],
})
export class BtnComponent {
  readonly variant = input<BtnVariant>('primary');
  readonly size = input<BtnSize>('md');
  readonly icon = input<string | null>(null);
  readonly full = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'button' | 'submit'>('button');

  readonly pressed = output<MouseEvent>();

  protected readonly classes = computed(
    () => `gp-btn v-${this.variant()} s-${this.size()}` + (this.full() ? ' full' : ''),
  );
}
