import type { Validation } from '@ez4/validation';
import type { String } from '@ez4/schema';
import type { CategoryExists } from '../validations/category';

export type NewItemCategory = {
  /**
   * Category name.
   */
  name: String.Size<1, 32>;

  /**
   * Category description.
   */
  description?: String.Size<1, 128>;
};

export type SetItemCategory = {
  /**
   * Id of an existing category.
   */
  category_id: String.UUID & Validation.Use<CategoryExists>;
};
