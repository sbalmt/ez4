import type { AllType } from './common.js';
import type { EveryType } from './types.js';

import { TypeName } from './common.js';

export type TypeNull = {
  type: TypeName.Null;
  literal?: boolean;
  default?: boolean;
};

export type TypeNullEvents = {
  onTypeNull?: (type: TypeNull) => EveryType | null;
};

/**
 * Determines whether or not the given type is a `null` type.
 *
 * @param type Type reflection object.
 */
export const isTypeNull = (type: AllType): type is TypeNull => {
  return type.type === TypeName.Null;
};
