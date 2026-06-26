import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

type ChipTone = 'default' | 'accent' | 'warn' | 'ok';

/** Small status chip / tag. Maps to the prototype's `Chip`. */
@Component({
  selector: 'gp-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span [class]="classes()">
      @if (icon()) {
        <gp-icon [name]="icon()!" [size]="13" [sw]="2" />
      }
      <ng-content />
    </span>
  `,
  styles: [':host { display: inline-flex; }'],
})
export class ChipComponent {
  readonly tone = input<ChipTone>('default');
  readonly icon = input<string | null>(null);

  protected readonly classes = computed(() => `gp-chip tone-${this.tone()}`);
}
