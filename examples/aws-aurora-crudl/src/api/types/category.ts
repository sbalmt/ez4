import type { Validation } from '@ez4/validation';
import type { String } from '@ez4/schema';
import type { CategoryExists } from '../validations/category';

export type NewItemCategory = {
  /**
   * @description Category name.
   */
  name: String.Size<1, 32>;

  /**
   * @description Category description.
   */
  description?: String.Size<1, 128>;
};

export type SetItemCategory = {
  /**
   * @description Id of an existing category.
   */
  category_id: String.UUID & Validation.Use<CategoryExists>;
};
