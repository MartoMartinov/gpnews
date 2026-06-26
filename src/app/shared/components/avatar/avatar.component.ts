import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { User } from '../../models';

/** Initials avatar with an official (accent) variant. */
@Component({
  selector: 'gp-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gp-avatar" [class.is-official]="user()?.official" [style]="boxStyle()">
      {{ user()?.initials || '?' }}
    </div>
  `,
  styles: [':host { display: inline-flex; }'],
})
export class AvatarComponent {
  readonly user = input<User | null>(null);
  readonly size = input<number>(38);

  protected readonly boxStyle = computed(() => {
    const s = this.size();
    return `width:${s}px;height:${s}px;font-size:${s * 0.38}px`;
  });
}
