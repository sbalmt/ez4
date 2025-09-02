import type { AllType } from './common';
import type { EveryType } from './types';

import { TypeName } from './common';

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
