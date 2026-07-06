/** A news category (construction-industry section). */
export interface Category {
  id: string;
  /** Bulgarian display name. */
  name: string;
  /** Icon key into the shared icon set. */
  icon: string;
  /** Hue (0–360) used to tint image placeholders. */
  hue: number;
  /** Total published article count in this category (returned by the list endpoint). */
  count?: number;
}
