import type { String } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description String type enriched with constraints.
 */
export interface StringTestSchema {
  /**
   * @description String following any format.
   */
  any: String.Any;

  /**
   * @description String with minimum length.
   */
  min: String.Min<1>;

  /**
   * @description String with maximum length.
   */
  max: String.Max<80>;

  /**
   * @description String with minimum and maximum length.
   */
  size: String.Size<1, 80>;

  /**
   * @description Default string value.
   */
  default: String.Default<'foo'>;

  /**
   * @description String in upper-case.
   */
  upper: String.Upper;

  /**
   * @description String in lower-case.
   */
  lower: String.Lower;

  /**
   * @description String without white-spaces.
   */
  trim: String.Trim;

  /**
   * @description Literal string value.
   */
  literal: 'foo';

  /**
   * @description Compound string schemas.
   */
  compound: String.Size<1, 32> & String.Default<'foo'> & 'bar';
}
