import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'gp-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gp-skel" [style]="boxStyle()"></div>`,
  styles: [':host { display: block; }'],
})
export class SkeletonComponent {
  readonly width = input<string | number>('100%');
  readonly height = input<string | number>(16);
  readonly radius = input<number>(8);

  protected readonly boxStyle = computed(() => {
    const toCss = (v: string | number) => (typeof v === 'number' ? `${v}px` : v);
    return `width:${toCss(this.width())};height:${toCss(this.height())};border-radius:${this.radius()}px`;
  });
}
