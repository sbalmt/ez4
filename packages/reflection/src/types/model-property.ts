import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type PropertyModifiers = {
  abstract?: boolean;
  override?: boolean;
  private?: boolean;
  protected?: boolean;
  public?: boolean;
};

export type ModelProperty = {
  type: TypeName.Property;
  name: string;
  description?: string;
  modifiers?: PropertyModifiers;
  value: EveryType;
};

/**
 * Determines whether or not the given type is a `property` type.
 *
 * @param type Type reflection object.
 */
export const isModelProperty = (type: AllType): type is ModelProperty => {
  return type.type === TypeName.Property;
};
