import type { String } from '@ez4/schema';
import type { ItemTagType } from '../../schemas/item';

export type NewItemTag = {
  /**
   * @description Item tag label.
   */
  label: String.Size<1, 32>;

  /**
   * @description Item tag type.
   */
  type: ItemTagType;
};
