import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Empty-state block: icon + title + text + optional projected action. */
@Component({
  selector: 'gp-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="gp-empty">
      <div class="gp-empty-ico"><gp-icon [name]="icon()" [size]="30" [sw]="1.6" /></div>
      <div class="gp-empty-title">{{ title() }}</div>
      @if (text()) {
        <div class="gp-empty-text">{{ text() }}</div>
      }
      <ng-content />
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class EmptyStateComponent {
  readonly icon = input<string>('comment');
  readonly title = input.required<string>();
  readonly text = input<string | null>(null);
}
