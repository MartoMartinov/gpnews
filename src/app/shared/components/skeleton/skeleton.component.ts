import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Shimmer placeholder block. Maps to the prototype's `Skeleton`. */
@Component({
  selector: 'gp-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gp-skel" [style]="boxStyle()"></div>`,
  styles: [':host { display: block; }'],
})
export class SkeletonComponent {
  readonly w = input<string | number>('100%');
  readonly h = input<string | number>(16);
  readonly r = input<number>(8);

  protected readonly boxStyle = computed(() => {
    const toCss = (v: string | number) => (typeof v === 'number' ? `${v}px` : v);
    return `width:${toCss(this.w())};height:${toCss(this.h())};border-radius:${this.r()}px`;
  });
}
